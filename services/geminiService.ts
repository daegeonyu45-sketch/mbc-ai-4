
import { GoogleGenAI } from "@google/genai";

export async function getSurvivalTip(level: number): Promise<string> {
  const apiKey = process.env.API_KEY;
  
  // API 키가 없으면 즉시 기본 메시지 반환 (충돌 방지)
  if (!apiKey || apiKey === "") {
    return level > 1 ? "더 많은 좀비가 몰려옵니다! 구역을 사수하세요." : "첫 번째 구역을 확보했습니다. 계속 전진하세요.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
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
    console.error("Gemini API Error:", error);
    return "계속 움직이세요, 아니면 죽음뿐입니다.";
  }
}
