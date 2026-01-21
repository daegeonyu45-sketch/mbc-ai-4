
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSurvivalTip(level: number): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The player is currently at level ${level} in a zombie survival game. Give a short, gritty, one-sentence survival tip or a zombie taunt in Korean. Keep it under 15 words.`,
      config: {
        temperature: 0.8,
        maxOutputTokens: 100,
      }
    });
    return response.text?.trim() || "긴장을 늦추지 마세요. 그들이 오고 있습니다.";
  } catch (error) {
    console.error("Error fetching tip:", error);
    return "계속 움직이세요, 아니면 죽음뿐입니다.";
  }
}
