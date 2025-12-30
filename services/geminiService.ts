
import { GoogleGenAI, Type } from "@google/genai";

// Guideline: Use process.env.API_KEY directly when initializing GoogleGenAI.
// Guideline: Create instance right before making an API call to ensure it uses the most up-to-date API key.

export const generateTemporalLog = async (targetDate: string, currentStatus: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

export const generateHealthSummary = async (metrics: any, health: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: `Summarize this Quantum System health state: ${JSON.stringify(health)} with metrics: ${JSON.stringify(metrics)}. Provide a 2-sentence technical diagnostic. Use techno-babble but keep it meaningful.`,
    config: {
      temperature: 0.7,
    },
  });
  return response.text;
};
