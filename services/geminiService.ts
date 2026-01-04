import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSecurityVulnerability = async (input: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following technical scenario or vulnerability description: "${input}". 
    Provide a detailed assessment including:
    1. Identified Vulnerability Name
    2. Severity (CRITICAL, HIGH, MEDIUM, LOW)
    3. Potential Impact
    4. Remediation Steps`,
    config: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vulnerability: { type: Type.STRING },
          severity: { type: Type.STRING },
          description: { type: Type.STRING },
          recommendation: { type: Type.STRING }
        },
        required: ["vulnerability", "severity", "description", "recommendation"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getSecurityNews = async () => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Provide the 3 most recent and impactful cybersecurity news snippets. For each, assign a severity level based on global impact: CRITICAL for active major breaches, HIGH for new severe vulnerabilities, and INFO for general research/updates.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            date: { type: Type.STRING },
            tag: { type: Type.STRING },
            severity: { type: Type.STRING, description: 'One of: CRITICAL, HIGH, INFO' }
          },
          required: ["id", "title", "summary", "date", "tag", "severity"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const analyzeVaultEntry = async (label: string, identifier: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the security profile of this account record for a vault. Label: "${label}", Identifier: "${identifier}". Evaluate the risk level and provide a brief security audit.`,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          securityScore: { type: Type.INTEGER, description: 'Score from 0 to 100' },
          analysis: { type: Type.STRING, description: 'Short technical summary of risks or strengths' }
        },
        required: ["securityScore", "analysis"]
      }
    }
  });
  return JSON.parse(response.text);
};