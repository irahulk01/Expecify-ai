const fs = require("fs");
// load manually
const envRaw = fs.readFileSync(".env", "utf-8");
const keyMatch = envRaw.match(/GEMINI_API_KEY=(.+)/);
if (keyMatch) {
  process.env.GEMINI_API_KEY = keyMatch[1].trim();
}

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const modelOptions = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY
    ).then((r) => r.json());
    console.log(JSON.stringify(modelOptions, null, 2));
  } catch (e) {
    console.error(e);
  }
}

run();
