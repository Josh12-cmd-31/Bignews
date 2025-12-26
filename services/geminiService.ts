
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedArticleContent, Category } from "../types";

// Initialize Gemini Client using the environment variable directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to sanitize AI response if it contains markdown formatting
const parseAIResponse = (text: string) => {
  const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleanJson);
};

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
      enum: ['Technology', 'Politics', 'Health', 'Lifestyle', 'Sports', 'Football', 'Food', 'Business', 'Science', 'Education', 'Entertainment']
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
       prompt = `Write a deep-dive professional news report on the trending topic: "${input}". Use Google Search to find current facts, recent developments, and expert opinions from today. Include analysis and future implications. Use HTML <p> tags for formatting. Generate an impactful subject banner text as well.`;
    } else {
      prompt = `Write a news article about: ${input}. ensure the tone is professional and journalistic. Generate an impactful subject banner text as well.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: mode === 'automation' ? [{googleSearch: {}}] : undefined,
        responseMimeType: "application/json",
        responseSchema: articleSchema,
        systemInstruction: "You are a professional lead journalist for a major news network called 'Big News'. You write engaging, factual, and well-structured articles."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return parseAIResponse(text) as GeneratedArticleContent;
  } catch (error) {
    console.error("Error generating article:", error);
    throw error;
  }
};

export const identifyTrendingTopic = async (categories: string[]): Promise<{topic: string, category: Category}> => {
  // Use Google Search to find REAL current trends
  const prompt = `Search for today's most trending and impactful news globally in these specific categories: ${categories.join(', ')}. Pick ONE specific, high-engagement story that is breaking right now (e.g. a specific football match result, a tech launch, or a major political event). Return a JSON object with "topic" (the specific news event) and "category" (the most relevant category from the provided list).`;
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING },
      category: { 
        type: Type.STRING,
        enum: ['Technology', 'Politics', 'Health', 'Lifestyle', 'Sports', 'Football', 'Food', 'Business', 'Science', 'Education', 'Entertainment']
      }
    },
    required: ["topic", "category"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{googleSearch: {}}],
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are a trend-spotting bot for Big News. Your goal is to find real-world, high-traffic news events happening TODAY. Be specific."
    }
  });

  const text = response.text;
  if (!text) return { topic: "Global Markets Update", category: "Business" as Category };

  return parseAIResponse(text) as {topic: string, category: Category};
};
