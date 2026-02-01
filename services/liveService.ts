import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { MetabolicData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// PCM Helpers as required by rules
export function encodePCM(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const connectAssistant = (
  metabolic: MetabolicData,
  callbacks: {
    onTranscription: (text: string) => void;
    onAudioChunk: (base64: string) => void;
    onClose: () => void;
    onOpen: () => void;
  }
) => {
  const scanContext = metabolic.scan.state === 'COMPLETE' 
    ? `The user just scanned: ${metabolic.scan.food_name}. Nutritional data: ${metabolic.scan.carbs_grams}g carbs, ${metabolic.scan.sugars_grams}g sugars, impact level is ${metabolic.scan.impact_level}. Current glucose: ${metabolic.glucose.value} mg/dL.`
    : "No food scanned yet. Help the user understand what to scan.";

  const systemInstruction = `ACT AS GLYCO_ADVISOR v1.0. 
  CONTEXT: ${scanContext}
  
  CORE MISSION: Help pre-diabetic users make safe food choices.
  PERSONALITY: Tactical, calm, medical professional, AR HUD assistant.
  RULES:
  - Be concise. Speak in fragments if possible.
  - Prioritize blood sugar safety.
  - If they ask about portion, give specific pre-diabetic advice.
  - Max response length: 2 sentences.`;

  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
      },
      systemInstruction,
      outputAudioTranscription: {},
    },
    callbacks: {
      onopen: callbacks.onOpen,
      onclose: callbacks.onClose,
      onerror: (e) => console.error("LIVE_ERROR:", e),
      onmessage: async (message: LiveServerMessage) => {
        if (message.serverContent?.outputTranscription) {
          callbacks.onTranscription(message.serverContent.outputTranscription.text);
        }
        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (audioData) {
          callbacks.onAudioChunk(audioData);
        }
      }
    }
  });
};
