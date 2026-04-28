import { NextResponse } from "next/server";
import { upsertLead } from "@/lib/db";
import { Lead } from "@/lib/types";

export async function POST() {
  const now = new Date().toISOString();
  const id = `lead_demo_${Date.now()}`;
  const lead: Lead = {
    id,
    name: "Hamza Qureshi",
    company: "ScalePoint Labs",
    email: "hamza@scalepoint.example",
    source: "Live website demo",
    status: "Qualified",
    score: "Hot",
    budget: "high",
    timeline: "urgent",
    projectType: "ai",
    nextAction: "book_call",
    summary: "Founder needs an AI lead handling system that replies instantly, qualifies prospects, and sends hot leads to the sales team before competitors respond.",
    painPoint: "Manual lead response is slow, and high-intent prospects are being lost after hours.",
    reasoning: "High intent detected due to 'launching this month' requirement and 'flexible' high budget. The volume (80+ leads/week) justifies a premium automation solution.",
    suggestedReply: "Hi Hamza, I've analyzed your volume. We can definitely hit that 30-day launch window. I've drafted a technical roadmap for ScalePoint Labs—can we jump on a 10-min call tomorrow at 2 PM to review?",
    confidence: 96,
    estimatedValue: "$6k-$10k",
    createdAt: now,
    updatedAt: now,
    messages: [
      { id: `${id}_m1`, role: "lead", content: "Hi, we get 80+ inbound leads a week and need an AI agent to qualify them instantly. Budget is flexible if it can launch this month.", createdAt: now },
      { id: `${id}_m2`, role: "agent", content: "This is a strong fit. I can help you qualify leads instantly, capture budget/timeline, and route hot opportunities to your sales team. Should we book a short discovery call?", createdAt: now }
    ],
    activity: ["Demo scenario completed", "AI qualified lead as Hot", "Strategy: Aggressive follow-up for high-value prospect"]
  };

  await upsertLead(lead);
  return NextResponse.json({ lead, message: "Demo scenario completed: new Hot lead qualified with Strategic Analysis." });
}
