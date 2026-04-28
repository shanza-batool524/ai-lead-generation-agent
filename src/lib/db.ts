import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { Lead, LeadStatus } from "./types";
import { eq, desc } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export async function getLeads(): Promise<Lead[]> {
  try {
    const result = await db.query.leads.findMany({
      orderBy: [desc(schema.leads.updatedAt)],
    });
    // @ts-ignore - map to the Lead type if necessary, usually Drizzle matches if schema is correct
    return result as Lead[];
  } catch (error) {
    console.error("Failed to fetch leads from Neon:", error);
    return [];
  }
}

export async function findLead(id: string): Promise<Lead | undefined> {
  const result = await db.query.leads.findFirst({
    where: eq(schema.leads.id, id),
  });
  return result as Lead | undefined;
}

export async function upsertLead(nextLead: Lead) {
  const now = new Date();
  const data = {
    ...nextLead,
    updatedAt: now,
    createdAt: new Date(nextLead.createdAt),
  };

  await db.insert(schema.leads)
    .values(data)
    .onConflictDoUpdate({
      target: schema.leads.id,
      set: data,
    });

  return nextLead;
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const lead = await findLead(id);
  if (!lead) return null;

  const now = new Date();
  const updatedActivity = [`Status changed to ${status}`, ...lead.activity].slice(0, 12);

  await db.update(schema.leads)
    .set({
      status,
      updatedAt: now,
      activity: updatedActivity,
    })
    .where(eq(schema.leads.id, id));

  return { ...lead, status, updatedAt: now.toISOString(), activity: updatedActivity };
}
