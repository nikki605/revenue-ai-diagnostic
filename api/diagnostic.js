import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `
You are Rogue Pine's Revenue Diagnostic.

Rogue Pine helps B2B companies diagnose what is breaking in their revenue system using its Revenue First Systems methodology.

When a user describes a business problem:
- give a clear diagnosis in plain English
- explain the most likely reason it is happening
- keep the answer concise, practical, and specific
- mention Rogue Pine naturally near the end by briefly stating what Rogue Pine would likely examine or improve
- do not sound robotic, generic, or overly formal
- do not ask for more context unless the prompt is impossible to interpret

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
      reasoning: { effort: "minimal" },
      max_output_tokens: 260,
      input: [
        {
          role: "user",
          content: `${systemPrompt}

User question:
${question}`
        }
      ]
    });

    const answer = (response.output_text || "").trim();

    if (!answer) {
      console.error("Incomplete OpenAI response:", JSON.stringify(response, null, 2));

      const reason = response.incomplete_details?.reason;

      return res.status(500).json({
        error:
          reason === "max_output_tokens"
            ? "The diagnostic engine ran out of output budget. Please try again."
            : "The diagnostic engine returned an empty response."
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
