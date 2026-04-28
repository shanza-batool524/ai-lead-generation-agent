import { NextRequest, NextResponse } from "next/server";
import { applyAgentOutput, qualifyLead } from "@/lib/agent";
import { findLead, upsertLead } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body.message || "").trim();
    const leadId = body.leadId ? String(body.leadId) : undefined;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const previousLead = leadId ? await findLead(leadId) : undefined;
    const output = await qualifyLead(message, previousLead);
    const lead = applyAgentOutput(message, output, previousLead);
    await upsertLead(lead);

    return NextResponse.json({ reply: output.reply, lead });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
