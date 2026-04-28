"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  Bot,
  Calendar,
  CheckCircle2,
  LayoutDashboard,
  Mail,
  MessageCircle,
  Play,
  Search,
  Send,
  Sparkles,
  UsersRound,
  Workflow,
  Zap,
  Info,
  Quote
} from "lucide-react";
import clsx from "clsx";
import { Badge } from "./Badge";
import { Lead, LeadScore, LeadStatus } from "@/lib/types";

const statusColumns: LeadStatus[] = ["New", "Qualified", "Contacted", "Proposal", "Closed"];

function toneForScore(score: LeadScore | string) {
  if (score === "Hot") return "green" as const;
  if (score === "Warm") return "amber" as const;
  return "blue" as const;
}

function scoreLabel(score: string) {
  if (score === "Hot") return "🔥 Hot";
  if (score === "Warm") return "🟡 Warm";
  return "❄️ Cold";
}

function nextActionLabel(action: string) {
  return action.replaceAll("_", " ");
}

function SkeletonCard() {
  return <div className="h-28 animate-pulse rounded-[1.6rem] bg-white/70 ring-1 ring-slate-200" />;
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [message, setMessage] = useState("Hi, I need an AI system for my website leads. Budget is around $4000 and I need it this month.");
  const [leadId, setLeadId] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [demoRunning, setDemoRunning] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");

  async function fetchLeads(preferredId?: string) {
    const res = await fetch("/api/leads", { cache: "no-store" });
    const data: Lead[] = await res.json();
    setLeads(data);
    const preferred = preferredId ? data.find((lead) => lead.id === preferredId) : null;
    setSelected(preferred || selected || data[0] || null);
    setPageLoading(false);
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = useMemo(
    () => leads.filter((lead) => `${lead.name} ${lead.company} ${lead.summary} ${lead.projectType}`.toLowerCase().includes(query.toLowerCase())),
    [leads, query]
  );

  const stats = useMemo(() => ({
    total: leads.length,
    hot: leads.filter((lead) => lead.score === "Hot").length,
    pipeline: leads.filter((lead) => ["Qualified", "Contacted", "Proposal"].includes(lead.status)).length,
    avgConfidence: Math.round(leads.reduce((sum, lead) => sum + lead.confidence, 0) / Math.max(leads.length, 1))
  }), [leads]);

  const chart = statusColumns.map((status) => ({ name: status, leads: leads.filter((lead) => lead.status === status).length }));

  async function sendMessage() {
    if (!message.trim()) return;
    setLoading(true);
    setToast("AI is analyzing lead intent and drafting a strategic follow-up...");
    const res = await fetch("/api/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, leadId: leadId || selected?.id })
    });
    const data = await res.json();
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);

    if (data.lead) {
      setSelected(data.lead);
      setLeadId(data.lead.id);
      setMessage("");
      await fetchLeads(data.lead.id);
      setToast("Lead updated. See 'AI Strategic Analysis' for why this lead was scored.");
    } else {
      setToast(data.error || "Something went wrong.");
    }
  }

  async function updateStatus(id: string, status: LeadStatus) {
    const res = await fetch(`/api/leads/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const updated = await res.json();
    setSelected(updated);
    await fetchLeads(updated.id);
    setToast(`Lead moved to ${status}.`);
  }

  async function simulate(action: string) {
    if (!selected) return;
    setActionLoading(action);
    const res = await fetch("/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: selected.id, action })
    });
    const data = await res.json();
    await new Promise((resolve) => setTimeout(resolve, 500));
    setActionLoading("");
    if (data.lead) setSelected(data.lead);
    await fetchLeads(data.lead?.id);
    setToast(data.message || "Action simulated.");
  }

  async function runDemo() {
    setDemoRunning(true);
    setToast("Simulating inbound lead flow: AI capture → Evaluation → Strategy generation...");
    const res = await fetch("/api/demo", { method: "POST" });
    const data = await res.json();
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSelected(data.lead);
    setDemoRunning(false);
    await fetchLeads(data.lead.id);
    setToast(data.message);
  }

  return (
    <main className="subtle-grid min-h-screen p-4 text-slate-950 md:p-6">
      <div className="mx-auto grid max-w-[1540px] grid-cols-1 gap-5 lg:grid-cols-[270px_1fr]">
        <aside className="glass hidden rounded-[2rem] p-5 lg:block">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-soft transition hover:scale-105"><Sparkles size={20} /></div>
            <div><p className="font-bold">LeadFlow AI</p><p className="text-xs text-slate-500">AI sales command center</p></div>
          </div>
          <nav className="mt-10 space-y-2 text-sm font-medium text-slate-600">
            {[[LayoutDashboard, "Dashboard"], [Bot, "AI Agent"], [Workflow, "Pipeline"], [UsersRound, "Leads"]].map(([Icon, label]: any, index) => (
              <div key={label} className={clsx("flex items-center gap-3 rounded-2xl px-4 py-3 transition duration-200", index === 0 ? "bg-slate-950 text-white shadow-soft" : "hover:-translate-y-0.5 hover:bg-white hover:shadow-sm")}><Icon size={18} />{label}</div>
            ))}
          </nav>
          <div className="mt-10 rounded-3xl bg-slate-950 p-5 text-white shadow-soft">
            <p className="text-sm font-semibold">Agentic Workflow</p>
            <ol className="mt-3 space-y-2 text-xs leading-5 text-slate-300">
              <li>1. Capture inbound message.</li>
              <li>2. Extract intent & metadata.</li>
              <li>3. Generate internal reasoning.</li>
              <li>4. Score & Recommend next step.</li>
            </ol>
          </div>
        </aside>

        <section className="space-y-5">
          <header className="glass rounded-[2rem] p-5 md:p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-semibold text-slate-500">Enterprise AI Sales Agent · Production Neon Backend</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">LeadFlow AI Dashboard</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">This agent doesn't just store data—it analyzes project feasibility, explains its reasoning, and drafts follow-up strategies for your sales team.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-200"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" /> System Live</div>
                <button onClick={runDemo} disabled={demoRunning} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"><Play size={16} />{demoRunning ? "Running demo..." : "Run Demo"}</button>
              </div>
            </div>
            {toast && <div className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200">{toast}</div>}
          </header>

          {pageLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[["Total leads", stats.total, UsersRound], ["Hot leads", stats.hot, Sparkles], ["Active pipeline", stats.pipeline, Workflow], ["AI confidence", `${stats.avgConfidence}%`, CheckCircle2]].map(([label, value, Icon]: any) => (
                <div key={label} className="glass rounded-[1.6rem] p-5 transition duration-200 hover:-translate-y-1 hover:shadow-xl"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><Icon className="text-slate-400" size={18} /></div><p className="mt-4 text-3xl font-bold">{value}</p></div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_.95fr]">
            <div className="glass rounded-[2rem] p-5 transition duration-200 hover:shadow-xl">
              <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Pipeline distribution</h2><Badge tone="blue">Structured AI</Badge></div>
              <div className="mt-4 h-52"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart}><defs><linearGradient id="leadFill" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#0f172a" stopOpacity={0.24}/><stop offset="95%" stopColor="#0f172a" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="name" tickLine={false} axisLine={false} /><Tooltip /><Area dataKey="leads" stroke="#0f172a" fill="url(#leadFill)" strokeWidth={3} /></AreaChart></ResponsiveContainer></div>
            </div>

            <div className="glass rounded-[2rem] p-5 transition duration-200 hover:shadow-xl">
              <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Inbound console</h2><Badge tone="violet">Gemini 2.5</Badge></div>
              <textarea className="mt-4 h-28 w-full resize-none rounded-3xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:ring-2 focus:ring-slate-950" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Paste a lead message or CRM note here..." />
              <div className="mt-3 flex gap-2">
                <select className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none" value={leadId} onChange={(event) => setLeadId(event.target.value)}><option value="">Create new lead</option>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name} - {lead.company}</option>)}</select>
                <button disabled={loading} onClick={sendMessage} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-60"><Send size={16} />{loading ? "Analyzing..." : "Process with AI"}</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_450px]">
            <div className="space-y-5">
              <div className="glass rounded-[2rem] p-5">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><h2 className="text-lg font-bold">Lead workspace</h2><div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={16}/><input className="rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-slate-950" placeholder="Search leads" value={query} onChange={(event) => setQuery(event.target.value)} /></div></div>
                <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                  {filtered.length === 0 ? (
                    <div className="grid place-items-center p-10 text-center"><Zap className="mb-3 text-slate-400" /><p className="font-bold">No leads found</p><p className="mt-1 text-sm text-slate-500">Run the demo scenario to see the full Agentic workflow.</p><button onClick={runDemo} className="mt-4 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">Generate Demo Lead</button></div>
                  ) : (
                    <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-4">Lead</th><th className="p-4">Score</th><th className="p-4">Type/Budget</th><th className="p-4">Status</th><th className="p-4">Next action</th></tr></thead><tbody>{filtered.map((lead) => <tr key={lead.id} onClick={() => setSelected(lead)} className={clsx("cursor-pointer border-t border-slate-100 transition hover:bg-slate-50", selected?.id === lead.id && "bg-slate-50")}><td className="p-4"><p className="font-semibold">{lead.name}</p><p className="text-xs text-slate-500">{lead.company}</p></td><td className="p-4"><Badge tone={toneForScore(lead.score)}>{scoreLabel(lead.score)}</Badge></td><td className="p-4 text-slate-600">{lead.projectType} / {lead.budget}</td><td className="p-4"><select onClick={(event) => event.stopPropagation()} value={lead.status} onChange={(event) => updateStatus(lead.id, event.target.value as LeadStatus)} className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs outline-none">{statusColumns.map((status) => <option key={status}>{status}</option>)}</select></td><td className="p-4 capitalize text-slate-600">{nextActionLabel(lead.nextAction)}</td></tr>)}</tbody></table>
                  )}
                </div>
              </div>

              <div className="glass rounded-[2rem] p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold"><Workflow size={18} /> Pipeline visualization</h2>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">{statusColumns.map((status) => <div key={status} className="rounded-3xl border border-slate-200 bg-white p-3"><p className="mb-3 text-sm font-bold">{status}</p>{leads.filter((lead) => lead.status === status).map((lead) => <button key={lead.id} onClick={() => setSelected(lead)} className={clsx("mb-2 w-full rounded-2xl p-3 text-left text-xs transition hover:-translate-y-0.5", selected?.id === lead.id ? "bg-slate-950 text-white" : "bg-slate-50 hover:bg-slate-100")}><p className="font-semibold">{lead.name}</p><p className={clsx("mt-1", selected?.id === lead.id ? "text-slate-400" : "text-slate-500")}>{scoreLabel(lead.score)}</p></button>)}</div>)}</div>
              </div>
            </div>

            <aside className="glass rounded-[2rem] p-5">
              {selected ? <>
                <div className="flex items-start justify-between gap-4"><div><p className="text-sm text-slate-500">Selected lead intelligence</p><h2 className="mt-1 text-2xl font-bold">{selected.name}</h2><p className="text-sm text-slate-500">{selected.company} · {selected.email}</p></div><Badge tone={toneForScore(selected.score)}>{scoreLabel(selected.score)}</Badge></div>

                <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white shadow-lg">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400"><Sparkles size={14} /> AI Strategic Summary</div>
                  <p className="mt-3 text-sm leading-7 text-slate-100">{selected.summary}</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><p className="text-xs text-slate-500">Budget</p><p className="font-bold capitalize">{selected.budget}</p></div><div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><p className="text-xs text-slate-500">Timeline</p><p className="font-bold capitalize">{selected.timeline}</p></div><div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><p className="text-xs text-slate-500">Value</p><p className="font-bold">{selected.estimatedValue}</p></div><div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><p className="text-xs text-slate-500">Confidence</p><p className="font-bold">{selected.confidence}%</p></div></div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-3xl bg-emerald-50/50 p-4 ring-1 ring-emerald-100">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-700"><Info size={14} /> AI Internal Reasoning</div>
                    <p className="mt-2 text-xs italic leading-5 text-emerald-900">{selected.reasoning || "Analyzing lead data points..."}</p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><Quote size={14} /> Suggested follow-up strategy</div>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-800">"{selected.suggestedReply || "Drafting a high-conversion response..."}"</p>
                  </div>
                </div>

                <div className="mt-6"><p className="text-sm font-bold">Recommended action hooks</p><div className="mt-3 grid grid-cols-3 gap-2"><button onClick={() => simulate("whatsapp")} className="rounded-2xl bg-slate-950 p-3 text-white transition hover:-translate-y-0.5 shadow-md"><MessageCircle className="mx-auto" size={18}/><span className="mt-1 block text-[10px] font-medium">{actionLoading === "whatsapp" ? "Preparing..." : "WhatsApp"}</span></button><button onClick={() => simulate("email")} className="rounded-2xl bg-white p-3 ring-1 ring-slate-200 transition hover:-translate-y-0.5 shadow-sm"><Mail className="mx-auto" size={18}/><span className="mt-1 block text-[10px] font-medium">{actionLoading === "email" ? "Drafting..." : "Email"}</span></button><button onClick={() => simulate("calendar")} className="rounded-2xl bg-white p-3 ring-1 ring-slate-200 transition hover:-translate-y-0.5 shadow-sm"><Calendar className="mx-auto" size={18}/><span className="mt-1 block text-[10px] font-medium">{actionLoading === "calendar" ? "Booking..." : "Calendar"}</span></button></div></div>

                <div className="mt-6"><p className="text-sm font-bold">Conversation history</p><div className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">{selected.messages.map((msg) => <div key={msg.id} className={clsx("rounded-2xl p-3 text-sm", msg.role === "agent" ? "bg-slate-100 text-slate-800" : "bg-white ring-1 ring-slate-200")}><p className="text-[10px] font-bold uppercase tracking-wider opacity-40">{msg.role}</p><p className="mt-1 leading-5">{msg.content}</p></div>)}</div></div>
                <div className="mt-6"><p className="text-sm font-bold">Activity log</p><div className="mt-2 space-y-2">{selected.activity.slice(0, 5).map((item, index) => <p key={`${item}_${index}`} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-[11px] text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-slate-300" /> {item}</p>)}</div></div>
              </> : <div className="grid place-items-center py-20 text-center"><UsersRound className="mb-4 h-12 w-12 text-slate-200" /><p className="font-bold text-slate-400">Select a lead to view intelligence</p><p className="mt-1 text-sm text-slate-400">AI analysis and reasoning will appear here.</p></div>}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
