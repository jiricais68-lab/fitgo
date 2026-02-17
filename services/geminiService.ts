
import { GoogleGenAI, Type } from "@google/genai";
import { DailyActivity, WeeklyGoals, Language } from "../types";

// Always use the latest high-performance model for complex health analysis
const MODEL_NAME = 'gemini-3-pro-preview';

const langNames: Record<Language, string> = {
  en: 'English',
  cs: 'Czech',
  de: 'German',
  sk: 'Slovak',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  pl: 'Polish',
  nl: 'Dutch',
  pt: 'Portuguese',
  sv: 'Swedish',
  hu: 'Hungarian',
  da: 'Danish',
  fi: 'Finnish',
  no: 'Norwegian',
  ro: 'Romanian',
  tr: 'Turkish',
  el: 'Greek',
  ja: 'Japanese',
  zh: 'Chinese'
};

/**
 * Utility to call Gemini with a simple retry for 429 Rate Limit errors.
 */
async function callGeminiWithRetry(fn: () => Promise<any>, retries = 2, delay = 2000): Promise<any> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || error?.status === 429;
    if (isRateLimit && retries > 0) {
      console.warn(`Rate limit hit, retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGeminiWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const getHealthInsights = async (data: DailyActivity[], age: number, lang: Language = 'en') => {
  if (data.length === 0) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `You are an elite sports physiologist and uncompromising fitness specialist. 
  Analyze Apple Watch data. Be strict, direct, and demand discipline. 
  Look for patterns between fatigue, heart rate, and movement intensity.
  ALL RESPONSES MUST BE IN ${langNames[lang]}.`;

  const prompt = `Analyze the activity history: ${JSON.stringify(data.slice(-10))}
  User age: ${age}.
  
  Provide 3 highly professional, critical yet motivating insights.
  Focus on:
  1. Cardiovascular efficiency.
  2. Recovery quality.
  3. Discipline and stagnation signs.`;

  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['success', 'warning', 'info'] }
            },
            required: ['title', 'content', 'type']
          }
        }
      }
    }));

    return JSON.parse(response.text || '[]');
  } catch (error: any) {
    console.error("Gemini Insights Error:", error);
    if (error?.message?.includes('429') || error?.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    return null;
  }
};

export const getWeeklyGoalRecommendations = async (data: DailyActivity[], age: number, currentWeight: number, lang: Language = 'en'): Promise<WeeklyGoals | null> => {
  if (data.length === 0) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `You are an elite, strict conditioning coach. Your standard for an active life is AT LEAST 1000 active calories per day. 
  Demand excellence. ALL RESPONSES MUST BE IN ${langNames[lang]}.`;

  const prompt = `14-day history: ${JSON.stringify(data.slice(-14))}
  Profile: ${age} years old, ${currentWeight} kg.
  
  Suggest goals for next week. 
  CRITICAL RULE: 'moveKcal' MUST NOT be below 1000 kcal/day. 1000 is the minimum FitGo Elite standard.
  Explain reasoning professionally and strictly.`;

  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 2000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            moveKcal: { type: Type.NUMBER },
            exerciseMin: { type: Type.NUMBER },
            standHours: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          },
          required: ['moveKcal', 'exerciseMin', 'standHours', 'reasoning']
        }
      }
    }));

    const result = JSON.parse(response.text || '{}');
    if (result.moveKcal < 1000) result.moveKcal = 1000;
    
    return result;
  } catch (error: any) {
    console.error("Gemini Weekly Goals Error:", error);
    if (error?.message?.includes('429') || error?.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    return null;
  }
};
