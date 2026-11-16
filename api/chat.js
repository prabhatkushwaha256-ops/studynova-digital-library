
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "AI service is not configured"
    });
  }

  const messages = req.body?.messages;

  if (
    !Array.isArray(messages) ||
    messages.length < 1 ||
    messages.length > 20 ||
    messages.some(
      (m) =>
        !m ||
        !["user", "assistant"].includes(m.role) ||
        typeof m.content !== "string" ||
        m.content.length > 2000
    )
  ) {
    return res.status(400).json({
      error: "Invalid messages"
    });
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content:
                "You are StudyNova AI, a friendly study assistant. " +
                "Help students understand BCA, B.Tech, B.Com, " +
                "BBA, BA and B.Sc subjects. " +
                "Reply in Hindi or English based on the question. " +
                "Explain concepts clearly and admit uncertainty."
            },
            ...messages
          ]
        })
      }
    );

    if (!response.ok) {
      console.error("AI provider error:", response.status);
      return res.status(502).json({
        error: "AI service unavailable"
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (typeof reply !== "string") {
      return res.status(502).json({
        error: "Invalid AI response"
      });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("AI request failed:", error.message);

    return res.status(500).json({
      error: "Something went wrong"
    });
  }
}
