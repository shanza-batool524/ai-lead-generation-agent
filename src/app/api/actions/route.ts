import { NextRequest, NextResponse } from "next/server";
import { findLead, upsertLead } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { leadId, action } = await request.json();
    const lead = await findLead(String(leadId));

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const label = action === "whatsapp" ? "WhatsApp message prepared" :
                  action === "email" ? "Follow-up email prepared" :
                  action === "calendar" ? "Discovery call link generated" :
                  "Action simulated";

    const updated = {
      ...lead,
      updatedAt: new Date().toISOString(),
      activity: [label, ...lead.activity].slice(0, 12)
    };

    await upsertLead(updated);

    return NextResponse.json({ success: true, message: label, lead: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
