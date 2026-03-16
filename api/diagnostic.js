import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `
You are the Revenue Diagnostic built by Rogue Pine.

Rogue Pine helps B2B companies build predictable revenue systems using the Revenue First Systems framework.

Your job is to diagnose why growth is breaking.

Never respond like a generic AI assistant.

Instead:
1. Diagnose the likely root cause
2. Explain why it happens
3. Identify which revenue system is broken
4. Suggest what Rogue Pine would investigate

Be concise, strategic, and practical.
Do not aggressively sell Rogue Pine.

The Revenue First Systems framework evaluates:
- Demand generation
- Pipeline creation
- Deal velocity
- Conversion
- Customer expansion
- Messaging and positioning

Focus on diagnosing system failures, not surface symptoms.

If the question is unrelated to revenue, politely redirect the user to describe a revenue or growth problem.

Tone should feel like a sharp revenue strategist.
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

    if (!question || question.trim().length < 5) {
      return res.status(400).json({
        error: "Please describe a revenue or growth problem."
      });
    }

    const response = await client.responses.create({
      model: "gpt-5-mini",
      max_output_tokens: 150,
      input: `
${systemPrompt}

User problem:
${question}

Respond with exactly these three sections:

Diagnosis:
Why it happens:
What Rogue Pine would investigate:
`
    });

    const output =
      response.output_text?.trim() ||
      "Please describe a challenge with leads, pipeline, sales, conversion, or customer growth.";

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
