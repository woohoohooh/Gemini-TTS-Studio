/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API route for TTS with multi-model fallback (Free Tier TTS models only)
const TTS_MODELS = [
  'gemini-3.1-flash-tts-preview', // 1-й приоритет: быстрая флагманская TTS
  'gemini-2.5-flash-preview-tts', // 2-й приоритет: проверенная Flash TTS
  'gemini-2.5-pro-preview-tts',   // 3-й приоритет: Pro-версия TTS
];

function isRateLimitOrQuotaError(err: any): boolean {
  const msg = (err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err))).toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('retry in') ||
    msg.includes('too many requests') ||
    msg.includes('exceeded your current quota')
  );
}

app.post('/api/tts', async (req, res) => {
  const { text, voice, instruction } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not defined.' });
  }

  const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
  const finalVoice = (voice && validVoices.includes(voice)) ? voice : 'Zephyr';

  const prompt = instruction ? `${instruction}\n\nDeliver the following text: ${text}` : text;

  let base64Audio: string | null = null;
  let lastError: any = null;

  // Two-pass cascade (pass 1 and pass 2)
  for (let pass = 1; pass <= 2; pass++) {
    console.log(`[TTS] Starting Pass ${pass} across TTS models...`);
    let passEncounteredQuota = false;

    for (const currentModel of TTS_MODELS) {
      console.log(`[TTS] (Pass ${pass}) Trying model: ${currentModel} (voice: ${finalVoice})`);
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: finalVoice },
              },
            },
          },
        });

        const audioData = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioData) {
          base64Audio = audioData;
          console.log(`[TTS] Succeeded with model: ${currentModel} on pass ${pass}`);
          break;
        }
      } catch (error: any) {
        console.warn(`[TTS] Model ${currentModel} on pass ${pass} error:`, error?.message || error);
        lastError = error;

        if (isRateLimitOrQuotaError(error)) {
          passEncounteredQuota = true;
          console.warn(`[TTS] Rate limit / quota reached for ${currentModel}. Immediately continuing to next model...`);
          continue;
        }
        continue;
      }
    }

    if (base64Audio) {
      break;
    }

    // If pass 1 finished without audio and encountered quota or errors, pause 2.5s before pass 2
    if (pass === 1 && !base64Audio) {
      console.log('[TTS] Pass 1 completed without audio. Waiting 2.5s for quota window before Pass 2...');
      await new Promise((r) => setTimeout(r, 2500));
    }
  }

  if (base64Audio) {
    return res.json({ data: base64Audio });
  }

  console.error('All TTS models failed across 2 passes. Last error:', lastError);
  const errorMessage = lastError?.message || (typeof lastError === 'object' ? JSON.stringify(lastError) : String(lastError));
  return res.status(500).json({ error: errorMessage || 'Failed to generate speech with all available models' });
});

// API route for Multi-Speaker TTS with multi-model fallback
app.post('/api/multi-tts', async (req, res) => {
  const { text, speakers, instruction } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not defined.' });
  }

  const prompt = `TTS the following conversation:${instruction ? '\nInstruction: ' + instruction : ''}\n\n${text}`;

  const speakerVoiceConfigs = (speakers || []).map((s: any) => ({
    speaker: s.name,
    voiceConfig: {
      prebuiltVoiceConfig: { voiceName: s.voiceName }
    }
  }));

  let lastError: any = null;
  for (let modelIdx = 0; modelIdx < TTS_MODELS.length; modelIdx++) {
    const currentModel = TTS_MODELS[modelIdx];
    try {
      console.log(`[Multi-TTS] Trying model (${modelIdx + 1}/${TTS_MODELS.length}): ${currentModel}`);
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: speakerVoiceConfigs
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({ data: base64Audio });
      }
    } catch (error: any) {
      console.warn(`[Multi-TTS] Model ${currentModel} failed:`, error.message || error);
      lastError = error;
    }
  }

  return res.status(500).json({ error: lastError?.message || 'Failed to generate multi-speaker TTS on all models' });
});

// API route to analyze audio timestamps for alignment
app.post('/api/analyze-audio-timestamps', async (req, res) => {
  const { base64Audio, dialogueText } = req.body;

  if (!base64Audio || !dialogueText) {
    return res.status(400).json({ error: 'Both base64Audio and dialogueText are required.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not defined.' });
  }

  try {
    const audioPart = {
      inlineData: {
        data: base64Audio,
        mimeType: "audio/wav"
      }
    };

    const textPart = {
      text: `You are an expert audio alignment assistant.
Analyze the provided audio conversation and the original script text.
For each numbered dialogue line in the original script text, determine the precise start and end times (in seconds) of when that line in the script is spoken in the audio.

Original script:
${dialogueText}

Output the aligned timestamps matching the required JSON schema.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [audioPart, textPart],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  line_number: {
                    type: Type.INTEGER,
                    description: "The 1-based index number of the line"
                  },
                  speaker: {
                    type: Type.STRING,
                    description: "The name of the speaker"
                  },
                  text: {
                    type: Type.STRING,
                    description: "The text of this line"
                  },
                  start_seconds: {
                    type: Type.NUMBER,
                    description: "The start timestamp of speech in seconds"
                  },
                  end_seconds: {
                    type: Type.NUMBER,
                    description: "The end timestamp of speech in seconds"
                  }
                },
                required: ["line_number", "speaker", "text", "start_seconds", "end_seconds"]
              }
            }
          },
          required: ["segments"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      return res.status(500).json({ error: 'No response text returned by Gemini' });
    }

    try {
      const parsed = JSON.parse(textOutput);
      return res.json(parsed);
    } catch (parseErr: any) {
      console.error('Failed to parse Gemini response as JSON. Response:', textOutput);
      return res.status(500).json({ error: 'Failed to parse alignment response', details: textOutput });
    }
  } catch (error: any) {
    console.error('Timestamp analysis failed:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze timestamps' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
