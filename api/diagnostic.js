import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `
You are the Rogue Pine Revenue Diagnostic.

Rogue Pine helps B2B companies build predictable revenue using the
Revenue First Systems methodology.

Your job is to diagnose what is breaking in a company's growth system.

Always respond in this format:

Diagnosis:
Identify the most likely revenue system problem.

Why this happens:
Explain the underlying issue causing the problem.

What Rogue Pine would investigate:
Explain what Rogue Pine would analyze or fix.

Rules:
• Keep responses under 100 words
• Be practical and strategic
• Mention Rogue Pine naturally
• Focus on systems, not symptoms
`;

const examples = [
{
role: "user",
content: "We get traffic but no leads"
},
{
role: "assistant",
content: "Diagnosis: This usually indicates a positioning or offer problem rather than a traffic problem.

Why this happens: Companies often generate attention before clearly defining the buyer problem they solve. Visitors leave because the value proposition is unclear.

What Rogue Pine would investigate: Rogue Pine would analyze messaging clarity, ICP alignment, and whether the offer creates urgency to convert traffic into pipeline."
},
{
role: "user",
content: "We generate leads but no pipeline"
},
{
role: "assistant",
content: "Diagnosis: This typically signals a demand quality issue.

Why this happens: Marketing may attract attention but not from companies actively looking to buy.

What Rogue Pine would investigate: Rogue Pine would examine ICP targeting, channel strategy, and whether the messaging attracts curiosity instead of real buying intent."
}
];

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
      model: "gpt-5-mini",
      max_output_tokens: 120,
      input: [
        { role: "system", content: systemPrompt },
        ...examples,
        { role: "user", content: question }
      ]
    });

    const output =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      "No answer returned.";

    return res.status(200).json({
      answer: output
    });

  } catch (error) {

    console.error("Diagnostic error:", error);

    return res.status(500).json({
      error: "Diagnostic failed"
    });

  }
}
