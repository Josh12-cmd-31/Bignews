
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedArticleContent } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey });

const articleSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy news headline." },
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
  required: ["title", "summary", "content", "category", "tags"],
};

export const generateArticleContent = async (input: string, mode: 'topic' | 'url' = 'topic'): Promise<GeneratedArticleContent> => {
  try {
    let prompt = "";
    if (mode === 'url') {
      prompt = `Analyze this URL string: "${input}". infer the news topic from the URL structure (slug) and write a professional news article about it. If the URL is generic, write a general breaking news article. Ensure the tone is professional and journalistic.`;
    } else {
      prompt = `Write a news article about: ${input}. ensure the tone is professional and journalistic.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: articleSchema,
        systemInstruction: "You are a professional journalist for a major news network called 'Big News'. You write engaging, factual, and well-structured articles."
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
