const { Groq } = require("groq-sdk");

async function testGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY not found in environment (use --env-file=.env)");
    return;
  }

  const groq = new Groq({ apiKey });
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say hello and confirm you are working." }],
      model: "llama-3.3-70b-versatile",
    });
    console.log("Groq Response:", chatCompletion.choices[0].message.content);
  } catch (err) {
    console.error("Groq Error:", err.message);
  }
}

testGroq();
