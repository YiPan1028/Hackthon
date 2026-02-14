
import { GoogleGenAI } from "@google/genai";
import { DailyLog, AnalysisResults } from "../types";

export const getEmotionalInsights = async (logs: DailyLog[], results: AnalysisResults, userMessage: string) => {
  // Use process.env.API_KEY directly when initializing as per coding guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are LoveCare's Data-Driven Insight Assistant.
    Your goal is to interpret emotional health data for users who are preparing for Valentine's Day.
    
    Current Data Profile:
    - 7-Day Log Summary: ${JSON.stringify(logs.map(l => ({ mood: l.mood, stress: l.stress, energy: l.energy })))}
    - Volatility Score: ${results.volatilityScore.toFixed(1)}/100
    - Burnout Likelihood: ${results.burnoutLikelihood.toFixed(1)}/100
    - Risk Level: ${results.riskLevel}
    - Emotional Battery: ${results.emotionalBattery.toFixed(1)}%
    
    Guidelines:
    1. DO NOT provide clinical therapy or medical diagnosis.
    2. Focus on TREND DETECTION and RISK AWARENESS.
    3. Explain WHY certain scores are high/low based on the input data.
    4. Use the Valentine's context (e.g., "Entering the holiday with a low battery might make quality time difficult").
    5. Be supportive but analytical.
    6. Keep responses concise and insightful.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // Do not use response.text(), use the .text property
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my analytical engine right now. Please try again in a moment.";
  }
};
