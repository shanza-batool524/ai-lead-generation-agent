import { Lead } from "./types";

export const seedLeads: Lead[] = [
  {
    id: "lead_aurora",
    name: "Ayesha Khan",
    company: "Aurora Clinics",
    email: "ayesha@auroraclinics.example",
    source: "Website form",
    status: "Qualified",
    score: "Hot",
    budget: "high",
    timeline: "urgent",
    projectType: "ai",
    nextAction: "book_call",
    summary: "Clinic operator wants an AI receptionist to answer patient questions, capture appointment requests, and reduce manual WhatsApp replies.",
    painPoint: "Staff spend hours answering repetitive appointment and pricing questions.",
    confidence: 92,
    estimatedValue: "$5k-$8k",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    messages: [
      { id: "m1", role: "lead", content: "We run 3 clinics and need automation for appointment inquiries.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString() },
      { id: "m2", role: "agent", content: "That sounds like a strong fit. Do you want the AI to qualify patients, answer FAQs, or book appointments directly?", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString() }
    ],
    activity: ["Lead qualified as Hot", "Suggested action: book discovery call"]
  },
  {
    id: "lead_nova",
    name: "Bilal Ahmed",
    company: "Nova Real Estate",
    email: "bilal@novarealty.example",
    source: "LinkedIn outreach",
    status: "Contacted",
    score: "Warm",
    budget: "medium",
    timeline: "soon",
    projectType: "automation",
    nextAction: "send_followup",
    summary: "Real estate team wants faster response times for property inquiries and lead routing.",
    painPoint: "Agents miss leads when inquiries arrive after business hours.",
    confidence: 80,
    estimatedValue: "$2k-$4k",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    messages: [
      { id: "m3", role: "lead", content: "Can you automate our property lead replies?", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      { id: "m4", role: "agent", content: "Yes. I can help qualify buyers, capture preferences, and notify the right agent instantly.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString() }
    ],
    activity: ["Follow-up simulation prepared", "Moved to Contacted"]
  },
  {
    id: "lead_kite",
    name: "Sara Malik",
    company: "Kite Commerce",
    email: "sara@kitecommerce.example",
    source: "Demo request",
    status: "New",
    score: "Cold",
    budget: "unknown",
    timeline: "flexible",
    projectType: "web",
    nextAction: "ask_more",
    summary: "E-commerce owner is exploring a customer support chatbot but has not shared budget or urgency yet.",
    painPoint: "Support tickets are growing during campaigns.",
    confidence: 58,
    estimatedValue: "Unknown",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    messages: [
      { id: "m5", role: "lead", content: "I want to know if an AI chatbot can help my store.", createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() }
    ],
    activity: ["New lead captured"]
  }
];
