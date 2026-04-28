export type LeadScore = "Hot" | "Warm" | "Cold";
export type LeadStatus = "New" | "Qualified" | "Contacted" | "Proposal" | "Closed";
export type Budget = "high" | "medium" | "low" | "unknown";
export type Timeline = "urgent" | "soon" | "flexible" | "unknown";
export type ProjectType = "web" | "mobile" | "ai" | "full-stack" | "automation" | "other" | "unknown";
export type NextAction = "ask_more" | "book_call" | "send_proposal" | "send_followup" | "not_interested";

export type Message = {
  id: string;
  role: "lead" | "agent";
  content: string;
  createdAt: string;
};

export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  source: string;
  status: LeadStatus;
  score: LeadScore;
  budget: Budget;
  timeline: Timeline;
  projectType: ProjectType;
  nextAction: NextAction;
  summary: string;
  painPoint: string;
  confidence: number;
  estimatedValue: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  activity: string[];
};

export type AgentOutput = {
  reply: string;
  name: string;
  company: string;
  email: string;
  budget: Budget;
  timeline: Timeline;
  projectType: ProjectType;
  leadScore: LeadScore;
  nextAction: NextAction;
  summary: string;
  painPoint: string;
  confidence: number;
  estimatedValue: string;
};
