/**
 * Minimal Groq API client — runs entirely in the browser using the REST API.
 * Model: llama3-8b-8192 (fast, free tier)
 */
const GROQ_API  = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

export async function groqChat(
  systemPrompt: string,
  userMessage:  string,
  maxTokens = 512,
): Promise<string> {
  const key = import.meta.env.VITE_GROQ_API_KEY as string;
  if (!key) throw new Error("VITE_GROQ_API_KEY not set");

  const res = await fetch(GROQ_API, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage  },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() ?? "";
}
