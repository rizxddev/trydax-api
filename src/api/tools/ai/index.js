import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  const creator = "TryDax";
  const { text } = req.query;

  if (!text) {
    return res.status(400).json({
      status: false,
      code: 400,
      creator,
      message: "Text parameter is required for AI chat."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      status: false,
      code: 500,
      creator,
      message: "GEMINI_API_KEY is not configured on the server."
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: text,
    });

    res.json({
      status: true,
      code: 200,
      creator,
      result: {
        prompt: text,
        answer: response.text
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      code: 500,
      creator,
      message: "AI processing failed: " + error.message
    });
  }
}
