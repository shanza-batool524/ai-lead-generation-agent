"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

type Message = { role: "lead" | "agent"; content: string };

export default function PublicChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "agent", content: "Hi! I'm the LeadFlow AI assistant. Tell me a bit about your project or what you're looking to build, and I'll help you get started." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "lead", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, leadId })
      });
      const data = await res.json();

      if (data.lead) {
        setLeadId(data.lead.id);
        setMessages((prev) => [...prev, { role: "agent", content: data.reply }]);

        // If AI thinks we've gathered enough info
        if (["book_call", "send_proposal"].includes(data.lead.nextAction)) {
           // Small delay before showing "Done"
           setTimeout(() => setCompleted(true), 2000);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (completed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="animate-in fade-in zoom-in duration-500 max-w-md rounded-[3rem] bg-white p-10 shadow-xl ring-1 ring-slate-200">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="mt-8 text-3xl font-bold tracking-tight">Lead Qualified!</h1>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Our AI Agent has analyzed your needs and notified our team. You can now check the <strong>Dashboard</strong> to see how you've been scored and the strategy we've generated.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/" className="rounded-2xl bg-slate-950 px-6 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Info */}
      <aside className="hidden w-80 border-r border-slate-200 bg-white p-8 lg:flex flex-col">
        <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white"><Sparkles size={20} /></div>
            <p className="font-bold tracking-tight">LeadFlow AI</p>
        </div>
        <div className="mt-auto rounded-3xl bg-slate-50 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Portfolio Demo</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
                This is a <strong>Public Lead Widget</strong>. Send this link to a client—as they chat, their profile is built in real-time on your dashboard.
            </p>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm font-semibold text-slate-600">AI Qualification Agent is online</p>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto w-full">
          {messages.map((m, i) => (
            <div key={i} className={clsx("flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300", m.role === "lead" ? "flex-row-reverse" : "flex-row")}>
              <div className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-2xl shadow-sm", m.role === "agent" ? "bg-slate-950 text-white" : "bg-white ring-1 ring-slate-200 text-slate-400")}>
                {m.role === "agent" ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className={clsx("max-w-[80%] rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-sm", m.role === "agent" ? "bg-white ring-1 ring-slate-100 text-slate-800" : "bg-slate-950 text-white")}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white"><Bot size={20} /></div>
              <div className="flex items-center gap-1 rounded-3xl bg-white px-5 py-4 ring-1 ring-slate-100 shadow-sm">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
              </div>
            </div>
          )}
        </div>

        <footer className="border-t border-slate-200 bg-white p-6">
          <div className="mx-auto max-w-3xl flex gap-3">
            <input
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm outline-none transition focus:ring-2 focus:ring-slate-950"
              placeholder="Type your project details..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
                onClick={handleSend}
                disabled={loading}
                className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white shadow-soft transition hover:-translate-y-1 hover:shadow-xl disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
