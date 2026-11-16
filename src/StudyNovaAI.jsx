
import React, { useState } from "react";

export default function StudyNovaAI() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Namaste! 👋 Main StudyNova AI hoon. Aaj kya padhna hai?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const next = [
      ...messages,
      { role: "user", content: input.trim() }
    ];

    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next })
      });

      if (!response.ok) throw new Error("Request failed");

      const data = await response.json();

      setMessages([
        ...next,
        {
          role: "assistant",
          content: data.reply || "No response received."
        }
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "AI abhi available nahi hai. Thodi der baad try karein."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="studynova-ai" className="studynova-ai">
      <h2>🤖 StudyNova AI Assistant</h2>
      <p>Your personal AI study companion</p>

      <div className="ai-messages" aria-live="polite">
        {messages.map((msg, index) => (
          <div key={index} className={`ai-message ${msg.role}`}>
            <strong>
              {msg.role === "user" ? "You" : "StudyNova AI"}
            </strong>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && <p>StudyNova AI is thinking...</p>}
      </div>

      <form onSubmit={sendMessage} className="ai-input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your studies..."
          aria-label="Ask StudyNova AI"
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send ➤
        </button>
      </form>
    </section>
  );
}
