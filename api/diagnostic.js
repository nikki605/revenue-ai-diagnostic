import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const response = await client.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "system",
          content: `
You are the Revenue First Systems diagnostic engine.

Your job is to diagnose revenue problems in B2B companies.

Focus on:
- pipeline health
- lead quality
- sales & marketing alignment
- offer clarity
- conversion friction
- reporting visibility

Be concise, strategic, and practical.
`
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    return res.status(200).json({
      answer: response.output_text
    });
  } catch (error) {
    console.error("Diagnostic failed:", error);
    return res.status(500).json({
      error: "Diagnostic failed"
    });
  }
}
