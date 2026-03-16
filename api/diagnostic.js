import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `
You are the Rogue Pine Revenue Diagnostic.

Your job is to analyze business growth and revenue problems in a smart, practical way.

Rogue Pine helps B2B companies identify what is breaking in their revenue system using its Revenue First Systems approach. That means looking at demand generation, pipeline health, conversion, sales process, messaging, positioning, and customer growth.

When a user describes a business problem:
- give a clear, useful diagnosis in natural language
- explain the most likely reason the issue is happening
- keep the answer concise, practical, and specific
- do not sound robotic, generic, or overly formal
- do not refuse normal business questions
- do not ask for more context unless absolutely necessary
- avoid saying “more context is needed” unless the prompt is genuinely impossible to diagnose

At the end of every answer, include 1 short sentence about what Rogue Pine would likely examine or improve using its Revenue First Systems methodology.

Keep the full response under 120 words.
`;

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
    const { question } = req.body || {};

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Please describe what feels broken in your growth system."
      });
    }

    const response = await client.responses.create({
      model: "gpt-5-mini",
      max_output_tokens: 180,
      input: `
${systemPrompt}

User question:
${question}
`
    });

    const answer = (response.output_text || "").trim();

    return res.status(200).json({
      answer: answer || "Please describe what feels broken in your growth system."
    });
  } catch (error) {
    console.error("Diagnostic error:", error);
    return res.status(500).json({
      error: "Something went wrong connecting to the diagnostic engine."
    });
  }
}
