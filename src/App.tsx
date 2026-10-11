/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PlusCircle,
  Sparkles,
  Eraser,
  Trash2,
  Timer,
  Loader2,
  Play,
  Pause,
  Download,
  ArrowLeft,
  RotateCcw,
  Mic2,
  Settings,
  ListMusic,
  Headphones,
  EyeOff,
  Palette,
  Type,
  Check,
  SlidersHorizontal,
  X,
  LayoutTemplate,
  Pipette,
  User,
  Monitor,
  Smartphone,
  Maximize,
  Minimize,
  ThumbsUp,
  Heart,
  Bell,
  Bookmark,
  Copy,
  Eye,
  Globe,
  AlertTriangle,
} from "lucide-react";
import {
  DialogueLine,
  MatrixState,
  VOICES,
  VOICES_WITH_ALL,
  PROJECT_COOLDOWN_SEC,
  PODCAST_INSTRUCTIONS,
  WORD_INSTRUCTIONS,
  AVAILABLE_FONTS,
  FONT_MAPPING,
} from "./types";
import { generateTTS } from "./geminiService";
import { formatCountdown } from "./utils";

import { get, set, clear } from "idb-keyval";

const CustomQRCode = () => (
  <svg
    width="44"
    height="44"
    viewBox="0 0 29 29"
    fill="none"
    className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
  >
    <rect
      x="1"
      y="1"
      width="7"
      height="7"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect x="3" y="3" width="3" height="3" fill="currentColor" />
    <rect
      x="21"
      y="1"
      width="7"
      height="7"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect x="23" y="3" width="3" height="3" fill="currentColor" />
    <rect
      x="1"
      y="21"
      width="7"
      height="7"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect x="3" y="23" width="3" height="3" fill="currentColor" />
    <rect x="11" y="4" width="2" height="2" fill="currentColor" />
    <rect x="15" y="2" width="2" height="2" fill="currentColor" />
    <rect x="15" y="6" width="2" height="2" fill="currentColor" />
    <rect x="11" y="10" width="2" height="2" fill="currentColor" />
    <rect x="4" y="11" width="2" height="2" fill="currentColor" />
    <rect x="1" y="15" width="2" height="2" fill="currentColor" />
    <rect x="23" y="11" width="2" height="2" fill="currentColor" />
    <rect x="21" y="15" width="2" height="2" fill="currentColor" />
    <rect x="25" y="15" width="2" height="2" fill="currentColor" />
    <rect
      x="10"
      y="14"
      width="5"
      height="5"
      stroke="currentColor"
      strokeWidth="1"
    />
    <rect x="12" y="16" width="1" height="1" fill="currentColor" />
    <rect x="11" y="23" width="2" height="2" fill="currentColor" />
    <rect x="15" y="21" width="2" height="2" fill="currentColor" />
    <rect x="15" y="25" width="2" height="2" fill="currentColor" />
    <rect x="23" y="21" width="2" height="2" fill="currentColor" />
    <rect x="21" y="23" width="2" height="2" fill="currentColor" />
    <rect x="25" y="25" width="2" height="2" fill="currentColor" />
  </svg>
);

const SketchedArrow = ({
  delay = 0,
  side = "straight",
  length = 35,
  strokeWidth = 2,
  topOffset = 6,
}: {
  delay?: number;
  side?: "left" | "right" | "straight";
  length?: number;
  strokeWidth?: number;
  topOffset?: number;
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!isReady) return null;

  let path = `M 0,0 Q 12,${length * 0.4} 10,${length}`;
  let head = `M 3,${length - 7} L 10,${length} L 17,${length - 7}`;

  if (side === "left") {
    path = `M 0,0 Q -12,${length * 0.4} -10,${length}`;
    head = `M -17,${length - 7} L -10,${length} L -3,${length - 7}`;
  } else if (side === "straight") {
    path = `M 0,0 L 0,${length}`;
    head = `M -7,${length - 7} L 0,${length} L 7,${length - 7}`;
  }

  // Double head width/scaling dynamically for thicker arrows to maintain perfect outline proportions
  const headSize = Math.max(7, strokeWidth * 3.5);
  if (side === "left") {
    head = `M ${-10 - headSize},${length - headSize} L -10,${length} L ${-10 + headSize},${length - headSize}`;
  } else if (side === "straight") {
    head = `M ${-headSize},${length - headSize} L 0,${length} L ${headSize},${length - headSize}`;
  } else {
    head = `M ${10 - headSize},${length - headSize} L 10,${length} L ${10 + headSize},${length - headSize}`;
  }

  return (
    <svg
      width="120"
      height={length + 30}
      viewBox={`-60 0 120 ${length + 30}`}
      fill="none"
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none overflow-visible z-20"
      style={{ top: `calc(100% + ${topOffset}px)` }}
    >
      <motion.path
        d={path}
        stroke="white"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.7, ease: "easeOut" },
          opacity: { duration: 0.15 }
        }}
      />
      <motion.path
        d={head}
        stroke="white"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { delay: 0.5, duration: 0.3, ease: "easeOut" },
          opacity: { delay: 0.5, duration: 0.08 }
        }}
      />
    </svg>
  );
};

const LineControl = ({
  line,
  state,
  onGenerate,
  onPlay,
  isQueueRunning,
  isSelected,
  onToggleSelect,
}: any) => (
  <div
    className={`flex flex-col gap-2 p-4 bg-white/5 border rounded-2xl hover:bg-white/10 transition-all group backdrop-blur-sm shadow-xl ${
      isSelected ? "border-green-500/50 bg-green-500/10" : "border-white/10 hover:border-white/20"
    }`}
  >
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          type="button"
          onClick={onToggleSelect}
          className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-black text-base transition-all cursor-pointer select-none border shadow-md active:scale-95 ${
            isSelected
              ? "bg-green-500 border-green-400 text-white shadow-green-500/30 scale-105"
              : state.status === "done"
              ? "bg-blue-500/20 border-blue-500/40 text-white hover:bg-blue-500/30"
              : "bg-white/10 border-white/20 text-white hover:bg-white/20"
          }`}
          title="Click to select line for copying"
        >
          {isSelected ? (
            <Check size={22} className="stroke-[3] text-white" />
          ) : (
            <span className="text-white font-extrabold text-base tracking-tight">
              {line.displayIndex}
            </span>
          )}
        </button>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              {line.speaker}
            </span>
            {line.translation && (
              <span className="text-[11px] text-slate-400 font-medium">
                — {line.translation}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-200 leading-relaxed break-words">{line.text}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {state.status === "done" ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onPlay}
              className="px-3.5 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-green-500/20 active:scale-95 cursor-pointer"
              title="Play line audio"
            >
              <Play size={16} fill="currentColor" />
              <span>PLAY</span>
            </button>

            <button
              type="button"
              onClick={onGenerate}
              disabled={isQueueRunning}
              title="Regenerate audio"
              className="p-2 text-neutral-400 hover:text-orange-400 hover:bg-orange-400/10 rounded-xl transition-all cursor-pointer disabled:opacity-30"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onGenerate}
            disabled={state.status === "generating" || isQueueRunning}
            className={`rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 ${
              state.status === "generating"
                ? state.error
                  ? "px-3 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait"
                  : "p-2.5 bg-white/10 text-white cursor-wait"
                : state.status === "error"
                ? "px-3 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
                : "p-2.5 bg-white text-black hover:bg-blue-50"
            }`}
            title={
              state.status === "generating"
                ? state.error || "Generating..."
                : state.status === "error"
                ? "Retry API Generation"
                : "Generate Audio"
            }
          >
            {state.status === "generating" ? (
              <>
                <Loader2 size={16} className="animate-spin text-current" />
                {state.error && <span className="text-[11px] font-medium">{state.error}</span>}
              </>
            ) : state.status === "error" ? (
              <>
                <RotateCcw size={16} />
                <span>API</span>
              </>
            ) : (
              <Play size={18} fill="currentColor" />
            )}
          </button>
        )}
      </div>
    </div>
  </div>
);

const getDialogueCachedKey = (skuVal: string, lineId: string) => {
  return `podcast_state_${skuVal || "global"}_${lineId}`;
};

const getSkuForLine = (line?: DialogueLine | null, globalSku?: string) => {
  return (line && line.sku) ? line.sku : (globalSku || "global");
};

const getCustomAudioKey = (skuVal: string, filename: string) => {
  return `podcast_custom_audio_${skuVal || "global"}_${filename}`;
};

const parseInputToDialogue = (
  raw: string,
  currentSku: string,
  preset: "podcast" | "word",
  voicesConfig: Record<string, string>,
  selectedWordVoice: string,
): { lines: DialogueLine[]; extractedSku?: string } => {
  if (!raw.trim()) return { lines: [] };

  let detectedSku = currentSku;

  interface RawItem {
    sku?: string;
    displayIndex: number;
    speaker?: string;
    text: string;
    translation?: string;
  }

  const rawItems: RawItem[] = [];
  let itemCounter = 0;

  // 1. Check if raw input is JSON (also handles markdown ```json ... ``` wrapper)
  let trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    trimmed = trimmed
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "")
      .trim();
  }

  let isJson = false;
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      const parsedData = JSON.parse(trimmed);
      isJson = true;

      let itemsList: any[] = [];
      if (Array.isArray(parsedData)) {
        itemsList = parsedData;
      } else if (parsedData && typeof parsedData === "object") {
        if (parsedData.sku) detectedSku = String(parsedData.sku).trim();
        else if (parsedData.article) detectedSku = String(parsedData.article).trim();

        // Check common array container keys
        const candidateKeys = [
          "items",
          "words",
          "list",
          "dialogue",
          "vocabulary",
          "cards",
          "lines",
          "terms",
          "entries",
          "data",
        ];
        for (const k of candidateKeys) {
          if (Array.isArray(parsedData[k])) {
            itemsList = parsedData[k];
            break;
          }
        }

        // If no candidate key matched, search all object values for the first array
        if (itemsList.length === 0) {
          for (const val of Object.values(parsedData)) {
            if (Array.isArray(val)) {
              itemsList = val;
              break;
            }
          }
        }
      }

      itemsList.forEach((item) => {
        itemCounter++;
        let text = "";
        let lineSku: string | undefined = undefined;
        let displayIndex = itemCounter;
        let speaker: string | undefined = undefined;
        let translation: string | undefined = undefined;

        if (typeof item === "string") {
          text = item.trim();
        } else if (item && typeof item === "object") {
          // Priority for english words / text
          text = (
            item.english ??
            item.word ??
            item.text ??
            item.term ??
            item.phrase ??
            item.value ??
            item.name ??
            item.id ??
            ""
          )
            .toString()
            .trim();

          if (item.translation) {
            translation = String(item.translation).trim();
          } else if (item.translate) {
            translation = String(item.translate).trim();
          } else if (item.meaning) {
            translation = String(item.meaning).trim();
          } else if (item.definition) {
            translation = String(item.definition).trim();
          }

          if (item.sku) lineSku = String(item.sku).trim();
          if (item.speaker || item.voice) {
            speaker = String(item.speaker || item.voice).trim();
          }

          if (item.displayIndex !== undefined && !isNaN(Number(item.displayIndex))) {
            displayIndex = Number(item.displayIndex);
          } else if (item.index !== undefined && !isNaN(Number(item.index))) {
            displayIndex = Number(item.index);
          } else if (item.num !== undefined && !isNaN(Number(item.num))) {
            displayIndex = Number(item.num);
          } else if (item.order !== undefined && !isNaN(Number(item.order))) {
            displayIndex = Number(item.order);
          }
        }

        // Clean wrapping quotes
        text = text.replace(/^["'«“](.*)["'»”]$/, "$1").trim();
        if (text) {
          rawItems.push({
            sku: lineSku,
            displayIndex,
            speaker,
            text,
            translation,
          });
        }
      });
    } catch {
      // Fallback to line-by-line if JSON parsing fails
      isJson = false;
    }
  }

  // 2. If not JSON, parse plain text line-by-line
  if (!isJson) {
    const allLines = raw.split(/\r?\n/);

    for (const rawLine of allLines) {
      const l = rawLine.trim();
      if (!l) continue;

      // Check for header metadata: SKU / Article
      const skuMatch = l.match(/^(?:артикул|sku|article)\s*[:：]\s*(.+)$/i);
      if (skuMatch) {
        const parsed = skuMatch[1].trim().replace(/[\r\n\s.]+$/, "");
        if (parsed) detectedSku = parsed;
        continue;
      }

      // Skip metadata headers
      if (/^(?:уровень|level|топик|topic|тема|theme)\s*[:：]/i.test(l)) {
        continue;
      }

      itemCounter++;
      let lineSku: string | undefined = undefined;
      let displayIndex = itemCounter;
      let speaker: string | undefined = undefined;
      let text = "";

      // Check for leading SKU / index: "123-1. ...", "1. ...", "1) ...", "1 - ...", "1: ..."
      const leadingIndexMatch = l.match(
        /^(?:([a-zA-Z0-9_-]+)[-–—])?(\d+)[.)\s\-–—:]+\s*(.*)$/,
      );
      let remainder = l;

      if (leadingIndexMatch) {
        lineSku = leadingIndexMatch[1];
        displayIndex = parseInt(leadingIndexMatch[2], 10);
        remainder = leadingIndexMatch[3].trim();
      }

      // Check if remainder has speaker or label before colon: "Emma: ...", "Word: ..."
      const colonIdx = remainder.indexOf(":");
      if (colonIdx !== -1) {
        const potentialSpeaker = remainder.substring(0, colonIdx).trim();
        const content = remainder.substring(colonIdx + 1).trim();

        if (/^(?:word|слово)$/i.test(potentialSpeaker)) {
          text = content;
        } else if (content) {
          speaker = potentialSpeaker;
          text = content;
        } else {
          text = potentialSpeaker;
        }
      } else {
        text = remainder;
      }

      // Clean up wrapping quotation marks
      text = text.replace(/^["'«“](.*)["'»”]$/, "$1").trim();
      if (!text) continue;

      rawItems.push({
        sku: lineSku,
        displayIndex,
        speaker,
        text,
      });
    }
  }

  if (rawItems.length === 0) return { lines: [], extractedSku: detectedSku };

  const ALL_VOICE_LIST = ["Charon", "Zephyr", "Puck", "Fenrir", "Kore"];
  const result: DialogueLine[] = [];

  rawItems.forEach((item, itemIdx) => {
    // Check if we should generate for ALL voices in sequence:
    const isAllVoices =
      preset === "word"
        ? selectedWordVoice === "All" || item.speaker === "All"
        : item.speaker === "All" ||
          (item.speaker && voicesConfig[item.speaker] === "All");

    if (isAllVoices) {
      ALL_VOICE_LIST.forEach((v) => {
        result.push({
          id: `line-${itemIdx}-${item.displayIndex}-${v}`,
          speaker: v,
          voice: v,
          text: item.text,
          translation: item.translation,
          displayIndex: item.displayIndex,
          sku: item.sku || (detectedSku !== "global" ? detectedSku : undefined),
        });
      });
    } else {
      let voiceForLine: string | undefined = undefined;
      let speakerForLine = item.speaker;

      if (preset === "word") {
        if (selectedWordVoice && selectedWordVoice !== "All") {
          voiceForLine = selectedWordVoice;
          speakerForLine = selectedWordVoice;
        } else {
          speakerForLine = item.speaker || "Charon";
          voiceForLine = voicesConfig[speakerForLine] || speakerForLine;
        }
      } else {
        // Podcast mode
        if (!speakerForLine) {
          speakerForLine = itemIdx % 2 === 0 ? "Emma" : "Ethan";
        }
        voiceForLine =
          voicesConfig[speakerForLine] ||
          (speakerForLine === "Emma" ? "Zephyr" : "Charon");
      }

      result.push({
        id: `line-${itemIdx}-${item.displayIndex}`,
        speaker: speakerForLine,
        voice: voiceForLine,
        text: item.text,
        translation: item.translation,
        displayIndex: item.displayIndex,
        sku: item.sku || (detectedSku !== "global" ? detectedSku : undefined),
      });
    }
  });

  return { lines: result, extractedSku: detectedSku };
};

export default function App() {
  const [view, setView] = useState<"input" | "setup" | "generating" | "video">(
    "input",
  );
  const [rawText, setRawText] = useState(() => {
    const saved = localStorage.getItem("podcast_raw_text");
    const oldRussianDefault =
      "уровень: Beginner\nтопик: Частые слова (база)\nтема: Introducing Yourself and Your Family\n\n1. Emma: Hello everyone! Welcome to our English Podcast.\n2. Ethan: Yes, welcome! Today we are talking about introducing yourself and your family.\n3. Emma: This is a classic topic for beginners. Let's get started!";
    const americanEnglishDefault =
      "Level: Beginner\nTopic: Common Words (Core)\nTheme: Introducing Yourself and Your Family\n\n1. Emma: Hello everyone! Welcome to our English Podcast.\n2. Ethan: Yes, welcome! Today we are talking about introducing yourself and your family.\n3. Emma: This is a classic topic for beginners. Let's get started!";
    if (!saved || saved.trim() === oldRussianDefault.trim()) {
      return americanEnglishDefault;
    }
    return saved;
  });
  const [sku, setSku] = useState("global");

  useEffect(() => {
    const trimmed = rawText.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        const obj = JSON.parse(trimmed);
        if (obj && typeof obj === "object" && !Array.isArray(obj)) {
          const parsedSku = obj.sku || obj.article;
          if (parsedSku) {
            const clean = String(parsedSku).trim();
            if (clean && clean !== sku) {
              setSku(clean);
              localStorage.setItem("podcast_sku", clean);
              return;
            }
          }
        }
      } catch {}
    }

    const matchSku = rawText.match(/^(?:артикул|sku|article)\s*[:：]\s*(.+)$/im);
    if (matchSku) {
      const parsedSku = matchSku[1].trim().replace(/[\r\n\s.]+$/, "");
      if (parsedSku && parsedSku !== sku) {
        setSku(parsedSku);
        localStorage.setItem("podcast_sku", parsedSku);
      }
    }
  }, [rawText, sku]);
  const [activePreset, setActivePreset] = useState<"podcast" | "word">(() => {
    return (
      (localStorage.getItem("tts_active_preset") as "podcast" | "word") ||
      "podcast"
    );
  });
  const activePresetRef = useRef<"podcast" | "word">(activePreset);
  useEffect(() => {
    activePresetRef.current = activePreset;
    localStorage.setItem("tts_active_preset", activePreset);
  }, [activePreset]);

  const [voiceInstructions, setVoiceInstructions] = useState(() => {
    return (
      localStorage.getItem("tts_podcast_instructions") || PODCAST_INSTRUCTIONS
    );
  });
  const voiceInstructionsRef = useRef<string>(voiceInstructions);
  useEffect(() => {
    voiceInstructionsRef.current = voiceInstructions;
    localStorage.setItem("tts_podcast_instructions", voiceInstructions);
  }, [voiceInstructions]);

  const [wordInstructions, setWordInstructions] = useState(() => {
    return (
      localStorage.getItem("tts_word_instructions") || WORD_INSTRUCTIONS
    );
  });
  const wordInstructionsRef = useRef<string>(wordInstructions);
  useEffect(() => {
    wordInstructionsRef.current = wordInstructions;
    localStorage.setItem("tts_word_instructions", wordInstructions);
  }, [wordInstructions]);

  const [wordVoice, setWordVoice] = useState(() => {
    return localStorage.getItem("tts_word_voice") || "All";
  });
  const wordVoiceRef = useRef<string>(wordVoice);
  useEffect(() => {
    wordVoiceRef.current = wordVoice;
    localStorage.setItem("tts_word_voice", wordVoice);
  }, [wordVoice]);
  const [dialogue, setDialogue] = useState<DialogueLine[]>([]);
  const dialogueRef = useRef<DialogueLine[]>([]);
  const [speakerVoices, setSpeakerVoices] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("podcast_voices");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length > 0) return parsed;
      }
    } catch (e) {}
    return {
      Ethan: "Charon",
      Emma: "Zephyr",
    };
  });
  const speakerVoicesRef = useRef<Record<string, string>>({
    Ethan: "Charon",
    Emma: "Zephyr",
  });

  useEffect(() => {
    speakerVoicesRef.current = speakerVoices;
  }, [speakerVoices]);
  const [states, setStates] = useState<MatrixState>({});
  const [selectedLineIds, setSelectedLineIds] = useState<Set<string>>(new Set());

  const copyLinesToClipboard = (selectedIds: Set<string>) => {
    if (selectedIds.size === 0) return;

    const linesToCopy = dialogue.filter((l) => selectedIds.has(l.id));
    if (linesToCopy.length === 0) return;

    const formattedText = linesToCopy
      .map((l) => {
        const lineSku = l.sku || sku || "";
        const skuPart = lineSku ? `${lineSku}-` : "";
        return `${skuPart}${l.displayIndex}. ${l.speaker}: ${l.text}`;
      })
      .join("\n");

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(formattedText).catch(() => {});
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = formattedText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
    } catch (err) {
      console.error("Auto copy error:", err);
    }
  };

  const toggleSelectLine = (id: string) => {
    setSelectedLineIds((prev) => {
      const next = new Set<string>(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      copyLinesToClipboard(next);
      return next;
    });
  };
  const [apiLimitDetected, setApiLimitDetected] = useState(false);
  const [showApiLimitsScreen, setShowApiLimitsScreen] = useState(false);
  const apiLimitTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const hasLimit = Object.values(states).some(
      (s: any) =>
        s.error === "API" ||
        (typeof s.error === "string" &&
          (s.error.includes("429") ||
            s.error.toLowerCase().includes("quota") ||
            s.error.toLowerCase().includes("resource_exhausted") ||
            s.error.toLowerCase().includes("permission_denied") ||
            s.error.includes("403")))
    );

    if (hasLimit) {
      setApiLimitDetected(true);
      setShowApiLimitsScreen(true);
      if (apiLimitTimerRef.current) {
        clearTimeout(apiLimitTimerRef.current);
        apiLimitTimerRef.current = null;
      }
    } else {
      setApiLimitDetected(false);
      setShowApiLimitsScreen(false);
      if (apiLimitTimerRef.current) {
        clearTimeout(apiLimitTimerRef.current);
        apiLimitTimerRef.current = null;
      }
    }
  }, [states]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });
  const [isStartActive, setIsStartActive] = useState(false);

  const updateDialogue = (d: DialogueLine[]) => {
    dialogueRef.current = d;
    setDialogue(d);
  };

  const updateSpeakerVoices = (v: Record<string, string>) => {
    speakerVoicesRef.current = v;
    setSpeakerVoices(v);
  };

  const [introFont, setIntroFont] = useState(() => {
    return localStorage.getItem("intro_font") || "Open Sans";
  });
  const [dialogueFont, setDialogueFont] = useState(() => {
    return localStorage.getItem("dialogue_font") || "Open Sans";
  });
  const [outroFont, setOutroFont] = useState(() => {
    return localStorage.getItem("outro_font") || "Open Sans";
  });

  const updateIntroFont = (font: string) => {
    setIntroFont(font);
    localStorage.setItem("intro_font", font);
  };
  const updateDialogueFont = (font: string) => {
    setDialogueFont(font);
    localStorage.setItem("dialogue_font", font);
  };
  const updateOutroFont = (font: string) => {
    setOutroFont(font);
    localStorage.setItem("outro_font", font);
  };

  // Video Player States
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [timingOffset, setTimingOffset] = useState(0); // ms offset for highlighting
  const [videoFormat, setVideoFormat] = useState<"landscape" | "portrait">(
    "landscape",
  );
  const [fontSize, setFontSize] = useState(5); // 1-10 scale
  const [hideUI, setHideUI] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [englishPodcastHuge, setEnglishPodcastHuge] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeAudioUrlRef = useRef<string | null>(null);

  const stopAndCleanupAudio = useCallback(() => {
    if (firstLineAudioDelayTimeoutRef.current) {
      clearTimeout(firstLineAudioDelayTimeoutRef.current);
      firstLineAudioDelayTimeoutRef.current = null;
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch (e) {
        console.warn("Failed to pause audio:", e);
      }
      audioRef.current.onended = null;
      audioRef.current.oncanplaythrough = null;
      audioRef.current = null;
    }
    if (activeAudioUrlRef.current) {
      try {
        URL.revokeObjectURL(activeAudioUrlRef.current);
      } catch (e) {
        console.warn("Failed to revoke object URL:", e);
      }
      activeAudioUrlRef.current = null;
    }
  }, []);

  const playUploadedAudio = async (
    filename: "save" | "subscribe" | "like" | "next",
  ) => {
    try {
      stopAndCleanupAudio();
      const data = await get(getCustomAudioKey(sku, filename));
      if (data && data.blob) {
        const url = URL.createObjectURL(data.blob);
        activeAudioUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          stopAndCleanupAudio();
        };
        audio
          .play()
          .catch((e) => console.error("Audio play blocked/failed:", e));
      } else {
        console.log(`No custom audio uploaded for ${filename}`);
      }
    } catch (err) {
      console.error(`Error playing custom audio ${filename}:`, err);
    }
  };
  const playbackTimerRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const [isPlaybackFinished, setIsPlaybackFinished] = useState(false);
  const [userLiked, setUserLiked] = useState(true);
  const [userSubscribed, setUserSubscribed] = useState(false);
  const [userSaved, setUserSaved] = useState(true);

  // Drawing States & Refs
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [drawings, setDrawings] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<any>(null);

  const isInteractiveElementAt = (clientX: number, clientY: number): HTMLElement | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const originalPointerEvents = canvas.style.pointerEvents;
    canvas.style.pointerEvents = "none";

    const element = document.elementFromPoint(clientX, clientY) as HTMLElement | null;

    canvas.style.pointerEvents = originalPointerEvents;

    if (!element) return null;

    let current: HTMLElement | null = element;
    while (current && current !== canvas.parentElement) {
      if (!current) break;
      const tagName = current.tagName.toLowerCase();
      const style = window.getComputedStyle(current);
      const isPointerAuto = style.pointerEvents !== "none";
      const hasPointerCursor = style.cursor === "pointer";
      const isButton = tagName === "button" || tagName === "a";
      const hasRoleButton = current.getAttribute("role") === "button";

      if (isPointerAuto && (isButton || hasRoleButton || hasPointerCursor)) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  };

  const startDrawing = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    isDrawingRef.current = true;
    currentStrokeRef.current = {
      points: [{ x, y }],
      isDot: true,
    };
    redrawCanvas();
  };

  const continueDrawing = (clientX: number, clientY: number) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    const points = currentStrokeRef.current.points;
    const firstPoint = points[0];
    const dx = (x - firstPoint.x) * rect.width;
    const dy = (y - firstPoint.y) * rect.height;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let isDot = currentStrokeRef.current.isDot;
    if (distance > 3) {
      isDot = false;
    }

    currentStrokeRef.current = {
      points: [...points, { x, y }],
      isDot,
    };
    redrawCanvas();
  };

  const endDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (currentStrokeRef.current) {
      const strokeSnap = currentStrokeRef.current;
      setDrawings((prev) => [...prev, strokeSnap]);
      currentStrokeRef.current = null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    const interactive = isInteractiveElementAt(e.clientX, e.clientY);
    if (interactive && typeof (interactive as any).click === "function") {
      (interactive as any).click();
      return;
    }
    startDrawing(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    continueDrawing(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    endDrawing();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    if (touch) {
      const interactive = isInteractiveElementAt(touch.clientX, touch.clientY);
      if (interactive && typeof (interactive as any).click === "function") {
        (interactive as any).click();
        return;
      }
      startDrawing(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    if (touch) {
      continueDrawing(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    endDrawing();
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#FFFFFF";
    ctx.fillStyle = "#FFFFFF";
    ctx.lineWidth = 10; // bold white brush!
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const allStrokes = [...drawings];
    if (currentStrokeRef.current) {
      allStrokes.push(currentStrokeRef.current);
    }

    for (const stroke of allStrokes) {
      if (!stroke || !stroke.points || stroke.points.length === 0) continue;

      if (stroke.isDot || stroke.points.length === 1) {
        const p = stroke.points[0];
        if (p) {
          ctx.beginPath();
          // Drawing a bold dot on click or tap
          ctx.arc(p.x * canvas.width, p.y * canvas.height, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.beginPath();
        const first = stroke.points[0];
        if (first) {
          ctx.moveTo(first.x * canvas.width, first.y * canvas.height);
          for (let i = 1; i < stroke.points.length; i++) {
            const p = stroke.points[i];
            if (p) {
              ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
            }
          }
          ctx.stroke();
        }
      }
    }
  }, [drawings]);

  // Redraw when drawings list switches or scales
  useEffect(() => {
    redrawCanvas();
  }, [drawings, redrawCanvas]);

  // ResizeObserver for canvas container sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (canvas) {
          canvas.width = entry.contentRect.width;
          canvas.height = entry.contentRect.height;
          redrawCanvas();
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [redrawCanvas, view]);

  // Tooltip visibility states
  const [showSubscribeTooltip, setShowSubscribeTooltip] = useState(false);
  const [showLikeTooltip, setShowLikeTooltip] = useState(false);
  const [showSaveTooltip, setShowSaveTooltip] = useState(false);
  const [hoverSubscribe, setHoverSubscribe] = useState(false);
  const [hoverLike, setHoverLike] = useState(false);
  const [hoverSave, setHoverSave] = useState(false);
  const [introCountdown, setIntroCountdown] = useState<number | string | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const introDelayTimeoutRef = useRef<number | null>(null);
  const firstLineAudioDelayTimeoutRef = useRef<number | null>(null);
  const [videoIntroPhase, setVideoIntroPhase] = useState<0 | 1 | 2 | 3>(0);
  const [introResetCounter, setIntroResetCounter] = useState(0);
  const [isIntroPreviewOnly, setIsIntroPreviewOnly] = useState(false);
  const [introStarted, setIntroStarted] = useState(false);

  const [bgStyle, setBgStyle] = useState<"neon" | "pure">("neon");
  const [hideName, setHideName] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [disableZoomAnimation, setDisableZoomAnimation] = useState(() => {
    return localStorage.getItem("disable_zoom_animation") !== "false";
  });

  const updateDisableZoomAnimation = (val: boolean) => {
    setDisableZoomAnimation(val);
    localStorage.setItem("disable_zoom_animation", String(val));
  };

  // Automatically clear cache on app startup as requested
  useEffect(() => {
    const autoClearCacheOnStartup = async () => {
      try {
        await clear();
        updateStates(() => ({}));
        console.log("Audio cache cleared automatically on startup.");
      } catch (e) {
        console.error("Auto clear startup failed", e);
      }
    };
    autoClearCacheOnStartup();
  }, []);

  const [outroStep, setOutroStep] = useState(0);

  useEffect(() => {
    let timer1: number | undefined;
    let timer2: number | undefined;
    let timer3: number | undefined;
    let timer4: number | undefined;
    let timer5: number | undefined;
    let timer6: number | undefined;
    if (view === "video" && isPlaybackFinished) {
      setOutroStep(0);
      timer1 = window.setTimeout(() => {
        setOutroStep(1);
      }, 250);

      timer2 = window.setTimeout(() => {
        setOutroStep(2);
      }, 1000);

      timer3 = window.setTimeout(() => {
        setOutroStep(3);
      }, 3000);

      timer4 = window.setTimeout(() => {
        setOutroStep(4);
      }, 4500);

      timer5 = window.setTimeout(() => {
        setOutroStep(5);
      }, 6000);

      timer6 = window.setTimeout(() => {
        setOutroStep(6);
      }, 7500);
    }
    return () => {
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      if (timer3) clearTimeout(timer3);
      if (timer4) clearTimeout(timer4);
      if (timer5) clearTimeout(timer5);
      if (timer6) clearTimeout(timer6);
    };
  }, [view, isPlaybackFinished]);

  useEffect(() => {
    let timer1: number | undefined;
    let timer2: number | undefined;
    let timer3: number | undefined;

    if (view === "video" && currentLineIndex === -1 && !isPlaybackFinished && introStarted) {
      setVideoIntroPhase(0);
      setIntroCountdown(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (introDelayTimeoutRef.current) {
        clearTimeout(introDelayTimeoutRef.current);
        introDelayTimeoutRef.current = null;
      }
      if (firstLineAudioDelayTimeoutRef.current) {
        clearTimeout(firstLineAudioDelayTimeoutRef.current);
        firstLineAudioDelayTimeoutRef.current = null;
      }

      // Always play the animation sequence in both preview and normal playback modes
      // Timeline with 1.5 sec intervals:
      // 0s: Only "ENGLISH PODCAST" shown (Phase 0)
      // 1.5s: "Beginner" appears (Phase 1)
      timer1 = window.setTimeout(() => {
        setVideoIntroPhase(1);
      }, 1500);

      // 3.0s: Theme/Title appears (Phase 2)
      timer2 = window.setTimeout(() => {
        setVideoIntroPhase(2);
      }, 3000);

      // 4.5s (1.5s after theme): Start countdown if not in preview mode
      timer3 = window.setTimeout(() => {
        if (!isIntroPreviewOnly) {
          startIntroCountdown();
        }
      }, 4500);
    } else {
      setVideoIntroPhase(0);
      setIntroCountdown(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (introDelayTimeoutRef.current) {
        clearTimeout(introDelayTimeoutRef.current);
        introDelayTimeoutRef.current = null;
      }
      if (firstLineAudioDelayTimeoutRef.current) {
        clearTimeout(firstLineAudioDelayTimeoutRef.current);
        firstLineAudioDelayTimeoutRef.current = null;
      }
    }

    return () => {
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      if (timer3) clearTimeout(timer3);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (introDelayTimeoutRef.current) {
        clearTimeout(introDelayTimeoutRef.current);
        introDelayTimeoutRef.current = null;
      }
      if (firstLineAudioDelayTimeoutRef.current) {
        clearTimeout(firstLineAudioDelayTimeoutRef.current);
        firstLineAudioDelayTimeoutRef.current = null;
      }
    };
  }, [view, currentLineIndex, isPlaybackFinished, introResetCounter, isIntroPreviewOnly, introStarted]);

  useEffect(() => {
    if (view === "video" && isPlaybackFinished) {
      if (outroStep === 3) {
        playUploadedAudio("subscribe");
      } else if (outroStep === 4) {
        playUploadedAudio("like");
      } else if (outroStep === 5) {
        playUploadedAudio("save");
      } else if (outroStep === 6) {
        playUploadedAudio("next");
      }
    }
  }, [outroStep, view, isPlaybackFinished]);

  const previewEndScreen = () => {
    if (audioRef.current) audioRef.current.pause();
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (introDelayTimeoutRef.current) {
      clearTimeout(introDelayTimeoutRef.current);
      introDelayTimeoutRef.current = null;
    }
    if (firstLineAudioDelayTimeoutRef.current) {
      clearTimeout(firstLineAudioDelayTimeoutRef.current);
      firstLineAudioDelayTimeoutRef.current = null;
    }
    setIntroCountdown(null);
    setCurrentLineIndex(-1);
    setCurrentWordIndex(-1);
    setIsPaused(false);
    isPausedRef.current = false;
    setIsPlaybackFinished(true);
    setOutroStep(0);
    setView("video");
  };

  // Extract custom metadata from rawText dynamically
  const matchLevel = rawText.match(/(?:уровень|level)\s*[:：]\s*(.+)/i);
  const matchTopic = rawText.match(/(?:топик|topic)\s*[:：]\s*(.+)/i);
  const matchTheme = rawText.match(/(?:тема|theme)\s*[:：]\s*(.+)/i);

  const formatLevel = (val: string): string => {
    if (!val) return "";
    return val
      .toLowerCase()
      .replace(/(?:^|[\s\-\/])([a-zA-Zа-яА-ЯёЁ])/g, (match) => match.toUpperCase());
  };

  const levelValueRaw = matchLevel
    ? matchLevel[1].trim().replace(/[.\s]+$/, "")
    : "";
  const levelValue = formatLevel(levelValueRaw);
  const topicValue = matchTopic
    ? matchTopic[1].trim().replace(/[.\s]+$/, "")
    : "";
  const themeValue = matchTheme
    ? matchTheme[1].trim().replace(/[.\s]+$/, "")
    : "";
  const [nameStyle, setNameStyle] = useState({
    name: "Subtle White",
    class: "text-white/10 uppercase tracking-[0.5em] text-9xl font-black",
  });

  // Background Styles configuration
  const BG_STYLES_CONFIG = {
    neon: {
      name: "Violet Neon",
      base: "bg-black",
      glows: ["bg-purple-600/15", "bg-purple-900/5"],
    },
    pure: { name: "Pure Black", base: "bg-black", glows: [] },
  };

  // Map font scale to classes
  const getFontSizeClass = () => {
    const fs = isFullScreen && videoFormat === "landscape";
    const scales: Record<number, string> = {
      1: fs ? "text-3xl md:text-4xl" : "text-xl",
      2: fs ? "text-4xl md:text-5xl" : "text-2xl",
      3: fs ? "text-5xl md:text-6xl" : "text-3xl",
      4: fs ? "text-6xl md:text-7xl" : "text-4xl md:text-5xl",
      5: fs ? "text-7xl md:text-8xl" : "text-5xl md:text-6xl",
      6: fs ? "text-8xl md:text-9xl" : "text-6xl md:text-7xl",
      7: fs ? "text-9xl md:text-[11rem]" : "text-7xl md:text-8xl",
      8: fs ? "text-[11rem] md:text-[13rem]" : "text-8xl md:text-9xl",
      9: fs ? "text-[14rem] md:text-[16rem]" : "text-[10rem] md:text-[12rem]",
      10: fs ? "text-[18rem] md:text-[22rem]" : "text-[12rem] md:text-[15rem]",
    };
    return (
      scales[fontSize] || (fs ? "text-7xl md:text-8xl" : "text-5xl md:text-6xl")
    );
  };

  const statesRef = useRef<MatrixState>({});
  const updateStates = useCallback(
    (updater: (prev: MatrixState) => MatrixState) => {
      const next = updater(statesRef.current);
      statesRef.current = next;
      setStates(next);
    },
    [],
  );

  const [isQueueRunning, setIsQueueRunning] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const queueRef = useRef<{ id: string; retryCount: number }[]>([]);
  const isProcessingRef = useRef(false);

  const uploadFilesRef = useRef<HTMLInputElement>(null);
  const scriptUploadRef = useRef<HTMLInputElement>(null);

  const handleScriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (re) => {
      if (typeof re.target?.result === "string") {
        setRawText(re.target.result);
      }
    };
    reader.readAsText(file);
    if (scriptUploadRef.current) scriptUploadRef.current.value = "";
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const filesArray = Array.from(files) as File[];
    const totalFiles = filesArray.length;
    setUploadProgress({ current: 0, total: totalFiles });

    try {
      // Parse the latest dialogue from rawText first so we have the updated line mapping
      let latestDialogue = dialogueRef.current;
      if (rawText.trim()) {
        const lines = rawText.split("\n").filter((l) => l.trim().includes(":"));
        const parsed: DialogueLine[] = lines
          .map((l, i) => {
            const lineText = l.trim();
            const numMatch = lineText.match(/^(?:(\d+)-)?(\d+)[.\s]+/);

            if (!numMatch) return null;

            let speaker = "";
            let text = "";
            let lineNum = i + 1;
            let lineSku: string | undefined = undefined;

            if (numMatch) {
              lineSku = numMatch[1];
              lineNum = parseInt(numMatch[2]);
              const cleanedLine = lineText.substring(numMatch[0].length);
              const colonIdx = cleanedLine.indexOf(":");
              if (colonIdx !== -1) {
                speaker = cleanedLine.substring(0, colonIdx).trim();
                text = cleanedLine.substring(colonIdx + 1).trim();
              }
            }

            return {
              id: `line-${i}-${lineNum}`, // Unique ID using index to avoid collisions
              speaker: speaker || "Unknown",
              text: text,
              displayIndex: lineNum,
              sku: lineSku,
            };
          })
          .filter((d): d is DialogueLine => d !== null && d.text.trim() !== "");

        if (parsed.length > 0) {
          latestDialogue = parsed;
          updateDialogue(parsed);

          // Auto-assign voices to keep them synchronized
          const uniqueSpeakers = Array.from(
            new Set(parsed.map((p) => p.speaker)),
          );
          const mapping = { ...speakerVoicesRef.current };
          const STATIC_VOICES: Record<string, string> = {
            Emma: "Zephyr",
            Ethan: "Charon",
          };
          uniqueSpeakers.forEach((s, i) => {
            if (!mapping[s])
              mapping[s] = STATIC_VOICES[s] || VOICES[i % VOICES.length];
          });
          updateSpeakerVoices(mapping);
        }
      }

      const newStates = { ...statesRef.current };
      let matchCount = 0;
      let customCount = 0;

      const getMimeType = (f: File) => {
        const name = f.name.toLowerCase();
        if (name.endsWith(".wav")) return "audio/wav";
        if (name.endsWith(".mp3")) return "audio/mpeg";
        if (name.endsWith(".ogg")) return "audio/ogg";
        if (name.endsWith(".m4a")) return "audio/m4a";
        return f.type || "audio/wav";
      };

      for (let i = 0; i < totalFiles; i++) {
        const file = filesArray[i];
        setUploadProgress({ current: i + 1, total: totalFiles });

        const nameLower = file.name.toLowerCase();
        if (
          nameLower === "save.wav" ||
          nameLower === "subscribe.wav" ||
          nameLower === "like.wav" ||
          nameLower === "next.wav"
        ) {
          const type = nameLower.slice(0, nameLower.indexOf("."));
          const fileType = getMimeType(file);
          const blob = new Blob([file as BlobPart], {
            type: fileType,
          });
          await set(getCustomAudioKey(sku, type), { blob });
          customCount++;
          continue;
        }

        const numMatches = file.name.match(/\d+/g);
        if (numMatches) {
          // Assume the last number in filename is the line index (e.g. 100-4.wav or 4.wav)
          const lineNum = parseInt(numMatches[numMatches.length - 1]);

          // Find the line in current dialogue that has this displayIndex
          const line = latestDialogue.find((d) => d.displayIndex === lineNum);

          if (line) {
            const fileType = getMimeType(file);
            const blob = new Blob([file as BlobPart], {
              type: fileType,
            });
            const newState = {
              status: "done" as const,
              blob: blob,
              downloaded: true,
              text: line.text,
            };

            await set(getDialogueCachedKey(getSkuForLine(line, sku), line.id), newState);
            newStates[line.id] = newState;
            matchCount++;
          }
        }
      }

      if (matchCount > 0 || customCount > 0) {
        updateStates(() => newStates);
        let msg = "";
        if (matchCount > 0)
          msg += `Successfully matched ${matchCount} audio clips to your dialogue lines. `;
        if (customCount > 0)
          msg += `Uploaded ${customCount} custom button audio files.`;
        alert(msg);
      } else {
        alert(
          "No matching line numbers found in filenames. Please ensure filenames contain the line number (e.g., '13.wav').",
        );
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error during audio files upload parsing. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0 });
      // Clear input
      if (uploadFilesRef.current) uploadFilesRef.current.value = "";
    }
  };

  const handleNewPodcast = () => {
    setRawText("");
    setDialogue([]);
    updateDialogue([]);
    updateStates(() => ({}));
    localStorage.removeItem("podcast_raw_text");
    localStorage.removeItem("podcast_dialogue");
    localStorage.removeItem("podcast_voices");
    setUserLiked(true);
    setUserSubscribed(false);
    setUserSaved(true);
    setIsStartActive(false);
    setView("input");
  };

  const previewIntroOnly = () => {
    localStorage.setItem("tts_podcast_instructions", voiceInstructions);
    localStorage.setItem("tts_word_instructions", wordInstructions);
    const { lines: parsed, extractedSku } = parseInputToDialogue(
      rawText,
      sku,
      activePresetRef.current,
      speakerVoicesRef.current,
      wordVoiceRef.current,
    );

    if (extractedSku && extractedSku !== sku) {
      setSku(extractedSku);
      localStorage.setItem("podcast_sku", extractedSku);
    }

    if (parsed.length === 0) return;

    updateDialogue(parsed);
    const uniqueSpeakers = Array.from(new Set(parsed.map((p) => p.speaker)));
    const initialMapping: Record<string, string> = { ...speakerVoicesRef.current };
    const STATIC_VOICES: Record<string, string> = {
      Emma: "Zephyr",
      Ethan: "Charon",
    };
    uniqueSpeakers.forEach((s, i) => {
      if (!initialMapping[s]) {
        initialMapping[s] = STATIC_VOICES[s] || VOICES[i % VOICES.length];
      }
    });
    updateSpeakerVoices(initialMapping);

    setIntroResetCounter((prev) => prev + 1);
    setIsIntroPreviewOnly(true);
    setCurrentLineIndex(-1);
    setCurrentWordIndex(-1);
    setIsPaused(false);
    isPausedRef.current = false;
    setIsPlaybackFinished(false);
    setVideoIntroPhase(0);
    setIntroStarted(true);

    setView("video");
  };

  const parseDialogue = () => {
    localStorage.setItem("tts_podcast_instructions", voiceInstructions);
    localStorage.setItem("tts_word_instructions", wordInstructions);
    const { lines: parsed, extractedSku } = parseInputToDialogue(
      rawText,
      sku,
      activePresetRef.current,
      speakerVoicesRef.current,
      wordVoiceRef.current,
    );

    if (extractedSku && extractedSku !== sku) {
      setSku(extractedSku);
      localStorage.setItem("podcast_sku", extractedSku);
    }

    if (parsed.length === 0) return;

    updateDialogue(parsed);
    const uniqueSpeakers = Array.from(new Set(parsed.map((p) => p.speaker)));
    const initialMapping: Record<string, string> = { ...speakerVoicesRef.current };

    const STATIC_VOICES: Record<string, string> = {
      Emma: "Zephyr",
      Ethan: "Charon",
    };

    uniqueSpeakers.forEach((s, i) => {
      if (!initialMapping[s]) {
        initialMapping[s] = STATIC_VOICES[s] || VOICES[i % VOICES.length];
      }
    });

    updateSpeakerVoices(initialMapping);
    setView("setup");
  };

  const startBatch = async () => {
    // Save project metadata
    localStorage.setItem("podcast_raw_text", rawText);
    localStorage.setItem("podcast_dialogue", JSON.stringify(dialogue));
    localStorage.setItem("podcast_voices", JSON.stringify(speakerVoices));

    const newStates: MatrixState = {};
    for (const line of dialogue) {
      const cached = await get(getDialogueCachedKey(getSkuForLine(line, sku), line.id));
      if (
        cached &&
        cached.status === "done" &&
        (cached.text === line.text || !cached.hasOwnProperty("text"))
      ) {
        newStates[line.id] = cached;
      } else {
        newStates[line.id] = { status: "idle", downloaded: false };
      }
    }
    statesRef.current = newStates;
    setStates(newStates);

    queueRef.current = dialogue
      .filter((d, i) => newStates[d.id].status !== "done")
      .map((d) => ({ id: d.id, retryCount: 0 }));

    setIsQueueRunning(queueRef.current.length > 0);
    setView("generating");
    if (queueRef.current.length > 0) processNextInQueue();
  };

  const retryIncompleteLines = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);

    const incomplete = dialogue.filter(
      (d) => !states[d.id] || states[d.id].status !== "done",
    );
    if (incomplete.length === 0) return;

    // Reset errors to idle/generating as we queue
    updateStates((prev) => {
      const next = { ...prev };
      incomplete.forEach((d) => {
        next[d.id] = { ...next[d.id], status: "idle", error: undefined };
      });
      return next;
    });

    queueRef.current = incomplete.map((d) => ({ id: d.id, retryCount: 0 }));
    setIsQueueRunning(true);
    setView("generating");
    processNextInQueue();
  };

  const processNextInQueue = async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) {
      if (queueRef.current.length === 0) setIsQueueRunning(false);
      return;
    }

    isProcessingRef.current = true;
    const task = queueRef.current[0];
    const line = dialogueRef.current.find((d) => d.id === task.id);
    if (!line) {
      isProcessingRef.current = false;
      queueRef.current.shift();
      processNextInQueue();
      return;
    }
    const voice =
      line.voice ||
      speakerVoicesRef.current[line.speaker] ||
      line.speaker ||
      "Charon";

    updateStates((prev) => ({
      ...prev,
      [task.id]: { ...prev[task.id], status: "generating", error: undefined },
    }));

    try {
      if (!line.text.trim()) {
        throw new Error("Text is empty for this line");
      }
      if (!voice) {
        throw new Error(`No voice assigned for speaker: "${line.speaker}"`);
      }

      const instruction =
        activePresetRef.current === "word"
          ? wordInstructionsRef.current
          : voiceInstructionsRef.current;

      const result = await generateTTS(line.text, voice, instruction);
      const newState = {
        status: "done" as const,
        blob: result.blob,
        downloaded: true,
        text: line.text,
      };
      updateStates((prev) => ({
        ...prev,
        [task.id]: newState,
      }));

      // Save to IndexedDB for persistence
      set(getDialogueCachedKey(getSkuForLine(line, sku), task.id), newState);

      // Auto-download as requested
      downloadLine(
        task.id,
        dialogueRef.current.findIndex((d) => d.id === task.id),
        result.blob,
      );

      queueRef.current.shift();

      if (queueRef.current.length > 0) {
        startCooldown();
      } else {
        setIsQueueRunning(false);
      }
    } catch (err: any) {
      console.error("Batch error for line:", task.id, err);
      const errMessage = err.message || String(err);
      const isRateLimit =
        errMessage.includes("429") ||
        errMessage.includes("403") ||
        errMessage.toLowerCase().includes("quota") ||
        errMessage.toLowerCase().includes("rate limit") ||
        errMessage.toLowerCase().includes("resource_exhausted") ||
        errMessage.toLowerCase().includes("permission_denied") ||
        errMessage.toLowerCase().includes("too many requests") ||
        errMessage.toLowerCase().includes("denied access");

      if (isRateLimit) {
        if (task.retryCount < 3) {
          // Increment retryCount, keep in queue, wait 5s without shifting
          task.retryCount += 1;
          updateStates((prev) => ({
            ...prev,
            [task.id]: {
              ...prev[task.id],
              status: "generating",
              error: "Лимит API, пауза 5с...",
            },
          }));
          // Pause 5 seconds before retrying the same word/line
          startCooldown(5);
        } else {
          // Exhausted 3 retries: mark as error, remove only this task, continue queue with 5s pause
          updateStates((prev) => ({
            ...prev,
            [task.id]: {
              ...prev[task.id],
              status: "error",
              error: "API",
            },
          }));
          queueRef.current.shift();
          if (queueRef.current.length > 0) {
            startCooldown(5);
          } else {
            setIsQueueRunning(false);
          }
        }
      } else {
        // Other errors: mark error, shift, and continue
        updateStates((prev) => ({
          ...prev,
          [task.id]: {
            ...prev[task.id],
            status: "error",
            error: errMessage,
          },
        }));
        queueRef.current.shift();
        if (queueRef.current.length > 0) {
          startCooldown();
        } else {
          setIsQueueRunning(false);
        }
      }
    } finally {
      isProcessingRef.current = false;
    }
  };

  const startCooldown = (seconds = PROJECT_COOLDOWN_SEC) => {
    setCountdown(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev !== null && prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          processNextInQueue();
          return null;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);
  };

  const startIntroCountdown = () => {
    if (countdownIntervalRef.current) return;
    setIntroCountdown(3);
    countdownIntervalRef.current = window.setInterval(() => {
      setIntroCountdown((prev) => {
        if (prev === null) {
          if (countdownIntervalRef.current)
            clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          return null;
        }
        if (prev === 3) return 2;
        if (prev === 2) return 1;
        if (prev === 1) {
          if (countdownIntervalRef.current)
            clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          
          if (introDelayTimeoutRef.current) {
            clearTimeout(introDelayTimeoutRef.current);
          }
          introDelayTimeoutRef.current = window.setTimeout(() => {
            introDelayTimeoutRef.current = null;
            startPlayback(0);
          }, 1000);
          
          return "START";
        }
        return null;
      });
    }, 1000);
  };

  const playPodcast = async () => {
    setIsIntroPreviewOnly(false);
    setCurrentLineIndex(-1);
    setCurrentWordIndex(-1);
    setIsPaused(false);
    isPausedRef.current = false;
    setIsPlaybackFinished(false);
    setVideoIntroPhase(0);
    setOutroStep(0);
    setUserLiked(true);
    setUserSubscribed(false);
    setUserSaved(true);
    setShowSubscribeTooltip(false);
    setShowLikeTooltip(false);
    setShowSaveTooltip(false);
    setIntroCountdown(null);
    setIntroStarted(false);
    setEnglishPodcastHuge(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (introDelayTimeoutRef.current) {
      clearTimeout(introDelayTimeoutRef.current);
      introDelayTimeoutRef.current = null;
    }
    setView("video");
  };

  const startPlayback = (index: number) => {
    setIsPaused(false);
    isPausedRef.current = false;
    setIntroStarted(true);
    if (index === 0) {
      setIsPlaybackFinished(false);
      setOutroStep(0);
      setIntroCountdown(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (introDelayTimeoutRef.current) {
        clearTimeout(introDelayTimeoutRef.current);
        introDelayTimeoutRef.current = null;
      }
    }

    stopAndCleanupAudio();

    if (index >= dialogue.length) {
      setCurrentLineIndex(-1);
      setCurrentWordIndex(-1);
      return;
    }

    const line = dialogue[index];
    const state = states[line.id];
    if (!state?.blob) {
      // Direct layout play simulator for lines with no matched audio file
      setCurrentLineIndex(index);
      setCurrentWordIndex(-1);

      const words = line.text.split(/\s+/);
      const wordCount = words.length;
      const durationMs = Math.max(1500, Math.min(4000, wordCount * 330));

      const startSimulatedPlayback = () => {
        if (isPausedRef.current) return;
        const startTime = Date.now();

        const updateTiming = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(1, elapsed / durationMs);
          const totalChars = line.text.length;
          const processedChars = progress * totalChars;

          let charSum = 0;
          let wordIdx = 0;
          for (let i = 0; i < words.length; i++) {
            charSum += words[i].length + 1;
            if (charSum > processedChars) {
              wordIdx = i;
              break;
            }
            wordIdx = i;
          }
          setCurrentWordIndex(wordIdx);
        };

        updateTiming();
        if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = window.setInterval(() => {
          updateTiming();
          if (Date.now() - startTime >= durationMs) {
            if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
            if (index + 1 < dialogue.length) {
              setTimeout(() => startPlayback(index + 1), 200);
            } else {
              setCurrentLineIndex(-1);
              setCurrentWordIndex(-1);
              setIsPaused(false);
              isPausedRef.current = false;
              setIsPlaybackFinished(true);
              setOutroStep(0);
            }
          }
        }, 40);
      };

      if (index === 0) {
        if (firstLineAudioDelayTimeoutRef.current) {
          clearTimeout(firstLineAudioDelayTimeoutRef.current);
        }
        firstLineAudioDelayTimeoutRef.current = window.setTimeout(() => {
          firstLineAudioDelayTimeoutRef.current = null;
          startSimulatedPlayback();
        }, 1500);
      } else {
        startSimulatedPlayback();
      }
      return;
    }

    setCurrentLineIndex(index);
    setCurrentWordIndex(-1);

    const url = URL.createObjectURL(state.blob);
    activeAudioUrlRef.current = url;
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.oncanplaythrough = () => {
      if (isPausedRef.current) {
        audio.pause();
        return;
      }
      const startActualPlayback = () => {
        if (isPausedRef.current) return;
        audio.play().catch((e) => console.error("Audio playback failed:", e));

        const updateTiming = () => {
          if (!audioRef.current) return;

          const duration = audioRef.current.duration;
          const currentTime = audioRef.current.currentTime;
          if (!duration || duration === 0) return;

          // 1. Progress by characters (linearly interpolated by char count)
          const effectiveProgress = Math.max(
            0,
            Math.min(1, (currentTime + timingOffset / 1000) / duration),
          );

          // 2. Search for word index based on processed characters
          const text = line.text;
          const totalChars = text.length;
          const processedChars = effectiveProgress * totalChars;

          const words = text.split(/\s+/);
          let charSum = 0;
          let wordIdx = 0;

          for (let i = 0; i < words.length; i++) {
            // Each word length + 1 for the space between words
            charSum += words[i].length + 1;
            if (charSum > processedChars) {
              wordIdx = i;
              break;
            }
            wordIdx = i; // Fallback to last word if we exhaust the list
          }

          setCurrentWordIndex(wordIdx);
        };

        updateTiming(); // Run once immediately
        if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = window.setInterval(updateTiming, 40); // Slightly more frequent updates
      };

      if (index === 0) {
        if (firstLineAudioDelayTimeoutRef.current) {
          clearTimeout(firstLineAudioDelayTimeoutRef.current);
        }
        firstLineAudioDelayTimeoutRef.current = window.setTimeout(() => {
          firstLineAudioDelayTimeoutRef.current = null;
          startActualPlayback();
        }, 1500);
      } else {
        startActualPlayback();
      }
    };

    audio.onended = () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      stopAndCleanupAudio();
      if (index + 1 < dialogue.length) {
        setTimeout(() => startPlayback(index + 1), 200);
      } else {
        setCurrentLineIndex(-1);
        setCurrentWordIndex(-1);
        setIsPaused(false);
        isPausedRef.current = false;
        setIsPlaybackFinished(true);
        setOutroStep(0);
      }
    };
  };

  const togglePlayPause = () => {
    if (view !== "video") return;

    if (introCountdown !== null || introDelayTimeoutRef.current !== null) {
      setIntroCountdown(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (introDelayTimeoutRef.current) {
        clearTimeout(introDelayTimeoutRef.current);
        introDelayTimeoutRef.current = null;
      }
      setIsIntroPreviewOnly(true);
      return;
    }

    if (currentLineIndex === -1) {
      if (!introStarted) {
        setIntroStarted(true);
        return;
      }
      setIsIntroPreviewOnly(false);
      startIntroCountdown();
      return;
    }

    if (isPausedRef.current) {
      // Resume
      isPausedRef.current = false;
      setIsPaused(false);

      if (audioRef.current) {
        audioRef.current.play();

        // Recreate the updates interval
        const line = dialogue[currentLineIndex];
        const updateTiming = () => {
          if (!audioRef.current) return;
          const duration = audioRef.current.duration;
          const currentTime = audioRef.current.currentTime;
          if (!duration || duration === 0) return;
          const effectiveProgress = Math.max(
            0,
            Math.min(1, (currentTime + timingOffset / 1000) / duration),
          );
          const text = line.text;
          const totalChars = text.length;
          const processedChars = effectiveProgress * totalChars;
          const words = text.split(/\s+/);
          let charSum = 0;
          let wordIdx = 0;
          for (let i = 0; i < words.length; i++) {
            charSum += words[i].length + 1;
            if (charSum > processedChars) {
              wordIdx = i;
              break;
            }
            wordIdx = i;
          }
          setCurrentWordIndex(wordIdx);
        };
        if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = window.setInterval(updateTiming, 40);
      } else {
        // Simulated playback resume - restart current simulated line from top
        startPlayback(currentLineIndex);
      }
    } else {
      // Pause
      isPausedRef.current = true;
      setIsPaused(true);
      if (firstLineAudioDelayTimeoutRef.current) {
        clearTimeout(firstLineAudioDelayTimeoutRef.current);
        firstLineAudioDelayTimeoutRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`,
        );
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error(
          `Error attempting to exit full-screen mode: ${err.message}`,
        );
      });
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isNowFull = !!document.fullscreenElement;
      setIsFullScreen(isNowFull);
      if (view === "video") {
        setHideUI(isNowFull);
      }
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, [view]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHideUI(false);
      if (e.key === "F2") {
        e.preventDefault();
        toggleFullScreen();
      }
      if (e.key === "c" || e.key === "C" || e.key === "Backspace") {
        if (view === "video") {
          setDrawings([]);
        }
      }
      if (e.key === " " || e.code === "Space") {
        if (
          view === "video" &&
          !(
            document.activeElement instanceof HTMLTextAreaElement ||
            document.activeElement instanceof HTMLInputElement
          )
        ) {
          e.preventDefault();
          togglePlayPause();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [view, dialogue, states, currentLineIndex, isPaused, introCountdown, introStarted]);

  useEffect(() => {
    // Try to load session on mount
    loadPreviousSession();

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const loadPreviousSession = async () => {
    const savedText = localStorage.getItem("podcast_raw_text");
    const savedSku = localStorage.getItem("podcast_sku");
    const savedDialogue = localStorage.getItem("podcast_dialogue");
    const savedVoices = localStorage.getItem("podcast_voices");

    if (savedText) setRawText(savedText);
    if (savedSku) setSku(savedSku);

    if (savedDialogue) {
      const parsedDialogue: DialogueLine[] = JSON.parse(savedDialogue);
      updateDialogue(parsedDialogue);

      if (savedVoices) updateSpeakerVoices(JSON.parse(savedVoices));

      // Load states from IndexedDB
      const newStates: MatrixState = {};
      const currentSkuVal = savedSku || sku || "global";
      for (const line of parsedDialogue) {
        const cached = await get(getDialogueCachedKey(getSkuForLine(line, currentSkuVal), line.id));
        if (
          cached &&
          (cached.text === line.text || !cached.hasOwnProperty("text"))
        ) {
          newStates[line.id] = cached;
        }
      }
      statesRef.current = newStates;
      setStates(newStates);
    }
  };

  const downloadLine = (id: string, index: number, providedBlob?: Blob) => {
    const state = statesRef.current[id];
    const line = dialogueRef.current[index];
    const blob = providedBlob || state?.blob;

    if (blob && line) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Use the actual number from the dialogue (displayIndex)
      const fileNum = line.displayIndex;
      const finalSku = getSkuForLine(line, sku);
      const voiceName =
        line.voice ||
        speakerVoicesRef.current[line.speaker] ||
        line.speaker ||
        "";

      const sameIndexLines = dialogueRef.current.filter(
        (d) => d.displayIndex === fileNum,
      );

      // If preset 2 (Word Pronunciation Prompt) is active: format as charon_manage.wav
      if (activePresetRef.current === "word") {
        const safeVoice = (voiceName || "voice").toLowerCase();
        const safeWord = (line.text || `word-${fileNum}`)
          .trim()
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/[\s-]+/g, "_");
        a.download = `${safeVoice}_${safeWord || `word_${fileNum}`}.wav`;
      } else {
        // Preset 1 (Podcast Host Prompt): keep as before
        if ((line.voice || sameIndexLines.length > 1) && voiceName) {
          a.download = `${finalSku}-${fileNum}-${voiceName}.wav`;
        } else {
          a.download = `${finalSku}-${fileNum}.wav`;
        }
      }

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const playLine = (id: string) => {
    const state = states[id];
    if (state.blob) {
      stopAndCleanupAudio();
      const url = URL.createObjectURL(state.blob);
      activeAudioUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => stopAndCleanupAudio();
      audio.play().catch((e) => console.error("Play line failed:", e));
    }
  };

  const handleBypassToVideo = async () => {
    // 1. Ensure dialogue is parsed if we are in 'input' view
    let currentDialogue = dialogue;
    if (view === "input") {
      if (!rawText.trim()) return;

      const { lines: parsed, extractedSku } = parseInputToDialogue(
        rawText,
        sku,
        activePresetRef.current,
        speakerVoicesRef.current,
        wordVoiceRef.current,
      );

      if (extractedSku && extractedSku !== sku) {
        setSku(extractedSku);
        localStorage.setItem("podcast_sku", extractedSku);
      }

      if (parsed.length === 0) return;

      currentDialogue = parsed;
      updateDialogue(parsed);

      // Auto-assign voices if empty
      const uniqueSpeakers = Array.from(new Set(parsed.map((p) => p.speaker)));
      const mapping = { ...speakerVoicesRef.current };
      const STATIC_VOICES: Record<string, string> = {
        Emma: "Zephyr",
        Ethan: "Charon",
      };
      uniqueSpeakers.forEach((s, i) => {
        if (!mapping[s])
          mapping[s] = STATIC_VOICES[s] || VOICES[i % VOICES.length];
      });
      updateSpeakerVoices(mapping);

      // Save settings
      localStorage.setItem("podcast_sku", extractedSku || sku);
    }

    if (currentDialogue.length === 0) return;

    // 2. Refresh states from IndexedDB if needed
    const newStates: Record<string, any> = { ...statesRef.current };
    for (const line of currentDialogue) {
      if (
        !newStates[line.id] ||
        newStates[line.id].status !== "done" ||
        newStates[line.id].text !== line.text
      ) {
        const cached = await get(getDialogueCachedKey(getSkuForLine(line, sku), line.id));
        if (
          cached &&
          cached.status === "done" &&
          (cached.text === line.text || !cached.hasOwnProperty("text"))
        ) {
          newStates[line.id] = cached;
        } else {
          newStates[line.id] = { status: "idle", downloaded: false };
        }
      }
    }
    updateStates(() => newStates);

    // Save session data
    localStorage.setItem("podcast_raw_text", rawText);
    localStorage.setItem("podcast_sku", sku);
    localStorage.setItem("podcast_dialogue", JSON.stringify(currentDialogue));
    localStorage.setItem("podcast_voices", JSON.stringify(speakerVoices));

    // Switch to video directly bypassing startBatch generations
    setCurrentLineIndex(-1);
    setCurrentWordIndex(-1);
    setIsPaused(false);
    isPausedRef.current = false;
    updateDialogueFont("Inter");
    setEnglishPodcastHuge(false);
    setIntroStarted(false);
    setIsIntroPreviewOnly(false);
    setView("video");
  };

  const handleClearAndPaste = async () => {
    if (isUploading) return;
    setIsStartActive(true);

    let textToUse = rawText;
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText && clipboardText.trim()) {
          textToUse = clipboardText;
          setRawText(clipboardText);
        }
      }
    } catch (err) {
      console.warn("Clipboard auto-paste warning:", err);
    }

    if (!textToUse.trim()) return;

    setTimeout(() => {
      handleQuickStart(textToUse);
    }, 300);
  };

  const handleQuickStart = async (textToUse?: string) => {
    // Automatically clear audio cache for safety when Start is clicked
    try {
      await clear();
      updateStates(() => ({}));
      console.log("Audio cache cleared upon Start click.");
    } catch (e) {
      console.error(e);
    }

    const textToParse = textToUse !== undefined ? textToUse : rawText;

    // 1. Ensure dialogue is parsed if we are in 'input' view
    let currentDialogue = dialogue;
    if (view === "input") {
      if (!textToParse.trim()) return;

      const { lines: parsed, extractedSku } = parseInputToDialogue(
        textToParse,
        sku,
        activePresetRef.current,
        speakerVoicesRef.current,
        wordVoiceRef.current,
      );

      if (extractedSku && extractedSku !== sku) {
        setSku(extractedSku);
        localStorage.setItem("podcast_sku", extractedSku);
      }

      if (parsed.length === 0) return;

      currentDialogue = parsed;
      updateDialogue(parsed);

      // Auto-assign voices if empty
      const uniqueSpeakers = Array.from(new Set(parsed.map((p) => p.speaker)));
      const mapping = { ...speakerVoicesRef.current };
      const STATIC_VOICES: Record<string, string> = {
        Emma: "Zephyr",
        Ethan: "Charon",
      };
      uniqueSpeakers.forEach((s, i) => {
        if (!mapping[s])
          mapping[s] = STATIC_VOICES[s] || VOICES[i % VOICES.length];
      });
      updateSpeakerVoices(mapping);

      // Save settings
      localStorage.setItem("podcast_sku", extractedSku || sku);
    }

    if (currentDialogue.length === 0) return;

    // 2. Refresh states from IndexedDB if needed
    const newStates: MatrixState = { ...statesRef.current };
    for (const line of currentDialogue) {
      if (
        !newStates[line.id] ||
        newStates[line.id].status !== "done" ||
        newStates[line.id].text !== line.text
      ) {
        const cached = await get(getDialogueCachedKey(getSkuForLine(line, sku), line.id));
        if (
          cached &&
          cached.status === "done" &&
          (cached.text === line.text || !cached.hasOwnProperty("text"))
        ) {
          newStates[line.id] = cached;
        } else {
          newStates[line.id] = { status: "idle", downloaded: false };
        }
      }
    }
    updateStates(() => newStates);

    // 3. Determine next view
    const allDone = currentDialogue.every(
      (d) => newStates[d.id]?.status === "done",
    );

    if (allDone) {
      // Save session data
      localStorage.setItem("podcast_raw_text", rawText);
      localStorage.setItem("podcast_sku", sku);
      localStorage.setItem("podcast_dialogue", JSON.stringify(currentDialogue));
      localStorage.setItem("podcast_voices", JSON.stringify(speakerVoices));

      playPodcast();
    } else {
      // Go to generating and start queue
      localStorage.setItem("podcast_raw_text", rawText);
      localStorage.setItem("podcast_sku", sku);
      localStorage.setItem("podcast_dialogue", JSON.stringify(currentDialogue));
      localStorage.setItem("podcast_voices", JSON.stringify(speakerVoices));

      queueRef.current = currentDialogue
        .filter((d, i) => newStates[d.id].status !== "done")
        .map((d) => ({ id: d.id, retryCount: 0 }));

      setIsQueueRunning(queueRef.current.length > 0);
      setView("generating");
      if (queueRef.current.length > 0) processNextInQueue();
    }
  };



  return (
    <div className="min-h-screen bg-[#05060b] text-slate-200 font-sans selection:bg-blue-500/30 selection:text-white relative overflow-x-hidden">
      {/* Mesh Gradient Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
      <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none"></div>

      {/* Global Background Dot Grid */}
      <div className="fixed inset-0 dot-grid opacity-[0.03] pointer-events-none" />

      {/* Hidden File Inputs */}
      <input
        type="file"
        multiple
        accept="audio/*"
        className="hidden"
        ref={uploadFilesRef}
        onChange={handleBulkUpload}
      />
      <input
        type="file"
        accept=".txt,.md"
        className="hidden"
        ref={scriptUploadRef}
        onChange={handleScriptUpload}
      />

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        {view !== "input" && (
          <header className="mb-12 flex items-center justify-start gap-4 px-8 py-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
            <button
              onClick={async () => {
                if (confirm("Clear ALL cached audio and session data?")) {
                  await clear();
                  localStorage.removeItem("podcast_raw_text");
                  localStorage.removeItem("podcast_dialogue");
                  localStorage.removeItem("podcast_voices");
                  window.location.reload();
                }
              }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/10 transition-all cursor-pointer"
              title="Clear Cache"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={previewEndScreen}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium hover:bg-rose-500/20 transition-all backdrop-blur-sm shadow-xl cursor-pointer"
              title="Test Outro"
            >
              <Eye size={16} /> 
            </button>
            <button
              onClick={handleNewPodcast}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm cursor-pointer"
            >
              <ArrowLeft size={16} /> 
            </button>
          </header>
        )}

        {/* API LIMITS BANNER (Integrated into design) */}
        {showApiLimitsScreen && (
          <div className="sticky top-4 z-50 mb-8 p-6 rounded-3xl bg-[#13070a]/90 border border-red-500/40 backdrop-blur-2xl shadow-2xl shadow-red-500/20 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-extrabold text-red-400 font-mono tracking-widest uppercase flex items-center justify-center sm:justify-start gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  API
                </h3>
              </div>
            </div>
            <button
              onClick={retryIncompleteLines}
              className="px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg backdrop-blur-sm transition-all active:scale-95 cursor-pointer shrink-0"
              title="Retry incomplete / error clips"
            >
              <RotateCcw size={15} />
              <span>Повторить</span>
            </button>
          </div>
        )}

        {view === "input" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl shadow-2xl">
              <div className="mb-6 flex flex-col items-stretch gap-4">
                <div className="w-full">
                  {/* SINGLE START BUTTON (Clears, pastes clipboard, and launches start) */}
                  <button
                    onClick={handleClearAndPaste}
                    disabled={isUploading}
                    className="w-full group relative px-6 py-3.5 bg-white text-black rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/20 active:scale-[0.99] flex items-center justify-center overflow-hidden whitespace-nowrap disabled:opacity-50 cursor-pointer"
                  >
                    <span className="relative z-10 font-black tracking-widest uppercase">
                      START
                    </span>
                  </button>
                </div>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={
                  activePreset === "word"
                    ? "Paste 1 word, word list, or format:\napple\n1. apple\nWord: serendipity\n123-1. apple"
                    : "Paste dialogue, lines or format:\n1. Emma: Welcome back!\n2. Ethan: Glad to be here."
                }
                className="w-full h-80 bg-black/20 border border-white/5 rounded-2xl p-6 text-slate-200 font-mono text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none shadow-inner mb-6"
              />

              {/* DUAL VOICE INSTRUCTIONS & PROFILES */}
              <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <Settings size={18} className="text-blue-400" /> Voice Instructions & Speaker Profiles
                  </h3>
                  <span className="text-xs text-slate-400">
                    Select which instruction & speaker profile to use
                  </span>
                </div>

                {/* PRESET 1: PODCAST HOST PROMPT */}
                <div
                  className={`rounded-2xl border transition-all duration-300 p-5 ${
                    activePreset === "podcast"
                      ? "border-blue-500/50 bg-blue-500/[0.05] shadow-lg shadow-blue-500/10"
                      : "border-white/10 bg-black/20 opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <label
                      onClick={() => setActivePreset("podcast")}
                      className="flex items-center gap-3 cursor-pointer select-none"
                    >
                      <input
                        type="radio"
                        name="active_tts_preset"
                        checked={activePreset === "podcast"}
                        onChange={() => setActivePreset("podcast")}
                        className="w-4 h-4 accent-blue-500 cursor-pointer"
                      />
                      <span className="text-sm font-bold text-white tracking-wide">
                        1. Educational Podcast Host Prompt
                      </span>
                    </label>

                    {activePreset === "podcast" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                        <Check size={12} className="stroke-[3]" /> ACTIVE
                      </span>
                    )}
                  </div>

                  <textarea
                    value={voiceInstructions}
                    onChange={(e) => setVoiceInstructions(e.target.value)}
                    placeholder="e.g. Speak as a professional educational podcast host..."
                    className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none shadow-inner leading-relaxed mb-4"
                  />

                  {/* Speaker voices for Prompt 1 */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <User size={13} className="text-blue-400" /> Speakers for Podcast:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/25 border border-white/5 rounded-xl p-3">
                      {/* Ethan Voice */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider">
                          Ethan (Speaker 1)
                        </span>
                        <select
                          value={speakerVoices["Ethan"] || "Charon"}
                          onChange={(e) => {
                            const updated = {
                              ...speakerVoices,
                              Ethan: e.target.value,
                            };
                            updateSpeakerVoices(updated);
                            localStorage.setItem("podcast_voices", JSON.stringify(updated));
                          }}
                          className="bg-white/5 text-xs border border-white/10 rounded-lg px-2.5 py-1.5 focus:ring-1 ring-blue-500 outline-none cursor-pointer hover:bg-white/10 transition-colors text-white"
                        >
                          {VOICES_WITH_ALL.map((v) => (
                            <option key={v} value={v} className="bg-neutral-900">
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Emma Voice */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider">
                          Emma (Speaker 2)
                        </span>
                        <select
                          value={speakerVoices["Emma"] || "Zephyr"}
                          onChange={(e) => {
                            const updated = {
                              ...speakerVoices,
                              Emma: e.target.value,
                            };
                            updateSpeakerVoices(updated);
                            localStorage.setItem("podcast_voices", JSON.stringify(updated));
                          }}
                          className="bg-white/5 text-xs border border-white/10 rounded-lg px-2.5 py-1.5 focus:ring-1 ring-pink-500 outline-none cursor-pointer hover:bg-white/10 transition-colors text-white"
                        >
                          {VOICES_WITH_ALL.map((v) => (
                            <option key={v} value={v} className="bg-neutral-900">
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRESET 2: WORD PRONUNCIATION PROMPT */}
                <div
                  className={`rounded-2xl border transition-all duration-300 p-5 ${
                    activePreset === "word"
                      ? "border-emerald-500/50 bg-emerald-500/[0.05] shadow-lg shadow-emerald-500/10"
                      : "border-white/10 bg-black/20 opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <label
                      onClick={() => setActivePreset("word")}
                      className="flex items-center gap-3 cursor-pointer select-none"
                    >
                      <input
                        type="radio"
                        name="active_tts_preset"
                        checked={activePreset === "word"}
                        onChange={() => setActivePreset("word")}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-sm font-bold text-white tracking-wide">
                        2. Word Pronunciation Prompt
                      </span>
                    </label>

                    {activePreset === "word" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <Check size={12} className="stroke-[3]" /> ACTIVE
                      </span>
                    )}
                  </div>

                  <textarea
                    value={wordInstructions}
                    onChange={(e) => setWordInstructions(e.target.value)}
                    placeholder="Use neutral American English. Pronounce the word naturally..."
                    className="w-full h-36 bg-black/30 border border-white/10 rounded-xl p-4 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500/50 transition-all resize-none shadow-inner leading-relaxed mb-4"
                  />

                  {/* Speaker voices for Prompt 2 */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <User size={13} className="text-emerald-400" /> Speaker Voice for Word Pronunciation:
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-black/25 border border-white/5 rounded-xl p-3">
                      <div className="flex flex-col gap-1 w-full sm:w-auto sm:min-w-[240px]">
                        <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider">
                          Voice Selection
                        </span>
                        <select
                          value={wordVoice}
                          onChange={(e) => {
                            setWordVoice(e.target.value);
                          }}
                          className="bg-white/5 text-xs border border-white/10 rounded-lg px-2.5 py-1.5 focus:ring-1 ring-emerald-500 outline-none cursor-pointer hover:bg-white/10 transition-colors text-white"
                        >
                          <option value="All" className="bg-neutral-900 font-bold text-emerald-400">
                            ★ All (5 voices: Charon, Zephyr, Puck, Fenrir, Kore)
                          </option>
                          <option value="Charon" className="bg-neutral-900">
                            Charon
                          </option>
                          <option value="Zephyr" className="bg-neutral-900">
                            Zephyr
                          </option>
                          <option value="Puck" className="bg-neutral-900">
                            Puck
                          </option>
                          <option value="Fenrir" className="bg-neutral-900">
                            Fenrir
                          </option>
                          <option value="Kore" className="bg-neutral-900">
                            Kore
                          </option>
                        </select>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 sm:pt-4">
                        {wordVoice === "All" ? (
                          <span className="text-emerald-400 font-medium">
                            ⚡ Generates audio for each voice in sequence and auto-downloads each .wav file!
                          </span>
                        ) : (
                          <span className="text-slate-300 font-medium">
                            ⚡ Generates audio with <span className="text-emerald-400 font-bold">{wordVoice}</span> and auto-downloads.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>
        )}

        {view === "setup" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 tracking-tight">
                Step 2: Assign Voices
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {Object.keys(speakerVoices).map((speaker) => (
                  <div
                    key={speaker}
                    className="p-4 bg-black/20 border border-white/5 rounded-2xl flex items-center justify-between backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center font-bold">
                        {speaker[0]}
                      </div>
                      <span className="font-bold text-white">{speaker}</span>
                    </div>
                    <select
                      value={speakerVoices[speaker]}
                      onChange={(e) =>
                        setSpeakerVoices((prev) => ({
                          ...prev,
                          [speaker]: e.target.value,
                        }))
                      }
                      className="bg-white/5 text-sm border border-white/10 rounded-xl px-3 py-1.5 focus:ring-2 ring-blue-500 outline-none cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      {VOICES_WITH_ALL.map((v) => (
                        <option key={v} value={v} className="bg-neutral-900">
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <button
                onClick={startBatch}
                className="w-full py-4 bg-white text-black hover:bg-blue-50 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5 active:scale-95"
              >
                Generate Podcast Clips <ListMusic size={20} />
              </button>
            </div>
          </div>
        )}

        {view === "generating" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-500/20 border border-white/20 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  {isQueueRunning ? (
                    <Loader2 className="text-white animate-spin" size={24} />
                  ) : (
                    <Check className="text-white" size={24} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg tracking-tight">
                    {isQueueRunning
                      ? ""
                      : ""}
                  </h3>
                  <div className="flex items-center gap-2 text-blue-100 text-[10px] uppercase font-bold tracking-widest opacity-80">
                    <span className="font-mono">
                      {dialogue[0]?.displayIndex} - {dialogue[dialogue.length - 1]?.displayIndex}
                    </span>
                    <span>•</span>
                    <span>{dialogue.length} lines total</span>
                    {isQueueRunning && (
                      <>
                        <span>•</span>
                        <span className="font-bold">
                          {countdown
                            ? `Next in ${countdown}s`
                            : "Processing..."}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                {dialogue.some(
                  (d) => !states[d.id] || states[d.id]?.status !== "done",
                ) && (
                  <button
                    onClick={retryIncompleteLines}
                    className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg backdrop-blur-sm transition-all active:scale-95 cursor-pointer"
                    title="Retry incomplete / error clips"
                  >
                    <RotateCcw size={15} />
                    <span>Повторить</span>
                  </button>
                )}
                {!isQueueRunning && (
                  <button
                    onClick={playPodcast}
                    className="px-6 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-blue-50 transition-all flex items-center gap-2 shadow-xl"
                  >
                    <Play size={16} fill="currentColor" /> 
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {dialogue.map((line, index) => (
                <LineControl
                  key={line.id}
                  line={line}
                  state={
                    states[line.id] || { status: "idle", downloaded: false }
                  }
                  onGenerate={() => {
                    queueRef.current = [{ id: line.id, retryCount: 0 }];
                    setIsQueueRunning(true);
                    processNextInQueue();
                  }}
                  onPlay={() => playLine(line.id)}
                  isQueueRunning={isQueueRunning}
                  isSelected={selectedLineIds.has(line.id)}
                  onToggleSelect={() => toggleSelectLine(line.id)}
                />
              ))}
            </div>
          </div>
        )}

        {view === "video" && (
          <div
            className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden font-display"
            style={{ cursor: "none" }}
          >
            {/* Mesh Gradient Background Elements - Only subtle for depth if needed, but user wants pure black outside */}
            {/* We keep them very faint or remove them for the "pure black" request */}

            <div
              className={`absolute top-8 left-0 right-0 z-50 flex justify-center transition-all duration-700 ${hideUI ? "opacity-0 pointer-events-none -translate-y-8" : "opacity-100 translate-y-0"}`}
            >
              <div className="flex items-center gap-6 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl max-w-[95%]">
                <button
                  onClick={() => {
                    if (audioRef.current) audioRef.current.pause();
                    if (playbackTimerRef.current)
                      clearInterval(playbackTimerRef.current);
                    if (countdownIntervalRef.current) {
                      clearInterval(countdownIntervalRef.current);
                      countdownIntervalRef.current = null;
                    }
                    if (introDelayTimeoutRef.current) {
                      clearTimeout(introDelayTimeoutRef.current);
                      introDelayTimeoutRef.current = null;
                    }
                    setIntroCountdown(null);
                    setView("generating");
                    setHideUI(false);
                  }}
                  className="p-2 text-slate-400 hover:text-white transition-all rounded-xl hover:bg-white/10 group"
                  title="Back"
                >
                  <ArrowLeft
                    size={20}
                    className="group-hover:-translate-x-1 transition-transform"
                  />
                </button>
                <div className="h-6 w-[1px] bg-white/10" />
                <button
                  onClick={togglePlayPause}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl font-semibold text-[10px] uppercase tracking-widest transition-all"
                  title="Play / Pause (Space)"
                >
                  {isPaused || (currentLineIndex === -1 && introCountdown === null) ? (
                    <>
                      <Play size={16} className="fill-indigo-400" /> Play
                    </>
                  ) : (
                    <>
                      <Pause size={16} className="fill-indigo-400" /> Pause
                    </>
                  )}
                </button>
                <div className="h-6 w-[1px] bg-white/10" />
                <button
                  onClick={() => startPlayback(0)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all"
                >
                  <RotateCcw size={16} />
                </button>
                <div className="h-6 w-[1px] bg-white/10" />

                <button
                  onClick={previewEndScreen}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all"
                  title="Outro"
                >
                  <Eye size={16} />
                </button>
                <div className="h-6 w-[1px] bg-white/10" />

                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 transition-all rounded-xl hover:bg-white/10 ${showSettings ? "text-blue-400 bg-white/10" : "text-slate-400"}`}
                  >
                    <SlidersHorizontal size={20} />
                  </button>

                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-4 w-72 bg-neutral-900/95 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl z-[60]"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none">
                            Settings
                          </h4>
                          <button
                            onClick={() => setShowSettings(false)}
                            className="text-neutral-500 hover:text-white"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="space-y-8">
                          {/* Offset */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Timer size={14} className="text-blue-400" />
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                  Sync Offset
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-blue-400">
                                {timingOffset > 0 ? "+" : ""}
                                {timingOffset}ms
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-500"
                              max="500"
                              step="10"
                              value={timingOffset}
                              onChange={(e) =>
                                setTimingOffset(parseInt(e.target.value))
                              }
                              className="w-full h-1.5 bg-white/5 rounded-full appearance-none accent-blue-500 cursor-pointer"
                            />
                          </div>

                          {/* Font Size */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Type size={14} className="text-orange-400" />
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                  Text Size
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-orange-400">
                                {fontSize}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              step="1"
                              value={fontSize}
                              onChange={(e) =>
                                setFontSize(parseInt(e.target.value))
                              }
                              className="w-full h-1.5 bg-white/5 rounded-full appearance-none accent-orange-500 cursor-pointer"
                            />
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-6 w-[1px] bg-white/10" />
                <div className="flex bg-white/10 p-1 rounded-xl">
                  <button
                    onClick={() => setVideoFormat("landscape")}
                    className={`p-2 rounded-lg transition-all ${videoFormat === "landscape" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-300"}`}
                    title="Landscape (16:9)"
                  >
                    <Monitor size={18} />
                  </button>
                  <button
                    onClick={() => setVideoFormat("portrait")}
                    className={`p-2 rounded-lg transition-all ${videoFormat === "portrait" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-300"}`}
                    title="Portrait (9:16)"
                  >
                    <Smartphone size={18} />
                  </button>
                </div>
                <div className="h-6 w-[1px] bg-white/10" />
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {Object.entries(BG_STYLES_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setBgStyle(key as any)}
                        title={config.name}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          bgStyle === key
                            ? "border-pink-500 scale-110 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                            : "border-white/20 hover:border-white/40"
                        } ${config.base.startsWith("bg-gradient") ? "bg-neutral-800" : config.base}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="h-6 w-[1px] bg-white/10" />
                <button
                  onClick={toggleFullScreen}
                  className="p-2 text-neutral-500 hover:text-white transition-all rounded-xl hover:bg-white/5"
                  title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isFullScreen ? (
                    <Minimize size={20} />
                  ) : (
                    <Maximize size={20} />
                  )}
                </button>
                <div className="h-6 w-[1px] bg-white/10" />
                <button
                  onClick={() => setHideUI(true)}
                  className="p-2 text-neutral-500 hover:text-white transition-all rounded-xl hover:bg-white/5"
                  title="Hide UI (ESC to Show)"
                >
                  <EyeOff size={20} />
                </button>
              </div>
            </div>

            <div
              className={`relative transition-all duration-700 ${BG_STYLES_CONFIG[bgStyle].base} ${
                videoFormat === "portrait"
                  ? "aspect-[9/16] h-[90vh] rounded-none shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10"
                  : isFullScreen
                    ? "w-full h-full border-none shadow-none"
                    : "w-[90vw] h-[80vh] max-w-6xl rounded-none shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10"
              } flex items-center justify-center overflow-hidden backdrop-blur-xl`}
              style={{ cursor: "none" }}
            >
              {/* Dynamic Gradients */}
              <AnimatePresence>
                {BG_STYLES_CONFIG[bgStyle].glows.map((glowClass, i) => (
                  <motion.div
                    key={`${bgStyle}-glow-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className={`absolute ${
                      i === 0
                        ? "top-0 left-1/4 -translate-y-1/2"
                        : "bottom-0 right-1/4 translate-y-1/2"
                    } ${
                      isFullScreen && videoFormat === "landscape"
                        ? "w-[900px] h-[900px] blur-[160px]"
                        : "w-[600px] h-[600px] blur-[120px]"
                    } ${glowClass} rounded-full pointer-events-none transition-all duration-700`}
                  />
                ))}
              </AnimatePresence>

              {bgStyle === "matrix" && (
                <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />
              )}

              <AnimatePresence mode="popLayout">
                {currentLineIndex !== -1 && dialogue[currentLineIndex] ? (
                  <motion.div
                    key={currentLineIndex}
                    initial={{
                      opacity: 0,
                      y: disableZoomAnimation ? 0 : 40,
                      scale: disableZoomAnimation ? 1 : 0.95
                    }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      y: disableZoomAnimation ? 0 : -40,
                      scale: disableZoomAnimation ? 1 : 1.05,
                      filter: disableZoomAnimation ? "none" : "blur(10px)",
                    }}
                    transition={{
                      duration: disableZoomAnimation ? 0.25 : 0.4,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    className={`relative z-10 w-full text-center transition-all duration-700 ${
                      isFullScreen && videoFormat === "landscape"
                        ? "px-20 md:px-44"
                        : "px-12 md:px-20"
                    }`}
                  >
                    {!hideName && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                        <motion.span
                          key={`name-${dialogue[currentLineIndex]?.speaker}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.2 }}
                          className={`${nameStyle.class} text-center leading-none select-none block w-full truncate whitespace-nowrap`}
                        >
                          {dialogue[currentLineIndex]?.speaker}
                        </motion.span>
                      </div>
                    )}

                    <div
                      className={`flex flex-wrap justify-center gap-x-[0.25em] gap-y-[0.1em] leading-[1.1] font-bold ${getFontSizeClass()}`}
                      style={{ fontFamily: FONT_MAPPING[dialogueFont] }}
                    >
                      {dialogue[currentLineIndex]?.text
                        .split(/\s+/)
                        .map((word, wIdx) => {
                          const isHighlighted = wIdx === currentWordIndex;

                          return (
                            <motion.span
                              key={wIdx}
                              initial={false}
                              animate={{
                                opacity: isHighlighted ? 1 : 0.12,
                                color: isHighlighted ? "#FFFFFF" : "#333333",
                                textShadow: isHighlighted
                                  ? "0 0 10px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.3)"
                                  : "none",
                              }}
                              transition={{ duration: 0.2 }}
                              className="relative inline-block"
                            >
                              {word}
                            </motion.span>
                          );
                        })}
                    </div>

                    {/* Name at bottom removed per request, now background only */}
                  </motion.div>
                ) : isPlaybackFinished ? (
                  <motion.div
                    key="outro-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full select-none text-white overflow-hidden relative"
                    style={{ fontFamily: FONT_MAPPING[outroFont] }}
                  >
                    {/* Mesh Gradient Background Elements (matching main dialogue screen for consistent ambiance) */}
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none z-0"></div>
                    <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none z-0"></div>
                    <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none z-0"></div>
                    <div className="absolute inset-0 dot-grid opacity-[0.03] pointer-events-none z-0" />

                    {/* Aligned Next Video Section at the Top */}
                    <div className="absolute top-12 sm:top-16 left-0 right-0 flex flex-col items-center pointer-events-none z-40 p-6">
                      <div className="w-full max-w-2xl flex flex-col items-center justify-center gap-6 pointer-events-auto">
                        <AnimatePresence>
                          {outroStep >= 2 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              className="relative flex items-center justify-center text-center select-none cursor-pointer pointer-events-auto whitespace-nowrap"
                              onClick={() => playUploadedAudio("next")}
                            >
                              <span
                                className={`relative z-10 font-black tracking-[0.15em] whitespace-nowrap ${
                                  isFullScreen ? "text-[38px] md:text-[43px]" : "text-[32px] md:text-[36px]"
                                }`}
                                style={{ fontFamily: FONT_MAPPING[outroFont], color: "#FFFFFF" }}
                              >
                                NEXT LESSON
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Call To Actions aligned perfectly at the bottom edge of the screen */}
                    <div className={`absolute left-0 right-0 w-full h-16 z-40 pointer-events-none transition-all duration-500 ${isFullScreen ? "bottom-32" : "bottom-14"}`}>
                      {/* Left Side: SUBSCRIBE button (designed to point to YT's subscribe) */}
                      <div
                        className="absolute bottom-0 -translate-x-1/2 pointer-events-auto"
                        style={{ left: "15%" }}
                      >
                        <AnimatePresence>
                          {outroStep >= 3 && (
                            <motion.div
                              key="static-subscribe-btn"
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: 1,
                              }}
                              transition={{
                                duration: 0.5,
                                ease: "easeOut",
                              }}
                              className="flex flex-col items-center gap-1.5 cursor-pointer select-none relative"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserSubscribed(true);
                                setShowSubscribeTooltip(true);
                                playUploadedAudio("subscribe");
                              }}
                            >
                              {/* Tooltip above button */}
                              <AnimatePresence>
                                {showSubscribeTooltip && (
                                  <motion.div
                                    initial={{
                                      opacity: 0,
                                      y: 10,
                                      scale: 0.9,
                                      x: "-50%",
                                    }}
                                    animate={{
                                      opacity: 1,
                                      y: 0,
                                      scale: 1,
                                      x: "-50%",
                                    }}
                                    exit={{
                                      opacity: 0,
                                      y: 5,
                                      scale: 0.9,
                                      x: "-50%",
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className={`absolute bottom-full left-1/2 text-white font-black tracking-widest uppercase z-50 whitespace-nowrap select-none pointer-events-none text-center ${
                                      isFullScreen ? "text-[14.4px] mb-[28.8px]" : "text-[14px] mb-5"
                                    }`}
                                    style={{ fontFamily: FONT_MAPPING[outroFont] }}
                                  >
                                    FOR NEW LESSONS
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Soft White Ambient Glow Backlight */}
                              <div className="absolute -inset-6 bg-white/[0.07] blur-[24px] rounded-full pointer-events-none z-0 shadow-[0_0_40px_12px_rgba(255,255,255,0.06)]" />

                              {/* Button Content - White button with black text, rounded-full, dynamic large text size and borders */}
                              <div className={`relative z-10 font-black rounded-full transition-all duration-300 tracking-wide border shadow-[0_4px_16px_rgba(255,255,255,0.1)] bg-white text-black border-white hover:bg-neutral-100 ${
                                isFullScreen 
                                  ? "text-[21.6px] px-[43.2px] py-[18px] border-[3.6px]" 
                                  : "text-base px-7 py-3"
                              }`} style={{ fontFamily: FONT_MAPPING[outroFont] }}>
                                Subscribe
                              </div>

                              <SketchedArrow
                                delay={0.1}
                                side="left"
                                length={isFullScreen ? 112 : 45}
                                strokeWidth={isFullScreen ? 4.5 : 2}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Right-Center Side: LIKE button (approx 30% from right = 70% left) */}
                      <div
                        className="absolute bottom-0 -translate-x-1/2 pointer-events-auto"
                        style={{ left: "70%" }}
                      >
                        <AnimatePresence>
                          {outroStep >= 4 && (
                            <motion.div
                              key="static-like-btn"
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: 1,
                              }}
                              transition={{
                                duration: 0.5,
                                ease: "easeOut",
                              }}
                              className="flex flex-col items-center gap-1.5 cursor-pointer select-none relative"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserLiked(true);
                                setShowLikeTooltip(true);
                                playUploadedAudio("like");
                              }}
                            >
                              {/* Tooltip above button */}
                              <AnimatePresence>
                                {showLikeTooltip && (
                                  <motion.div
                                    initial={{
                                      opacity: 0,
                                      y: 10,
                                      scale: 0.9,
                                      x: "-50%",
                                    }}
                                    animate={{
                                      opacity: 1,
                                      y: 0,
                                      scale: 1,
                                      x: "-50%",
                                    }}
                                    exit={{
                                      opacity: 0,
                                      y: 5,
                                      scale: 0.9,
                                      x: "-50%",
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className={`absolute bottom-full left-1/2 text-white font-black tracking-widest uppercase z-50 whitespace-nowrap select-none pointer-events-none text-center ${
                                      isFullScreen ? "text-[14.4px] mb-[28.8px]" : "text-[14px] mb-5"
                                    }`}
                                    style={{ fontFamily: FONT_MAPPING[outroFont] }}
                                  >
                                    IF YOU ENJOYED IT
                                  </motion.div>
                                )}
                              </AnimatePresence>
                              
                              {/* Soft White Ambient Glow Backlight */}
                              <div className="absolute -inset-6 bg-white/[0.05] blur-[24px] rounded-full pointer-events-none z-0" />
                              
                              {/* Button Content - Heart icon only */}
                              <div className="relative z-10 flex items-center justify-center transition-all duration-300 text-white hover:text-neutral-200">
                                <Heart 
                                  className={`transition-all duration-300 text-white ${userLiked ? "fill-white text-white" : "fill-none"}`} 
                                  size={isFullScreen ? 50 : 32}
                                  strokeWidth={isFullScreen ? 3.15 : 2}
                                />
                              </div>
                              
                              <SketchedArrow
                                delay={0.2}
                                side="straight"
                                length={isFullScreen ? 112 : 45}
                                strokeWidth={isFullScreen ? 4.5 : 2}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* SAVE button (approx 10% from right = 90% left) */}
                      <div
                        className="absolute bottom-0 -translate-x-1/2 pointer-events-auto"
                        style={{ left: "90%" }}
                      >
                        <AnimatePresence>
                          {outroStep >= 5 && (
                            <motion.div
                              key="static-save-btn"
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: 1,
                              }}
                              transition={{
                                duration: 0.5,
                                ease: "easeOut",
                              }}
                              className="flex flex-col items-center gap-1.5 cursor-pointer select-none relative"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserSaved(true);
                                setShowSaveTooltip(true);
                                playUploadedAudio("save");
                              }}
                            >
                              {/* Tooltip above button */}
                              <AnimatePresence>
                                {showSaveTooltip && (
                                  <motion.div
                                    initial={{
                                      opacity: 0,
                                      y: 10,
                                      scale: 0.9,
                                      x: "-50%",
                                    }}
                                    animate={{
                                      opacity: 1,
                                      y: 0,
                                      scale: 1,
                                      x: "-50%",
                                    }}
                                    exit={{
                                      opacity: 0,
                                      y: 5,
                                      scale: 0.9,
                                      x: "-50%",
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className={`absolute bottom-full left-1/2 text-white font-black tracking-widest uppercase z-50 whitespace-nowrap select-none pointer-events-none text-center ${
                                      isFullScreen ? "text-[14.4px] mb-[28.8px]" : "text-[14px] mb-5"
                                    }`}
                                    style={{ fontFamily: FONT_MAPPING[outroFont] }}
                                  >
                                    FOR LATER
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Soft White Ambient Glow Backlight */}
                              <div className="absolute -inset-6 bg-white/[0.05] blur-[24px] rounded-full pointer-events-none z-0" />

                              {/* Button Content - Hollow/non-filled Bookmark only */}
                              <div className="relative z-10 flex items-center justify-center transition-all duration-300 text-white hover:text-neutral-200">
                                <Bookmark 
                                  className={`transition-all duration-300 text-white ${userSaved ? "fill-white" : "fill-none"}`} 
                                  size={isFullScreen ? 50 : 32}
                                  strokeWidth={isFullScreen ? 3.15 : 2}
                                />
                              </div>

                              <SketchedArrow
                                delay={0.3}
                                side="right"
                                length={isFullScreen ? 112 : 45}
                                strokeWidth={isFullScreen ? 4.5 : 2}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ) : isPlaybackFinished && false ? (
                  <motion.div
                    key="outro-screen-legacy"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center max-w-4xl px-8 flex flex-col items-center justify-center space-y-10 py-12 select-none relative"
                    style={{ display: "none" }}
                  >
                    {/* Motivator */}
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 0.6 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm md:text-base tracking-[0.2em] font-medium text-slate-300 uppercase"
                    >
                      Thanks for listening!
                    </motion.p>

                    {/* Channel Name */}
                    <div className="space-y-4">
                      <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black tracking-[0.15em] bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent uppercase leading-none"
                      >
                        Lesson Done
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm md:text-base text-slate-400"
                      >
                        Practice English daily for immediate improvement!
                      </motion.p>
                    </div>

                    {/* Like & Subscribe interactive bar */}
                    <div className="relative flex flex-col sm:flex-row items-center gap-6 pt-6 z-30">
                      {/* Like Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent starting playback
                          setUserLiked(true);
                        }}
                        className={`group min-w-[200px] flex items-center justify-center gap-3 px-8 py-5 rounded-2xl border transition-all shadow-xl select-none ${
                          userLiked
                            ? "bg-rose-500/20 border-rose-500 text-rose-400 scale-[1.02]"
                            : "bg-white/[0.03] border-white/10 text-slate-300 hover:border-rose-500/30 hover:text-white"
                        }`}
                      >
                        <motion.div
                          animate={userLiked ? { scale: [1, 1.4, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Heart
                            size={24}
                            className={
                              userLiked
                                ? "fill-rose-500 text-rose-500 animate-pulse"
                                : "text-rose-400 group-hover:scale-110 transition-transform"
                            }
                          />
                        </motion.div>
                        <span className="font-bold text-lg">
                          {userLiked ? "LIKED!" : "LIKE"}
                        </span>
                      </motion.button>

                      {/* Subscribe Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent starting playback
                          setUserSubscribed(true);
                        }}
                        className={`group min-w-[200px] flex items-center justify-center gap-3 px-8 py-5 rounded-2xl border transition-all shadow-xl select-none ${
                          userSubscribed
                            ? "bg-indigo-500/20 border-indigo-500 text-indigo-400 scale-[1.02]"
                            : "bg-white/[0.03] border-white/10 text-slate-300 hover:border-indigo-500/30 hover:text-white"
                        }`}
                      >
                        <motion.div
                          animate={
                            userSubscribed
                              ? { rotate: [0, -15, 15, -15, 15, 0] }
                              : {}
                          }
                          transition={{ duration: 0.5 }}
                        >
                          <Bell
                            size={24}
                            className={
                              userSubscribed
                                ? "fill-indigo-500 text-indigo-500"
                                : "text-indigo-400 group-hover:scale-110 transition-transform"
                            }
                          />
                        </motion.div>
                        <span className="font-bold text-lg">
                          {userSubscribed ? "SUBSCRIBED!" : "SUBSCRIBE"}
                        </span>
                      </motion.button>
                    </div>

                    {/* Instruction tip */}
                    <motion.p
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-xs font-mono tracking-[0.15em] text-lime-400 select-none uppercase pt-2"
                    >
                      Click Either Button to Interact!
                    </motion.p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="intro-screen"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                      if (!introStarted) {
                        setIntroStarted(true);
                      } else {
                        setIsIntroPreviewOnly(false);
                        setIntroResetCounter((prev) => prev + 1);
                      }
                    }}
                    className="relative w-full h-full flex flex-col items-center justify-center px-12 text-center select-none cursor-none"
                    style={{ fontFamily: FONT_MAPPING[introFont] }}
                  >
                    {/* Top title: English Podcast */}
                    <AnimatePresence>
                      {introStarted && (
                        <motion.div
                          key="english-podcast-title"
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", damping: 14, stiffness: 80 }}
                          className={`absolute top-[12%] select-none flex items-center justify-center ${
                            englishPodcastHuge
                              ? "left-4 right-4 w-[calc(100%-2rem)]"
                              : videoFormat === "portrait"
                                ? "left-1/2 -translate-x-1/2 w-[90%] max-w-sm"
                                : "left-[1.5cm] right-[1.5cm]"
                          }`}
                        >
                          <svg
                            viewBox="0 0 1000 130"
                            className="w-full h-auto select-none overflow-hidden px-1"
                            preserveAspectRatio="xMidYMid meet"
                          >
                            <text
                              x="500"
                              y="95"
                              textAnchor="middle"
                              fill="white"
                              textLength={englishPodcastHuge ? "965" : "865"}
                              lengthAdjust="spacingAndGlyphs"
                              style={{
                                fontFamily: FONT_MAPPING[introFont],
                                fontWeight: 900,
                                letterSpacing: englishPodcastHuge ? "0.15em" : "0.08em",
                              }}
                              className="uppercase select-none fill-white font-black"
                              fontSize="110"
                            >
                              ENGLISH PODCAST
                            </text>
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Level: Beginner */}
                    <AnimatePresence>
                      {introStarted && videoIntroPhase >= 1 && (
                        <motion.div
                          key="level-beginner"
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", damping: 14, stiffness: 80 }}
                          className="absolute left-1/2 -translate-x-1/2 w-full max-w-4xl px-12 select-none text-center font-bold text-white/90 text-lg md:text-xl lg:text-2xl tracking-[0.05em] top-[36.5%]"
                        >
                          {levelValue
                            ? levelValue.charAt(0).toUpperCase() + levelValue.slice(1).toLowerCase()
                            : "Beginner"}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Centered Main Title / Theme */}
                    <AnimatePresence>
                      {introStarted && videoIntroPhase >= 2 && (
                        <motion.div
                          key="theme-title-container"
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", damping: 14, stiffness: 80 }}
                          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-12 z-10 text-center top-[52%]"
                        >
                          <h1
                            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white"
                            style={{ fontFamily: FONT_MAPPING[introFont] }}
                          >
                            {themeValue || "Introducing Yourself and Your Family"}
                          </h1>
                        </motion.div>
                      )}
                    </AnimatePresence>



                    {/* Dynamic Countdown Overlay (3 2 1) - Raw, instant changes with no custom animation */}
                    {introCountdown !== null && (
                      <div
                        className="absolute bottom-[18%] left-1/2 -translate-x-1/2 flex items-center justify-center text-white text-7xl md:text-[8rem] lg:text-[10rem] font-black tracking-[0.08em] select-none z-30"
                        style={{ fontFamily: FONT_MAPPING[introFont] }}
                      >
                        {introCountdown}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
