import { pgTable, text, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const leadStatusEnum = pgEnum("lead_status", ["New", "Qualified", "Contacted", "Proposal", "Closed"]);
export const leadScoreEnum = pgEnum("lead_score", ["Hot", "Warm", "Cold"]);

export const leads = pgTable("leads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  source: text("source").notNull().default("AI chat widget"),
  status: text("status").notNull().default("New"),
  score: text("score").notNull().default("Cold"),
  budget: text("budget").notNull().default("unknown"),
  timeline: text("timeline").notNull().default("unknown"),
  projectType: text("project_type").notNull().default("unknown"),
  nextAction: text("next_action").notNull().default("ask_more"),
  summary: text("summary").notNull(),
  painPoint: text("pain_point").notNull(),
  confidence: integer("confidence").notNull().default(50),
  estimatedValue: text("estimated_value").notNull().default("Unknown"),
  messages: jsonb("messages").notNull().default([]),
  activity: jsonb("activity").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
