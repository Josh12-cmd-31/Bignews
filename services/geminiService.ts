
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedArticleContent, Category } from "../types";

// Initialize Gemini Client using the environment variable directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const articleSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy news headline." },
    subject: { type: Type.STRING, description: "A short, impactful 1-sentence subject line for a news banner. Example: 'POLICE OFFICERS ARE REQUIRED TO CREATE PEACE'" },
    summary: { type: Type.STRING, description: "A 2-sentence summary of the article." },
    content: { type: Type.STRING, description: "The full article body text (approx 200-300 words). Use HTML tags like <p> for paragraphs." },
    category: { 
      type: Type.STRING, 
      description: "The most fitting category for this article.",
      enum: ['Technology', 'Politics', 'Health', 'Lifestyle', 'Sports', 'Food', 'Business', 'Science', 'Entertainment']
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of relevant tags or keywords for the article (max 5)."
    }
  },
  required: ["title", "subject", "summary", "content", "category", "tags"],
};

export const generateArticleContent = async (input: string, mode: 'topic' | 'url' | 'automation' = 'topic'): Promise<GeneratedArticleContent> => {
  try {
    let prompt = "";
    if (mode === 'url') {
      prompt = `Analyze this URL string: "${input}". infer the news topic from the URL structure (slug) and write a professional news article about it. If the URL is generic, write a general breaking news article. Ensure the tone is professional and journalistic. Generate an impactful subject banner text as well.`;
    } else if (mode === 'automation') {
       prompt = `Write a deep-dive professional news report on the trending topic: "${input}". Include analysis, quotes (simulated but realistic), and future implications. Use HTML <p> tags for formatting. Generate an impactful subject banner text as well.`;
    } else {
      prompt = `Write a news article about: ${input}. ensure the tone is professional and journalistic. Generate an impactful subject banner text as well.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: articleSchema,
        systemInstruction: "You are a professional lead journalist for a major news network called 'Big News'. You write engaging, factual, and well-structured articles."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as GeneratedArticleContent;
  } catch (error) {
    console.error("Error generating article:", error);
    throw error;
  }
};

export const identifyTrendingTopic = async (categories: string[]): Promise<{topic: string, category: Category}> => {
  const prompt = `Based on today's likely global trends, suggest ONE specific, highly engaging news topic for an article in one of these categories: ${categories.join(', ')}. Return your answer as a JSON object with two fields: "topic" (a specific subject line) and "category" (from the list provided).`;
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING },
      category: { type: Type.STRING }
    },
    required: ["topic", "category"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  const text = response.text;
  if (!text) return { topic: "Global Markets Update", category: "Business" as Category };

  return JSON.parse(text) as {topic: string, category: Category};
};
