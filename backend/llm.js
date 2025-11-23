// backend/llm.js - GROQ FREE API VERSION
const Groq = require("groq-sdk");
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function checkRuleWithLLM(text, rule) {
  const prompt = `
You MUST return ONLY valid JSON:
{
  "rule": "<rule>",
  "status": "pass" | "fail",
  "evidence": "<text or empty>",
  "reasoning": "<1-2 sentences>",
  "confidence": <0-100>
}

Document text:
${text}

Rule: "${rule}"
Return only JSON.
`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: prompt }
      ]
    });

    const output = response.choices[0].message.content.trim();

    const match = output.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON detected");

    const parsed = JSON.parse(match[0]);

    return {
      rule,
      status: parsed.status,
      evidence: parsed.evidence,
      reasoning: parsed.reasoning,
      confidence: parsed.confidence
    };

  } catch (err) {
    console.log("GROQ ERROR", err.message);
    return {
      rule,
      status: "fail",
      evidence: "",
      reasoning: "Groq LLM failed or invalid JSON",
      confidence: 0
    };
  }
}

module.exports = { checkRuleWithLLM };
