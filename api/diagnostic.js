import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `
You are the Rogue Pine Revenue Diagnostic.

Rogue Pine helps B2B companies build predictable revenue systems using the Revenue First Systems methodology.

Your job is to diagnose what is most likely breaking in a company's growth system.

Always respond in exactly these three sections:

Diagnosis:
State the most likely root cause.

Why it happens:
Explain the underlying issue in plain business language.

What Rogue Pine would investigate:
Explain what Rogue Pine would review, diagnose, or fix using the Revenue First Systems methodology.

Rules:
- Keep the full response under 120 words
- Be practical, sharp, and strategic
- Always reference Rogue Pine naturally in the final section
- Focus on revenue systems such as demand generation, pipeline, deal velocity, conversion, customer growth, and messaging
- Do not refuse the question unless it is completely empty
- Do not sound like a generic chatbot
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

    const prompt = `
${systemPrompt}

User problem:
${question}

Respond now.
`;

    const response = await client.responses.create({
      model: "gpt-5-mini",
      max_output_tokens: 180,
      input: prompt
    });

    const output =
      response.output_text?.trim() ||
      "Diagnosis: The issue is not yet clear.\n\nWhy it happens: More context may be needed to isolate the revenue constraint.\n\nWhat Rogue Pine would investigate: Rogue Pine would clarify the demand, pipeline, and conversion signals first to identify the real system break.";

    return res.status(200).json({
      answer: output
    });
  } catch (error) {
    console.error("Diagnostic error:", error);

    return res.status(500).json({
      error: "Something went wrong connecting to the diagnostic engine."
    });
  }
}
