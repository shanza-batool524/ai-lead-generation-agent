import { GoogleGenAI, Type } from "@google/genai";
import { AgentOutput, Lead, LeadScore } from "./types";

const fallback: AgentOutput = {
  reply: "Thanks — I can help with that. What budget range and timeline should I consider for this project?",
  name: "Unknown Lead",
  company: "Unknown Company",
  email: "unknown@example.com",
  budget: "unknown",
  timeline: "unknown",
  projectType: "unknown",
  leadScore: "Cold",
  nextAction: "ask_more",
  summary: "Lead needs more qualification before a proposal can be prepared.",
  painPoint: "Unknown",
  reasoning: "The lead has provided initial interest but lacks specific project constraints like budget or urgency.",
  suggestedReply: "I'd love to learn more about your goals. Do you have a specific budget range or launch date in mind?",
  confidence: 45,
  estimatedValue: "Unknown"
};

export const leadSchema = {
  type: Type.OBJECT,
  properties: {
    reply: { type: Type.STRING },
    name: { type: Type.STRING },
    company: { type: Type.STRING },
    email: { type: Type.STRING },
    budget: { type: Type.STRING, enum: ["high", "medium", "low", "unknown"] },
    timeline: { type: Type.STRING, enum: ["urgent", "soon", "flexible", "unknown"] },
    projectType: { type: Type.STRING, enum: ["web", "mobile", "ai", "full-stack", "automation", "other", "unknown"] },
    leadScore: { type: Type.STRING, enum: ["Hot", "Warm", "Cold"] },
    nextAction: { type: Type.STRING, enum: ["ask_more", "book_call", "send_proposal", "send_followup", "not_interested"] },
    summary: { type: Type.STRING },
    painPoint: { type: Type.STRING },
    reasoning: { type: Type.STRING },
    suggestedReply: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    estimatedValue: { type: Type.STRING }
  },
  required: ["reply", "name", "company", "email", "budget", "timeline", "projectType", "leadScore", "nextAction", "summary", "painPoint", "reasoning", "suggestedReply", "confidence", "estimatedValue"]
};

function mergeValue<T>(incoming: T, previous: T): T {
  return incoming && incoming !== "unknown" ? incoming : previous;
}

export function adjustScore(data: AgentOutput): LeadScore {
  let points = 0;
  if (data.budget === "high") points += 35;
  if (data.budget === "medium") points += 20;
  if (data.timeline === "urgent") points += 35;
  if (data.timeline === "soon") points += 20;
  if (["ai", "automation", "full-stack"].includes(data.projectType)) points += 20;
  if (["book_call", "send_proposal"].includes(data.nextAction)) points += 15;
  if (data.confidence >= 80) points += 10;

  if (points >= 70) return "Hot";
  if (points >= 35) return "Warm";
  return data.leadScore || "Cold";
}

export function buildPrompt(message: string, lead?: Lead) {
  const history = lead?.messages.map((m) => `${m.role}: ${m.content}`).join("\n") || "No previous messages.";
  const existing = lead ? JSON.stringify({
    name: lead.name,
    company: lead.company,
    email: lead.email,
    budget: lead.budget,
    timeline: lead.timeline,
    projectType: lead.projectType,
    score: lead.score,
    nextAction: lead.nextAction,
    summary: lead.summary,
    painPoint: lead.painPoint
  }, null, 2) : "No existing lead profile.";

  return `You are a premium AI lead qualification agent for an agency that sells app development, web development, backend systems, automation, and agentic AI solutions.

Your goals:
- Reply in a concise, professional, helpful sales-assistant tone.
- Extract or update the lead profile from the full conversation.
- As an "Agentic" system, you must provide your INTERNAL REASONING for the classification and score.
- Draft a SUGGESTED REPLY for a human sales agent to use as a follow-up.
- Classify budget: high means enterprise/high-value, medium means serious SMB/startup, low means very small or unclear affordability.
- Classify timeline: urgent means days/this week/asap, soon means within 1-8 weeks, flexible means no pressure.

Existing lead profile:
${existing}

Conversation history:
${history}

Latest lead message:
${message}`;
}

function safeParse(text: string): AgentOutput {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return { ...fallback, ...JSON.parse(cleaned) };
  } catch {
    return fallback;
  }
}

export async function qualifyLead(message: string, lead?: Lead): Promise<AgentOutput> {
  if (!process.env.GEMINI_API_KEY) {
    const demo = { ...fallback, reply: "Demo mode: I captured this lead. What budget range and launch timeline should I use to qualify the opportunity?", summary: message.slice(0, 160) || fallback.summary };
    demo.leadScore = adjustScore(demo);
    return demo;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: buildPrompt(message, lead),
      config: {
        responseMimeType: "application/json",
        responseSchema: leadSchema,
        temperature: 0.35
      }
    });

    const parsed = safeParse(response.text || "{}");
    return { ...parsed, leadScore: adjustScore(parsed), confidence: Math.max(0, Math.min(100, Number(parsed.confidence || 50))) };
  } catch (error) {
    console.error("Gemini error", error);
    return fallback;
  }
}

export function applyAgentOutput(message: string, output: AgentOutput, previous?: Lead): Lead {
  const now = new Date().toISOString();
  const id = previous?.id || `lead_${Date.now()}`;
  const leadMessage = { id: `msg_${Date.now()}_u`, role: "lead" as const, content: message, createdAt: now };
  const agentMessage = { id: `msg_${Date.now()}_a`, role: "agent" as const, content: output.reply, createdAt: now };
  const score = adjustScore(output);

  return {
    id,
    name: mergeValue(output.name, previous?.name || "Unknown Lead"),
    company: mergeValue(output.company, previous?.company || "Unknown Company"),
    email: mergeValue(output.email, previous?.email || "unknown@example.com"),
    source: previous?.source || "AI chat widget",
    status: previous?.status || (score === "Hot" ? "Qualified" : "New"),
    score,
    budget: mergeValue(output.budget, previous?.budget || "unknown"),
    timeline: mergeValue(output.timeline, previous?.timeline || "unknown"),
    projectType: mergeValue(output.projectType, previous?.projectType || "unknown"),
    nextAction: output.nextAction,
    summary: output.summary || previous?.summary || "Lead captured by AI agent.",
    painPoint: output.painPoint || previous?.painPoint || "Unknown",
    reasoning: output.reasoning,
    suggestedReply: output.suggestedReply,
    confidence: output.confidence,
    estimatedValue: output.estimatedValue || previous?.estimatedValue || "Unknown",
    createdAt: previous?.createdAt || now,
    updatedAt: now,
    messages: [...(previous?.messages || []), leadMessage, agentMessage],
    activity: [`AI updated lead: ${score} / ${output.nextAction}`, ...(previous?.activity || [])].slice(0, 12)
  };
}
