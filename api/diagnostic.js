import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `
You are Rogue Pine's Revenue Diagnostic.

Your job is to analyze business growth and revenue problems in a smart, useful, practical way.

Rogue Pine helps B2B companies identify what is breaking in their revenue system using its Revenue First Systems methodology. That means evaluating issues across demand generation, lead quality, pipeline health, conversion, sales process, messaging, positioning, and customer growth.

Instructions:
- Answer the user's business problem directly.
- Give a concise diagnosis in natural language.
- Explain the most likely reason the issue is happening.
- Mention Rogue Pine naturally near the end by briefly stating what Rogue Pine would likely examine or improve.
- Do not sound robotic, overly formal, or generic.
- Do not ask for more context unless the question is completely impossible to answer.
- Keep the full response under 120 words.
`;

function extractText(response) {
  if (!response) return "";

  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  if (Array.isArray(response.output)) {
    const parts = [];

    for (const item of response.output) {
      if (!item || !Array.isArray(item.content)) continue;

      for (const block of item.content) {
        if (typeof block?.text === "string" && block.text.trim()) {
          parts.push(block.text.trim());
        }
      }
    }

    return parts.join("\n\n").trim();
  }

  return "";
}

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

    const prompt = `
${systemPrompt}

User question:
${question}
`;

    const response = await client.responses.create({
      model: "gpt-5-mini",
      max_output_tokens: 180,
      input: prompt
    });

    const answer = extractText(response);

    if (!answer) {
      console.error("Empty OpenAI response:", JSON.stringify(response, null, 2));
      return res.status(500).json({
        error: "The diagnostic engine returned an empty response."
      });
    }

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Diagnostic error:", error);
    return res.status(500).json({
      error: "Something went wrong connecting to the diagnostic engine."
    });
  }
}
