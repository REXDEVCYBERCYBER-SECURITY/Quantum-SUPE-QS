
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateTemporalLog = async (targetDate: string, currentStatus: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a short, cinematic sci-fi mission log for a "Quantum Leap" time traveler landing on ${targetDate}. Current system status: ${currentStatus}. Keep it professional, dramatic, and under 100 words. Mention 'Quantum-Superscript' technology.`,
    config: {
      temperature: 0.9,
    },
  });
  return response.text;
};

export const analyzeQuantumStability = async (qubitData: any) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these quantum states: ${JSON.stringify(qubitData)}. Predict the probability of timeline divergence in a "Quantum Leap" scenario. Return a JSON object.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          divergenceRisk: { type: Type.NUMBER },
          reasoning: { type: Type.STRING },
          recommendedAction: { type: Type.STRING }
        },
        required: ["divergenceRisk", "reasoning", "recommendedAction"]
      }
    }
  });
  return JSON.parse(response.text);
};
