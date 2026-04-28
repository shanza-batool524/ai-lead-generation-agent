# LeadFlow AI - Premium AI Lead Qualification CRM

A portfolio-ready Next.js SaaS-style project that uses Gemini to qualify inbound leads, remember conversations, score opportunities, and recommend next sales actions.

## What is included

- Professional Next.js app structure
- Clean SaaS UI inspired by Linear/Stripe style
- Gemini server-side agent using `@google/genai`
- Structured JSON lead qualification
- Conversation memory per lead
- Hybrid AI + rule-based lead scoring
- Dashboard metrics and lead intelligence chart
- Lead table with search and status updates
- Pipeline view
- Premium lead detail panel
- AI summary, pain point, budget, timeline, value, and confidence panels
- Simulated WhatsApp, email, and calendar actions
- Demo scenario button that creates a polished Hot lead story
- Empty states, loading states, hover transitions, and action feedback
- Seed demo leads for portfolio presentation

## Setup

1. Install dependencies

```bash
npm install
```

2. Create your environment file

```bash
cp .env.example .env.local
```

3. Add your Gemini API key to `.env.local`

```bash
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

The app still runs in demo fallback mode if you do not add an API key, but real Gemini qualification requires the key.

4. Run the project

```bash
npm run dev
```

Open the local URL shown in your terminal, usually `http://localhost:3000`.

## Demo flow to show clients

1. Click **Run Demo**.
2. Show how a new lead appears.
3. Open the lead detail panel.
4. Explain how AI extracted the budget, timeline, project type, pain point, confidence, and next action.
5. Click WhatsApp, Email, or Book to show simulated integrations.
6. Move the lead through the pipeline.

## Positioning line

“I built LeadFlow AI, an AI sales agent that qualifies inbound leads, remembers conversations, scores intent, and gives sales teams the next best action.”

## Notes

- Data is stored locally in `src/data/leads.json` after first run.
- This is designed as a portfolio and demo product. For production, replace local JSON storage with Supabase, PostgreSQL, Firebase, or MongoDB.
