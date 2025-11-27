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
      enum: ['Technology', 'Sports', 'Food', 'Business', 'Science', 'Entertainment']
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of relevant tags or keywords for the article (max 5)."
    }
  },
  required: ["title", "summary", "content", "category", "tags"],
};

export const generateArticleContent = async (topic: string): Promise<GeneratedArticleContent> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a news article about: ${topic}. ensure the tone is professional and journalistic.`,
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