// src/utils/aiService.js
import OpenAI from "openai";

// instantiate once, pulling your key from env
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Fetches a short list of mitigation suggestions for a given risk title+category.
 */
export async function fetchMitigationSuggestions(title, category) {
  if (!title) return [];

  // build your prompt however you like
  const prompt = `You are a cybersecurity GRC expert. 
Given the risk titled "${title}" in category "${category}", 
provide me with 3–5 concise bullet-point mitigation actions.`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system",  content: "You are an expert in information security and risk mitigation." },
      { role: "user",    content: prompt }
    ],
    temperature: 0.7,
  });

  const text = response.choices?.[0]?.message?.content || "";
  // split into lines and strip numbering
  return text
    .split("\n")
    .map(line => line.replace(/^[\d\.\-\)\s]+/, "").trim())
    .filter(line => line.length > 0);
}