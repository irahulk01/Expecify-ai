const { Groq } = require("groq-sdk");

async function benchmarkModels() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("No GROQ_API_KEY");
    return;
  }
  const groq = new Groq({ apiKey });

  const models = [
    "groq/compound-mini",
    "groq/compound",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
    "qwen/qwen3.6-27b",
  ];

  const prompt = "Log an expense: Spent 450 on Coffee";

  console.log("=== GROQ MODEL BENCHMARK ===");
  for (const model of models) {
    try {
      const startTime = Date.now();
      const res = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: model,
        max_tokens: 150,
      });
      const endTime = Date.now();
      const elapsed = endTime - startTime;
      const content = res.choices[0]?.message?.content || "";
      console.log(`\nModel: ${model}`);
      console.log(`Latency: ${elapsed} ms`);
      console.log(`Preview: ${content.trim().slice(0, 120)}...`);
    } catch (err) {
      console.log(`\nModel: ${model} -> FAILED: ${err.message}`);
    }
  }
}

benchmarkModels();
