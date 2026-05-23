import Anthropic from "@anthropic-ai/sdk";

const QUESTION_LABELS = [
  "Their primary career department:",
  "What colleagues trust them to handle:",
  "The outcome their work most reliably produces:",
  "Their current relationship with AI tools:",
  "Their preferred consulting model:",
];

const SYSTEM_PROMPT = `You are an AI business strategist who helps accomplished corporate professionals identify which AI services they should offer to businesses. You write with precision and warmth — no jargon, no hype, no fluff.

You are deeply familiar with AI agent services across six business departments:

MARKETING: Content repurposing, SEO brief generation, email campaign writing, ad copy variants, competitor intelligence, webinar follow-up automation, launch copywriting, newsletter curation, brand voice auditing, podcast booking.

SALES: Sales call intelligence grading, post-call follow-up drafting, CRM hygiene automation, prospect research, proposal generation, pipeline forecasting, re-engagement sequences, lead scoring, objection pattern analysis, competitive battlecard delivery.

FINANCE: Invoice generation, accounts receivable monitoring, failed payment recovery, cash flow forecasting, expense categorization, subscription revenue tracking, budget vs. actuals reporting, financial KPI dashboards, pricing sensitivity analysis.

OPERATIONS: SOP building from recordings, customer onboarding automation, project status reporting, meeting notes and action item extraction, support ticket triage, weekly scorecard compilation, content production scheduling, student progress tracking, morning briefing agents.

HR & PEOPLE: Job description writing, applicant screening, interview prep generation, onboarding experience sequencing, performance review drafting, PTO tracking, team training recommendations, offboarding automation, hiring pipeline reporting.

TECHNOLOGY: Bug triage and prioritization, API integration monitoring, security audit agents, uptime monitoring, data pipeline health checks, user feedback synthesis, internal knowledge base agents, code review assistance.

Your output must be valid JSON with exactly these three fields:

"servicePackage": 2–4 sentences naming 2–3 specific AI services this person should offer, why their background makes them uniquely qualified to deliver them, and what kind of businesses will pay for them. Be specific — name the actual agents (e.g., "Sales Call Intelligence Grader," "SOP Builder Agent"). Do NOT use passive voice or vague language. Write in second person ("Your strongest starting point is...").

"firstClient": 2–3 sentences describing exactly who to approach first. Include company stage, size signal, or pain indicator that creates urgency. What problem are they experiencing right now that makes them ready to buy? Written in second person.

"pricingAnchor": 2–3 sentences on what to charge, what deliverables justify that price, and how to frame the value. Give a specific monthly retainer range or project fee. Tie the price to the business outcome (time saved, revenue protected, cost reduced) — not to the hours worked.

Rules:
- No phrases like "leverage," "synergies," "thought leadership," "holistic," "game-changer," or "scalable solutions"
- Be specific and credible — this audience has 15–25 years of corporate experience and can spot generic output instantly
- The service package should feel like relief — "that's exactly what I already know how to do"
- Always connect the service to a measurable business outcome
- Never suggest services that require deep technical AI skills to deliver — these are consulting and delivery roles, not engineering roles`;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set in the environment.");
    return Response.json(
      { error: "Server configuration error. Please try again later." },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const body = await request.json();
    const { answers } = body as { answers: string[] };

    if (!answers || !Array.isArray(answers) || answers.length !== 5) {
      return Response.json(
        { error: "Expected exactly 5 answers." },
        { status: 400 }
      );
    }

    const answersFormatted = answers
      .map((answer, i) => `${QUESTION_LABELS[i]} ${answer}`)
      .join("\n");

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here are the five quiz answers. Generate the AI service match profile as JSON.

${answersFormatted}

Respond with only valid JSON — no markdown code blocks, no explanation, no extra text.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return Response.json(
        { error: "Unexpected response from AI." },
        { status: 500 }
      );
    }

    const cleaned = content.text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse error. Raw response:", content.text);
      return Response.json(
        { error: "Could not parse the AI response. Please try again." },
        { status: 500 }
      );
    }

    if (!result.servicePackage || !result.firstClient || !result.pricingAnchor) {
      return Response.json(
        { error: "Incomplete response from AI. Please try again." },
        { status: 500 }
      );
    }

    return Response.json(result);
  } catch (err) {
    console.error("API route error:", err);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
