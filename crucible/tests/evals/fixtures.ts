/**
 * Eval fixtures for sample offers.
 *
 * These five offers come from the spec section 19. They are used to:
 *  - Run the structured helper end-to-end against cached output.
 *  - Smoke-test that prompts build without throwing.
 *  - Provide stable inputs for hand-running the live AI later.
 */

import type { HypothesisInput } from "../../lib/ai/schemas/offer";

export interface EvalOffer {
  slug: string;
  title: string;
  hypothesisInput: HypothesisInput;
}

export const EVAL_OFFERS: EvalOffer[] = [
  {
    slug: "agency-followup",
    title: "AI follow-up tool for agencies",
    hypothesisInput: {
      rawFounderInput:
        "We help small agencies automatically follow up with inbound leads who go quiet after a discovery call. It reads call notes and drafts personalized follow-ups so founders stop losing warm prospects.",
      icpGuess: "Founders of 5-25 person service agencies",
      desiredCta: "15-minute fit check",
      tone: "founder-led",
    },
  },
  {
    slug: "law-intake",
    title: "AI intake assistant for law firms",
    hypothesisInput: {
      rawFounderInput:
        "We replace the intake form for boutique law firms with an AI intake assistant that asks the right follow-up questions and produces a structured case brief for the partner.",
      icpGuess: "Boutique law firms (3-15 attorneys), partner or office manager",
      desiredCta: "20-minute walkthrough",
      tone: "direct",
    },
  },
  {
    slug: "recruiter-meeting-prep",
    title: "AI meeting prep tool for recruiters",
    hypothesisInput: {
      rawFounderInput:
        "We auto-generate meeting prep briefs for recruiters before every candidate call: candidate background, likely concerns, suggested talking points, and red flags pulled from the resume.",
      icpGuess: "Independent recruiters and 5-30 person recruiting agencies",
      desiredCta: "Free first 10 prep briefs",
      tone: "concise",
    },
  },
  {
    slug: "freelancer-invoice-chasing",
    title: "AI invoice chasing tool for freelancers",
    hypothesisInput: {
      rawFounderInput:
        "Freelancers wait 30-90 days to be paid because chasing invoices feels rude. We chase for them in their voice, escalate politely, and only escalate to legal language with explicit approval.",
      icpGuess: "Independent freelancers and tiny studios (1-3 people)",
      desiredCta: "Connect Stripe in 2 minutes",
      tone: "warm",
    },
  },
  {
    slug: "hr-onboarding",
    title: "AI onboarding assistant for HR teams",
    hypothesisInput: {
      rawFounderInput:
        "An AI onboarding assistant that answers new-hire questions in Slack during the first 30 days, escalating to a human only when the question is policy-sensitive or unanswerable.",
      icpGuess: "HR teams at 50-500 employee companies",
      desiredCta: "Pilot with one team for 30 days",
      tone: "technical",
    },
  },
];
