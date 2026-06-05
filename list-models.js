const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY not found");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    // In SDK, genAI.listModels() can list the models
    const result = await genAI.listModels();
    console.log("Supported models:");
    for (const model of result.models) {
      console.log(`${model.name} (${model.displayName}) - supportedMethods: ${model.supportedMethods.join(', ')}`);
    }
  } catch (err) {
    console.error("Error listing models:", err.message);
  }
}

run();
