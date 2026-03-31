import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface NewsItem {
  title: string;
  summary: string;
  url: string;
}

export interface StockRecommendation {
  symbol: string;
  name: string;
  reason: string;
}

export interface StockInfo {
  symbol: string;
  name: string;
  price: string;
  score: number; // 0-100
  analysis: string;
}

export const getDailyMarketData = async () => {
  const model = "gemini-3-flash-preview";
  const prompt = `
    請提供今日的股市資訊：
    1. 5 則國際重要財經新聞 (標題、簡短摘要、來源連結)。
    2. 5 則台灣重要財經新聞 (標題、簡短摘要、來源連結)。
    3. 推薦 3 檔值得關注的股票 (代號、名稱、推薦原因)。
    請使用繁體中文回答。
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          internationalNews: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                url: { type: Type.STRING },
              },
              required: ["title", "summary", "url"],
            },
          },
          taiwanNews: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                url: { type: Type.STRING },
              },
              required: ["title", "summary", "url"],
            },
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                symbol: { type: Type.STRING },
                name: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ["symbol", "name", "reason"],
            },
          },
        },
        required: ["internationalNews", "taiwanNews", "recommendations"],
      },
    },
  });

  return JSON.parse(response.text);
};

export const searchStock = async (query: string): Promise<StockInfo> => {
  const model = "gemini-3-flash-preview";
  const prompt = `
    查詢股票資訊： "${query}"。
    請提供該股票的：
    1. 代號與名稱。
    2. 目前大約股價 (請註明幣別)。
    3. 買進建議分數 (0-100，100為強烈建議買進)。
    4. 簡短的分析建議。
    請使用繁體中文回答。
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          symbol: { type: Type.STRING },
          name: { type: Type.STRING },
          price: { type: Type.STRING },
          score: { type: Type.NUMBER },
          analysis: { type: Type.STRING },
        },
        required: ["symbol", "name", "price", "score", "analysis"],
      },
    },
  });

  return JSON.parse(response.text);
};
