/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatCountdown(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function createWavHeader(
  pcmLength: number,
  sampleRate: number = 24000,
  numChannels: number = 1,
  bitsPerSample: number = 16
): Uint8Array {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  /* RIFF chunk descriptor */
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmLength, true); // chunkSize = 36 + SubChunk2Size
  writeString(view, 8, 'WAVE');

  /* fmt sub-chunk */
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // audioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // numChannels (1 for Mono, 2 for Stereo)
  view.setUint32(24, sampleRate, true); // sampleRate
  view.setUint32(28, byteRate, true); // byteRate
  view.setUint16(32, blockAlign, true); // blockAlign
  view.setUint16(34, bitsPerSample, true); // bitsPerSample (16)

  /* data sub-chunk */
  writeString(view, 36, 'data');
  view.setUint32(40, pcmLength, true); // dataSize = pcmLength

  return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
