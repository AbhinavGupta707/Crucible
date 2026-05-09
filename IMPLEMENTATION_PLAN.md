# Crucible Implementation Plan

Source spec: `MASTER SPEC.md`

Project: Crucible - Outbound That Learns

Purpose: this file is an execution-ready build plan for Codex, Claude Code, or any other coding agent. It compresses the product spec into concrete architecture, workstreams, file ownership, merge strategy, validation gates, and unresolved decisions. The goal is to let multiple agents work in parallel without needing to rediscover the product.

Last updated: 2026-05-09

---

# 1. Executive Summary

Crucible is a hackathon MVP for a closed-loop outbound engine. It does not just generate cold emails. It creates buyer archetype hypotheses, matches prospects to those archetypes, predicts likely objections, generates hypothesis-driven emails, drafts or sends them through Gmail, observes replies, parses actual outcomes, updates the buyer memory, and generates a better next cohort.

The demo must prove one loop:

```text
Offer -> archetypes -> prospect matching -> preflight prediction -> outbound email
-> draft/send or replay -> reply parsing -> predicted-vs-actual comparison
-> archetype v1 to v2 calibration -> improved next cohort email
```

Winning narrative:

```text
Outbound tools personalize. Crucible learns.
```

Primary execution strategy:

```text
1. Build the full UI and flow with seeded data first.
2. Add database and repositories behind the seeded flow.
3. Add schema-validated AI agents with cached fallbacks.
4. Add Gmail as optional draft-first integration.
5. Make demo safe mode bulletproof.
```

Non-negotiable: demo safe mode must work without Gmail, without live scraping, and without live LLM calls.

---

# 2. Current Workspace State

The workspace currently contains:

```text
MASTER SPEC.md
IMPLEMENTATION_PLAN.md
```

No application code has been scaffolded yet.

Recommended app directory:

```text
crucible/
```

All implementation work should happen under `crucible/` unless the team intentionally chooses to scaffold in the repository root.

---

# 3. MVP Product Contract

The MVP is done when a user can complete this path:

```text
1. Enter a founder offer.
2. Generate 8-12 buyer archetypes.
3. Upload or load 20-30 CSV leads.
4. Match every lead to an archetype.
5. Generate preflight predictions for each lead.
6. Generate outbound emails tied to explicit hypotheses.
7. Review and approve emails before any Gmail action.
8. Create Gmail drafts or send controlled test emails.
9. Pull staged or real replies into the app.
10. Classify replies using a fixed taxonomy.
11. Compare predicted vs actual outcomes.
12. Update at least one archetype from v1 to v2.
13. Generate a visibly improved next-cohort email.
14. Run the full demo in safe mode with no live integrations.
```

The MVP must not build:

```text
Apollo or Clay API integration
LinkedIn automation
CRM sync
billing
team accounts
multi-domain sending
tracking pixels
deliverability warmup
full focus-group simulation
investor pitch coach
```

---

# 4. Recommended Stack

Use the stack from the spec unless a dependency is unavailable during implementation.

```text
Hosting: Vercel Hobby for hackathon demo
Frontend: Next.js App Router + TypeScript
UI: Tailwind CSS + shadcn/ui style primitives + Framer Motion
AI: Vercel AI SDK or provider adapter with structured outputs
Validation: Zod
Database: Postgres via Supabase or Neon
ORM: Prisma
Email: Gmail API via googleapis
CSV: papaparse
Testing: Vitest
Optional orchestration: LangGraph only if the team already knows it
Optional voice: ElevenLabs only after core demo is complete
```

Important implementation preference:

```text
Use custom TypeScript workflows first.
Do not add LangGraph unless the workflow code is already stable and the team has time.
```

## Vercel Hobby Deployment Constraints

The MVP can run on Vercel Hobby for the hackathon, but only if the app avoids long serverless workflows.

Conservative deployment assumption:

```text
Do not depend on any single serverless route running the entire product loop.
Keep every route short, cache-first, and retry-safe.
Use Vercel only for the app and short API routes.
Use Neon or Supabase for Postgres.
```

Do not create one endpoint that does this:

```text
offer -> archetypes -> prospects -> predictions -> emails -> replies -> calibration -> next cohort
```

Instead, expose explicit user-triggered steps:

```text
Build buyer memory
Match prospects
Generate emails
Replay replies
Run calibration
Generate next cohort
```

Only AI-heavy routes should raise their Vercel function duration. In Next.js route handlers, add this only where needed:

```ts
export const maxDuration = 60;
```

Candidate routes:

```text
app/api/offers/[offerId]/archetypes/generate/route.ts
app/api/cohorts/[cohortId]/generate-emails/route.ts
app/api/cohorts/[cohortId]/calibrate/route.ts
app/api/cohorts/[cohortId]/next/route.ts
```

Do not use `maxDuration = 60` everywhere. Fast routes such as email approval, demo seed, CSV parsing, and fetching cached data should remain short.

Important nuance:

```text
Vercel duration limits and Fluid Compute settings can change by account/project.
Design the demo so it succeeds under the strictest Hobby-style assumption:
short routes, cached AI, seeded replies, no background jobs.
```

---

# 5. Implementation Principles

Every agent should follow these rules:

```text
Preserve demo safe mode at all times.
Use Zod schemas for every AI output.
Never claim synthetic predictions are real market proof.
Do not auto-send emails.
Do not generate deceptive subject lines.
Do not invent prospect facts.
Every outbound email must test an explicit hypothesis.
Every prediction must include confidence.
Every calibration must compare predicted vs actual.
No-reply is weak evidence, not proof.
Gmail failure must not break the demo.
Live LLM failure must fall back to cached data.
Long workflows must be split into user-triggered steps.
Vercel deployment must not require background workers.
```

UI principle:

```text
Make calibration the emotional climax.
```

The product should feel like a founder cockpit, not a spam console.

---

# 6. Target User Flow

## Screen 1: Offer Intake

Fields:

```text
What are you selling?
Who do you think buys it?
What pain do you solve?
What proof do you have?
What is your desired CTA?
Tone: concise, founder-led, warm, direct, technical
```

Primary action:

```text
Build buyer memory
```

Outputs:

```text
Offer hypothesis
ICP guess
Buyer / user / champion split
Likely objections
Message angles to test
Risky assumptions
```

## Screen 2: Buyer Archetype Library

Render 8-12 cards.

Each card shows:

```text
Name
Version
Segment
Role
Predicted reply likelihood
Top objection
Best angle
Confidence
Risk tolerance
Buying power
```

Required demo effect:

```text
Cards appear as a generated buyer memory.
At least one card later flips from v1 to v2 after calibration.
```

## Screen 3: Prospect Inbox

CSV columns:

```text
first_name
last_name
email
title
company
industry
company_size
notes
trigger
website
linkedin_summary
```

Each prospect row shows:

```text
Prospect
Matched archetype
Match confidence
Matched signals
Predicted objection
Recommended angle
Risk flags
```

## Screen 4: Outbound Forge

For every email show:

```text
Experiment hypothesis
Variant or angle
Subject
Body
Predicted reply likelihood
Predicted objection
CTA quality score
Compliance warning
Human approval checkbox
Draft/send status
```

Email constraints:

```text
Under 120 words.
One CTA.
No fake familiarity.
No invented proof.
Pre-empt one predicted objection.
Include opt-out line for external sends.
Human approval required.
```

## Screen 5: Campaign Monitor

Show replies or replayed replies.

Each reply card shows:

```text
Sender
Actual outcome
Actual objection
Prediction
Prediction result
Parser confidence
Volunteered information
```

No-reply state:

```text
Observed: no reply
Confidence: low
Possible causes: timing, deliverability, weak relevance, wrong buyer, weak CTA
```

## Screen 6: Calibration View

This is the main demo climax.

Show:

```text
Predicted-vs-actual matrix
Accuracy by archetype
Trigger reason
Archetype v1 to v2 diff
Added beliefs
Removed or downweighted beliefs
New confidence
```

Required visible moment:

```text
Tool-Fatigued Operator v1 -> v2
```

or another seeded archetype with a clear mismatch.

## Screen 7: Next Cohort

Show before and after:

```text
Cohort 1 email
Cohort 2 rewritten email
Changes from previous cohort
Revised hypothesis
Segments to double down
Segments to pause
Success metric
Kill criterion
```

Label simulated metrics honestly:

```text
Cohort 1 simulated quality
Cohort 2 after calibration
```

Do not label seeded replies as live market proof.

---

# 7. Architecture

Recommended shape:

```text
Next.js UI
  -> Route handlers
    -> Repositories
    -> AI workflows
    -> Gmail service
    -> Scoring/calibration utilities
      -> Postgres/Prisma
```

The orchestrator should be plain TypeScript:

```text
buildBuyerMemory()
generateCampaign()
monitorAndCalibrate()
generateNextCohort()
```

Avoid hidden magic. For a hackathon, explicit workflow functions are easier to debug than a generic agent graph.

---

# 8. Folder Structure

Create this structure under `crucible/`:

```text
crucible/
  app/
    layout.tsx
    page.tsx
    globals.css
    runs/
      [offerId]/
        page.tsx
        library/page.tsx
        prospects/page.tsx
        forge/page.tsx
        monitor/page.tsx
        calibration/page.tsx
        next-cohort/page.tsx
    api/
      offers/route.ts
      offers/[offerId]/archetypes/generate/route.ts
      prospects/upload-csv/route.ts
      prospects/[prospectId]/match/route.ts
      campaigns/route.ts
      campaigns/[campaignId]/cohorts/route.ts
      cohorts/[cohortId]/preflight/route.ts
      cohorts/[cohortId]/generate-emails/route.ts
      cohorts/[cohortId]/calibrate/route.ts
      cohorts/[cohortId]/next/route.ts
      emails/[emailId]/approve/route.ts
      gmail/connect/route.ts
      gmail/callback/route.ts
      gmail/create-drafts/route.ts
      gmail/send-approved/route.ts
      gmail/poll-replies/route.ts
      replies/[replyId]/analyze/route.ts
      demo/seed/route.ts
      demo/replay-replies/route.ts
  components/
    app-shell.tsx
    offer-intake.tsx
    archetype-card.tsx
    archetype-library.tsx
    version-diff.tsx
    prospect-table.tsx
    prospect-match-badge.tsx
    outbound-forge.tsx
    hypothesis-pill.tsx
    gmail-connect-card.tsx
    campaign-monitor.tsx
    reply-card.tsx
    prediction-actual-matrix.tsx
    calibration-animation.tsx
    next-cohort-preview.tsx
    demo-mode-toggle.tsx
  lib/
    ai/
      provider.ts
      structured.ts
      prompts/
        hypothesis.ts
        persona-synthesizer.ts
        prospect-matcher.ts
        preflight-simulator.ts
        outreach-generator.ts
        response-parser.ts
        calibration-agent.ts
        next-cohort.ts
      schemas/
        offer.ts
        archetype.ts
        prospect.ts
        campaign.ts
        email.ts
        reply.ts
        calibration.ts
      workflows/
        build-buyer-memory.ts
        generate-campaign.ts
        monitor-and-calibrate.ts
    gmail/
      oauth.ts
      client.ts
      mime.ts
      drafts.ts
      send.ts
      poll.ts
      parse-message.ts
    db/
      prisma.ts
      repositories/
        offers.ts
        archetypes.ts
        prospects.ts
        campaigns.ts
        emails.ts
        replies.ts
        calibration.ts
        suppression.ts
    scoring/
      match-score.ts
      reply-likelihood.ts
      prediction-accuracy.ts
      calibration-trigger.ts
      email-quality.ts
    demo/
      seed.ts
      replay.ts
      sample-offer.txt
      sample-leads.csv
      sample-replies.json
      cached-ai-output.json
  prisma/
    schema.prisma
    seed.ts
  tests/
    unit/
    integration/
    evals/
  AGENTS.md
  CLAUDE.md
  .env.example
```

---

# 9. Data Model

Use Prisma and Postgres.

Core entities:

```text
Workspace
GmailConnection
Offer
ExperimentHypothesis
BuyerArchetype
BuyerArchetypeVersion
Prospect
ProspectMatch
Campaign
CampaignCohort
OutboundEmail
EmailEvent
ReplyAnalysis
CalibrationRun
PersonaUpdate
SuppressionEntry
```

Relationship summary:

```text
Workspace has many Offers and GmailConnections.
Offer has many ExperimentHypotheses, BuyerArchetypes, and Campaigns.
BuyerArchetype has many BuyerArchetypeVersions.
Prospect has many ProspectMatches and OutboundEmails.
Campaign has many CampaignCohorts.
CampaignCohort has many OutboundEmails and CalibrationRuns.
OutboundEmail has many EmailEvents and one optional ReplyAnalysis.
CalibrationRun has many PersonaUpdates.
```

Implementation notes:

```text
Use String IDs with uuid defaults.
Use Json fields for flexible predicted objections, preferred angles, evidence, and diffs.
Use string statuses first for speed, or Prisma enums if an agent owns the whole schema.
Store Gmail tokens only for hackathon demo; production would need encryption.
Store raw Gmail payloads only where needed for debugging.
Use activeVersionId on BuyerArchetype so the UI can quickly render current memory.
```

Required seeded records:

```text
1 workspace
1 offer
8-12 archetypes
8-12 v1 archetype versions
20-30 prospects
20-30 prospect matches
1 campaign
1 cohort
5-10 outbound emails
5-8 reply analyses
1 calibration run
1 persona update
1 next cohort plan
```

---

# 10. API Contracts

All endpoints return this envelope:

```json
{
  "ok": true,
  "data": {},
  "warnings": [],
  "traceId": "trace_..."
}
```

Error envelope:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message"
  },
  "warnings": [],
  "traceId": "trace_..."
}
```

Recommended helper:

```text
lib/api/response.ts
```

If the helper is created, keep it small:

```text
ok(data, warnings?)
fail(code, message, status?)
```

## Serverless Route Rules

The API must be stepwise and demo-controlled.

Do not implement one route that runs the full loop:

```text
offer -> archetypes -> prospects -> predictions -> emails -> replies -> calibration -> next cohort
```

Each major demo action must map to a separate endpoint and button:

```text
Build buyer memory      -> POST /api/offers/:offerId/archetypes/generate
Match prospects         -> POST /api/prospects/:prospectId/match or cohort batch route
Generate emails         -> POST /api/cohorts/:cohortId/generate-emails
Replay replies          -> POST /api/demo/replay-replies
Run calibration         -> POST /api/cohorts/:cohortId/calibrate
Generate next cohort    -> POST /api/cohorts/:cohortId/next
Poll Gmail replies      -> POST /api/gmail/poll-replies
```

Why:

```text
Avoids Vercel timeouts.
Makes the demo feel controlled.
Gives the presenter a chance to narrate each learning step.
Allows cached fallback per step.
Makes failures recoverable without resetting the whole run.
```

AI-heavy route handlers may use:

```ts
export const maxDuration = 60;
```

Only use this on routes that genuinely call the model. Cached/demo routes should remain fast.

## Required Routes

`POST /api/offers`

```text
Creates an offer from founder input.
Runs Hypothesis Agent in live mode or loads cached output in demo mode.
Returns offer, hypotheses, and risky assumptions.
```

`POST /api/offers/:offerId/archetypes/generate`

```text
Generates 8-12 buyer archetypes and v1 versions.
Returns archetype cards.
```

`POST /api/prospects/upload-csv`

```text
Parses CSV.
Validates required fields.
Creates prospects.
Returns parse summary and prospects.
```

`POST /api/prospects/:prospectId/match`

```text
Matches one prospect to best archetype.
Returns confidence, reasoning, signals, and risk flags.
```

`POST /api/campaigns`

```text
Creates a campaign for an offer.
Returns campaign.
```

`POST /api/campaigns/:campaignId/cohorts`

```text
Creates a cohort.
Defaults to cohortNumber 1 unless specified.
```

`POST /api/cohorts/:cohortId/preflight`

```text
Runs preflight prediction for each prospect match in the cohort.
Stores predicted outcome, objection, angle, confidence.
```

`POST /api/cohorts/:cohortId/generate-emails`

```text
Generates outbound emails with hypotheses.
Stores emails as draft status.
```

`POST /api/emails/:emailId/approve`

```text
Marks an email approved.
Does not send.
```

`POST /api/gmail/connect`

```text
Starts OAuth.
Optional in demo safe mode.
```

`GET /api/gmail/callback`

```text
Handles OAuth callback and stores tokens.
```

`POST /api/gmail/create-drafts`

```text
Creates Gmail drafts for approved emails.
Fails gracefully if Gmail unavailable.
```

`POST /api/gmail/send-approved`

```text
Sends only approved emails.
Must enforce controlled recipient mode for hackathon.
Must check suppression list.
```

`POST /api/gmail/poll-replies`

```text
Polls Gmail for replies.
Associates replies by threadId, sender, subject, or reply alias.
Creates EmailEvent and ReplyAnalysis candidate records.
```

`POST /api/replies/:replyId/analyze`

```text
Runs Response Parser on raw reply text.
Updates ReplyAnalysis.
Updates suppression list for unsubscribe, hostile, bounce where applicable.
```

`POST /api/cohorts/:cohortId/calibrate`

```text
Computes accuracy and trigger rules.
Runs Calibration Agent where needed.
Creates new BuyerArchetypeVersion and PersonaUpdate.
```

`POST /api/cohorts/:cohortId/next`

```text
Generates next cohort plan and rewritten email templates.
```

`GET /api/demo/seed`

```text
Seeds or returns the demo scenario.
Should be idempotent.
```

`POST /api/demo/replay-replies`

```text
Loads staged replies into the current cohort.
Runs parser and returns replay summary.
```

---

# 11. AI Agents and Structured Outputs

All AI functions must:

```text
Accept explicit typed inputs.
Return Zod-validated outputs.
Retry schema failure once.
Fall back to cached demo output on repeated failure.
Log prompt name, schema name, model, latency, validation result, and traceId.
Never mutate database directly.
```

Recommended files:

```text
lib/ai/provider.ts
lib/ai/structured.ts
lib/ai/schemas/*.ts
lib/ai/prompts/*.ts
```

## Agent 1: Hypothesis Agent

Input:

```text
rawFounderInput
icpGuess
desiredCta
tone
```

Output:

```text
title
productSummary
icpGuess
likelyBuyer
likelyUser
champion
painClaim
proofPoint
desiredCta
messageAngles
riskyAssumptions
```

## Agent 2: Persona Synthesizer

Generates 8-12 archetypes.

Each archetype must include:

```text
name
segment
role
description
currentWorkflow
painIntensity
buyingPower
riskTolerance
voiceStyle
predictedObjections
preferredAngles
dislikedPhrases
likelyReplyPatterns
```

## Agent 3: Prospect Matcher

Use deterministic scoring plus optional LLM judgement.

Formula:

```text
match_score =
  0.35 role/title similarity
+ 0.25 company/segment similarity
+ 0.20 trigger/notes similarity
+ 0.10 industry/company-size fit
+ 0.10 LLM judgment score
```

Output:

```text
prospectId
archetypeId
confidence
reasoning
matchedSignals
riskFlags
```

## Agent 4: Preflight Simulator

For each prospect and archetype pair, predict:

```text
replyLikelihood
predictedOutcome
predictedObjection
bestAngle
phrasesToUse
phrasesToAvoid
confidence
```

## Agent 5: Outreach Generator

Generates:

```text
hypothesis
angle
subject
body
followUp1
followUp2
predictedReplyLikelihood
predictedObjection
cta
complianceFooter
riskWarnings
```

Email hard checks:

```text
body under 120 words
one CTA
no invented proof
no fake familiarity
no manipulative wording
opt-out included when external_send=true
```

## Agent 6: Response Parser

Fixed taxonomy:

```text
positive
interested_later
wrong_person
not_relevant
pricing_objection
trust_objection
competitor_locked
unsubscribe
hostile
bounce
no_reply
```

Output:

```text
outcome
sentiment
objectionType
funnelStage
volunteeredInfo
predictedWasCorrect
mismatchReason
confidence
```

## Agent 7: Calibration Agent

Computes:

```text
prediction_accuracy_by_archetype
objection_confusion_matrix
angle_performance_by_archetype
CTA_performance
phrases_to_avoid
new_unpredicted_objections
```

Triggers update if:

```text
sent_count >= 5
and one or more is true:
prediction_accuracy < 0.65
unpredicted_objection_rate >= 0.30
hostile_or_unsubscribe_rate >= 0.10
new_objection_cluster_count >= 2
```

For demo, thresholds can be lower so one calibration is visible after 5-8 staged replies.

Output:

```text
archetypeId
shouldUpdate
reason
oldPredictions
observedReality
newPredictedObjections
newPreferredAngles
phrasesToUse
phrasesToAvoid
confidenceAfter
```

## Agent 8: Next Cohort Generator

Output:

```text
summary
changesFromPreviousCohort
segmentsToDoubleDown
segmentsToPause
revisedMessageAngles
newEmailTemplates
killCriterion
successMetric
```

---

# 12. Scoring and Calibration Utilities

Implement deterministic utilities so the demo is explainable and testable.

`lib/scoring/reply-likelihood.ts`

```text
reply_likelihood =
  0.25 * persona_angle_fit
+ 0.20 * pain_relevance
+ 0.15 * trigger_strength
+ 0.15 * CTA_clarity
+ 0.10 * trust_risk_inverse
+ 0.10 * prospect_match_confidence
+ 0.05 * brevity_score
```

`lib/scoring/prediction-accuracy.ts`

```text
exact outcome match = 1.0
same family match = 0.6
wrong but same sentiment = 0.3
wrong = 0.0
no reply = excluded or low-confidence bucket
```

Outcome families:

```text
positive family: positive, meeting_ready
soft interest family: interested_later, nurture
negative fit family: wrong_person, not_relevant, competitor_locked
objection family: pricing_objection, trust_objection, timing, implementation
hard negative: unsubscribe, hostile
```

`lib/scoring/calibration-trigger.ts`

```text
shouldCalibrate(archetypeStats) =
  sentCount >= 5
  and (
    predictionAccuracy < 0.65
    or unpredictedObjectionRate >= 0.30
    or hostileOrUnsubscribeRate >= 0.10
    or newObjectionClusterCount >= 2
  )
```

`lib/scoring/email-quality.ts`

Score:

```text
Relevance: 0-10
Specificity: 0-10
Brevity: 0-10
CTA clarity: 0-10
Objection pre-emption: 0-10
Truthfulness: pass/fail
Compliance: pass/fail
```

Reject if:

```text
invented fact
fake familiarity
deceptive subject
too long
no CTA
no opt-out line when external_send=true
```

---

# 13. Gmail Integration

Build two modes.

## Demo Safe Mode

```text
Uses CSV leads.
Generates in-app emails.
Replays seeded replies.
Runs parsing and calibration for real.
Requires no Gmail credentials.
Must be the default when DEMO_SAFE_MODE=true.
```

## Live Gmail Mode

```text
Connects one new Gmail account.
Creates drafts by default.
Optionally sends to controlled recipients.
Polls replies only when the user clicks a button or the monitor screen is open.
Classifies replies.
```

Scopes from spec:

```text
gmail.compose
gmail.send
gmail.readonly
```

Draft-first default:

```text
1. Generate emails.
2. Founder reviews.
3. Founder approves.
4. App creates Gmail drafts.
5. Founder can send from Gmail or app.
```

Send flow:

```text
1. Check DEMO_SAFE_MODE is false.
2. Check email is approved.
3. Check recipient is in controlled demo recipient allowlist.
4. Check suppression list.
5. Build MIME message.
6. Base64URL encode.
7. Send with Gmail API.
8. Store messageId and threadId.
```

Reply polling:

```text
Do not run continuous background polling on Vercel Hobby.
Prefer a [Poll Gmail replies] button in the demo.
Optional: use a short client-side interval only while the monitor screen is open.
Use threadId where available.
Fallback to from, to, subject, and newer_than filters.
Fetch full message.
Extract plain text.
Run Response Parser.
```

Important:

```text
Gmail should prove integration, not carry the demo.
Create drafts first.
Send at most one controlled live email if everything is stable.
Use seeded replayed replies as the default calibration path.
```

Compliance guardrails:

```text
Accurate sender identity.
Truthful subject line.
Human approval.
Low volume only.
Opt-out line for external sends.
Suppression list.
No tracking pixels.
No live cold sending to strangers during demo.
```

---

# 14. Demo Data Contract

The demo must have a deterministic path.

Seed offer:

```text
We help small agencies automatically follow up with inbound leads who go quiet after a discovery call. It reads call notes and drafts personalized follow-ups so founders stop losing warm prospects.
```

Seed archetypes:

```text
Overworked Agency Owner
Skeptical Solo Consultant
Ops-Minded Studio Manager
Growth-Focused Founder
Tool-Fatigued Operator
Budget-Sensitive Operator
Trust-First Buyer
Wrong-Person Gatekeeper
Competitor-Locked Buyer
Interested-But-Later Buyer
```

Seed hypotheses:

```text
Agency owners respond better to missed-revenue framing than AI automation framing.
Tool-fatigued operators need low-implementation language before they engage.
Growth-focused founders respond to pipeline recovery more than time savings.
Trust-first buyers need proof and human approval before automation language.
```

Seed mismatch for calibration:

```text
Prediction: pricing objection
Actual: timing / implementation objection
Learning: the archetype was less price-sensitive than expected and more worried about setup time.
```

Required v1 to v2 diff:

```text
Tool-Fatigued Operator v1 -> v2

Added:
- "I do not have time to set up another tool."
- Prefers "we draft, you approve."
- Prefers implementation-light messaging.
- Responds better to "15-min fit check" than "book a demo."

Removed or downweighted:
- Over-weighted pricing objection.
- Disliked "automation platform."
```

Before email:

```text
AI follow-up automation for agencies.
```

After email:

```text
Never lose a warm lead because you forgot the second follow-up - we draft it, you approve it.
```

---

# 15. Parallel Workstreams

Run five workstreams in parallel after initial scaffold contracts are agreed.

Critical rule:

```text
Each workstream owns its files.
Do not edit another stream's owned files without announcing it in the merge notes.
Use exported contracts instead of duplicating types.
```

## Workstream 1: App Shell and Product UI

Owner scope:

```text
app/layout.tsx
app/page.tsx
app/globals.css
app/runs/[offerId]/**
components/**
```

Do not own:

```text
app/api/**
lib/ai/**
lib/db/**
lib/gmail/**
prisma/**
```

Tasks:

```text
Scaffold Next.js app with TypeScript.
Create visual direction and global styles.
Build offer intake page.
Build run navigation.
Build archetype library view.
Build prospect inbox view.
Build outbound forge view.
Build campaign monitor view.
Build calibration view.
Build next cohort view.
Use seeded demo data first.
Add demo safe mode toggle.
Add loading, empty, and failure states.
```

Acceptance criteria:

```text
User can click through all seven screens with seeded data.
Calibration page clearly shows predicted-vs-actual and v1 -> v2.
Next cohort page clearly shows before/after rewrite.
No Gmail or live AI is required.
Mobile layout does not break.
```

Suggested first task prompt:

```text
Build the Crucible Next.js UI shell with seeded data only. Create the seven screens from IMPLEMENTATION_PLAN.md. Do not add API calls, AI calls, database code, or Gmail code. Keep demo safe mode visible and make calibration the climax.
```

## Workstream 2: Database, Repositories, and Seed Data

Owner scope:

```text
prisma/**
lib/db/**
lib/demo/**
tests/unit/*csv*
tests/unit/*repository*
.env.example
```

Do not own:

```text
app/runs/**
components/**
lib/ai/**
lib/gmail/**
```

Tasks:

```text
Create Prisma schema.
Create database client helper.
Create repositories for offers, archetypes, prospects, campaigns, emails, replies, calibration, suppression.
Create deterministic seed script.
Create sample leads CSV.
Create sample replies JSON.
Create cached AI output JSON.
Create idempotent demo seed function.
Add .env.example.
```

Acceptance criteria:

```text
Prisma validates.
Seed script creates a complete demo flow.
Repositories can fetch one full run by offerId.
CSV fixture has 20-30 leads.
Seeded replies include at least one clear prediction mismatch.
No UI code is changed.
```

Suggested first task prompt:

```text
Implement the Prisma schema, repository layer, and deterministic demo seed data for Crucible. Follow IMPLEMENTATION_PLAN.md. Do not build UI or Gmail. Ensure the seed creates the full offer-to-calibration demo path.
```

## Workstream 3: Structured AI, Prompts, Workflows, and Scoring

Owner scope:

```text
lib/ai/**
lib/scoring/**
tests/unit/*score*
tests/unit/*calibration*
tests/evals/**
```

Do not own:

```text
app/api/**
components/**
lib/db/**
lib/gmail/**
prisma/**
```

Tasks:

```text
Create Zod schemas for all agent outputs.
Create provider adapter.
Create structured generation helper with retry and cached fallback.
Create prompts for all eight agents.
Create buildBuyerMemory workflow.
Create generateCampaign workflow.
Create monitorAndCalibrate workflow.
Create match score utility.
Create reply likelihood utility.
Create prediction accuracy utility.
Create calibration trigger utility.
Create email quality utility.
Add unit tests for deterministic scoring.
Add eval fixtures for sample offers.
```

Acceptance criteria:

```text
All AI output schemas validate against cached fixture data.
Malformed AI output is rejected.
Schema failure retries once then falls back to cache.
Scoring utilities have deterministic tests.
No database mutation happens inside AI functions.
```

Suggested first task prompt:

```text
Build the structured AI layer for Crucible. Create Zod schemas, prompts, provider adapter, cached fallback behavior, scoring utilities, and workflows. Do not edit UI, Prisma schema, or Gmail code.
```

## Workstream 4: Application APIs and Workflow Integration

Owner scope:

```text
app/api/offers/**
app/api/prospects/**
app/api/campaigns/**
app/api/cohorts/**
app/api/emails/**
app/api/replies/**
app/api/demo/**
lib/api/**
tests/integration/**
```

Do not own:

```text
app/api/gmail/**
lib/gmail/**
components/**
prisma/schema.prisma
lib/ai/prompts/**
```

Tasks:

```text
Create response envelope helpers.
Implement offer creation route.
Implement archetype generation route.
Implement CSV upload route.
Implement prospect matching route.
Implement campaign and cohort routes.
Implement preflight route.
Implement email generation route.
Implement email approval route.
Implement reply analysis route.
Implement calibration route.
Implement next cohort route.
Implement demo seed route.
Implement replay replies route.
Add integration tests for full safe-mode path.
```

Acceptance criteria:

```text
Safe-mode API path works from offer to next cohort.
All endpoints return standard envelopes.
All endpoints validate input.
Gmail routes are not required for safe-mode success.
Integration test proves replayed replies trigger calibration.
```

Suggested first task prompt:

```text
Implement the Next.js route handlers and API response helpers for Crucible's safe-mode workflow. Wire repositories and AI workflows together. Do not implement Gmail routes and do not edit UI components.
```

## Workstream 5: Gmail, Compliance, and Live Demo Mode

Owner scope:

```text
lib/gmail/**
app/api/gmail/**
components/gmail-connect-card.tsx
tests/unit/*mime*
tests/unit/*gmail*
```

Do not own:

```text
app/api/offers/**
app/api/cohorts/**
lib/ai/**
prisma/schema.prisma
```

Tasks:

```text
Implement Google OAuth start and callback.
Implement Gmail client builder.
Implement MIME builder.
Implement base64URL encoder.
Implement draft creation.
Implement approved send.
Implement controlled recipient allowlist.
Implement reply polling.
Implement plain-text message extraction.
Implement Gmail failure fallbacks.
Add unit tests for MIME generation.
Add a clear "Gmail optional" UI state.
```

Acceptance criteria:

```text
App can create Gmail drafts when credentials are present.
App refuses to send unapproved emails.
App refuses to send in demo safe mode.
App refuses to send outside controlled recipient allowlist.
Gmail connection failure does not break the core demo.
MIME builder has tests.
```

Suggested first task prompt:

```text
Implement Gmail optional live mode for Crucible: OAuth, MIME creation, draft creation, controlled sends, reply polling, and graceful failure. Preserve demo safe mode and do not touch non-Gmail routes.
```

---

# 16. Integration and Merge Strategy

Recommended branch/worktree pattern:

```text
main
workstream/ui-shell
workstream/db-seed
workstream/ai-workflows
workstream/api-integration
workstream/gmail
```

Merge order:

```text
1. Scaffold app shell.
2. Merge shared contracts from AI and DB.
3. Merge DB schema and seed.
4. Merge UI seeded flow.
5. Merge safe-mode APIs.
6. Connect UI to APIs where needed.
7. Merge Gmail as optional mode.
8. Final hardening and demo polish.
```

Avoid conflicts by following ownership boundaries.

Contract-first files should be agreed early:

```text
lib/ai/schemas/**
prisma/schema.prisma
lib/api/response.ts
lib/demo/cached-ai-output.json
```

If two workstreams need the same type:

```text
Export from lib/ai/schemas or lib/db repositories.
Do not redefine duplicate types in components.
```

Merge checkpoint checklist:

```text
npm run lint
npm run test
npx prisma validate
npx prisma db seed if database exists
npm run dev can load offer intake
safe-mode full demo path still works
```

---

# 17. Timeline

This assumes a 24-hour hackathon and 5 parallel agents.

## Hours 0-1: Alignment and Scaffold

```text
Create Next.js app.
Confirm app directory.
Create .env.example.
Add AGENTS.md and CLAUDE.md.
Agree file ownership.
Commit baseline.
```

## Hours 1-4: Parallel Foundations

```text
UI stream builds seeded seven-screen flow.
DB stream builds Prisma schema and seed fixtures.
AI stream builds schemas, prompts, cached fallback, scoring.
API stream creates route skeletons and response envelope.
Gmail stream creates MIME/OAuth skeleton and tests.
```

## Hours 4-8: First Vertical Slice

```text
Offer intake creates or loads seeded offer.
Archetype library renders generated/cached archetypes.
CSV fixture loads prospects.
Prospects match to archetypes.
Email generation works from cached AI.
```

## Hours 8-12: Campaign Loop

```text
Outbound forge has approvals.
Preflight predictions render.
Email quality warnings render.
Safe-mode replay replies works.
Response parser output renders.
```

## Hours 12-16: Calibration Climax

```text
Predicted-vs-actual matrix works.
Calibration trigger works.
Persona v1 -> v2 diff works.
Next cohort rewrite works.
Demo data tells a clear story.
```

## Hours 16-19: Gmail Optional Mode

```text
Draft creation works if credentials exist.
Controlled send works if explicitly enabled.
Gmail failure state is graceful.
Seeded replies remain fallback.
```

## Hours 19-22: Hardening

```text
Tests for scoring, parser fixtures, MIME, CSV, calibration.
Error states.
Loading states.
No-internet path.
No-Gmail path.
No-live-LLM path.
```

## Hours 22-24: Demo Rehearsal

```text
Three-minute script.
One-minute fallback script.
Reset seed script.
Prepare controlled Gmail account if using live mode.
Record fallback video or screenshots if allowed.
```

---

# 18. Demo Script

Three-minute flow:

```text
Act 1, 45 seconds:
Founder enters agency follow-up offer.
Click "Build buyer memory."
Show 8-12 archetypes.

Act 2, 60 seconds:
Upload/load CSV.
Show prospect matching.
Generate emails.
Show hypothesis tags.
Approve one or more emails.
Optionally create Gmail drafts.

Act 3, 75 seconds:
Replay or receive replies.
Show parser.
Show predicted-vs-actual mismatch.
Run calibration.
Show archetype v1 -> v2.
Generate next cohort.
Show before/after email.
```

Closing line:

```text
Crucible does not just write outbound. It remembers what the market taught you and uses that memory in the next send.
```

Fallback if Gmail fails:

```text
This is running in demo safe mode. The Gmail integration is optional, and the learning loop still works using controlled replayed replies.
```

Fallback if live AI fails:

```text
The model provider is unavailable, so Crucible is using cached structured outputs. The app still demonstrates the same closed-loop workflow.
```

---

# 19. Test Plan

## Unit Tests

Required:

```text
match-score.test.ts
reply-likelihood.test.ts
prediction-accuracy.test.ts
calibration-trigger.test.ts
email-quality.test.ts
mime-builder.test.ts
csv-parser.test.ts
suppression-list.test.ts
schema-validation.test.ts
```

## Integration Tests

Required safe-mode path:

```text
offer -> archetypes
prospect CSV -> prospects
prospects -> matches
matches -> preflight predictions
predictions -> email drafts
replay replies -> reply analyses
reply analyses -> calibration
calibration -> new archetype version
new archetype version -> next cohort email
```

## LLM Eval Fixtures

Use these offers:

```text
AI follow-up tool for agencies
AI intake assistant for law firms
AI meeting prep tool for recruiters
AI invoice chasing tool for freelancers
AI onboarding assistant for HR teams
```

Assertions:

```text
8+ archetypes generated.
No duplicate archetype names.
At least 3 distinct objection types.
Emails are under 120 words.
All emails have hypotheses.
Reply parser returns fixed taxonomy.
Calibration updates at least one archetype when mismatch is seeded.
```

## Manual Demo QA

Before presenting:

```text
Fresh clone/install works.
Seed/reset works.
Offer intake loads.
All seven screens are reachable.
Seeded flow works without env vars except database if needed.
Gmail credentials missing does not crash.
Live LLM key missing does not crash.
Calibration animation works.
Next cohort output appears.
Browser console has no critical errors.
```

---

# 20. Environment Variables

Create `.env.example`:

```bash
DATABASE_URL=
DATABASE_PROVIDER=neon_or_supabase

OPENAI_API_KEY=
ANTHROPIC_API_KEY=
AI_PROVIDER=openai
AI_MODEL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GMAIL_DEMO_ACCOUNT=
GMAIL_CONTROLLED_RECIPIENTS=

NEXT_PUBLIC_APP_URL=http://localhost:3000
DEMO_SAFE_MODE=true
USE_CACHED_AI=true
VERCEL_AI_MAX_DURATION_SECONDS=60

LANGSMITH_API_KEY=
LANGSMITH_TRACING=false
ELEVENLABS_API_KEY=
```

Default behavior:

```text
DEMO_SAFE_MODE=true
USE_CACHED_AI=true
```

This makes the demo resilient by default.

Deployment defaults:

```text
Use Neon or Supabase for Postgres.
Do not rely on Vercel for the primary database unless it has already been explicitly configured.
Keep USE_CACHED_AI=true until the full safe-mode demo is polished.
Switch live AI on only after the cached flow is reliable.
```

---

# 21. Quality Gates

Block merge if any of these are true:

```text
App cannot run in demo safe mode.
AI output is inserted without schema validation.
Email can be sent without approval.
Gmail failure crashes the app.
An email invents prospect facts.
Calibration treats no-reply as strong evidence.
Seeded demo path cannot reach next cohort.
One API route attempts to run the entire product loop.
Background Gmail polling is required for the demo to work.
The app requires live AI for the core demo.
```

Definition of done for hackathon MVP:

```text
Full safe-mode demo works in one browser.
At least one Gmail draft can be created if credentials are configured.
At least one archetype visibly updates from v1 to v2.
At least one next-cohort email is visibly better than cohort 1.
All critical tests pass.
Open doubts are documented in this plan or README.
```

---

# 22. Risk Register

| Risk | Impact | Mitigation | Owner |
| --- | --- | --- | --- |
| Gmail OAuth takes too long | Demo integration fails | Keep draft/send optional and safe-mode primary | Gmail stream |
| Live replies do not arrive | Calibration cannot demo live | Use replayed replies as default | API and demo streams |
| LLM schema output fails | UI breaks or data corrupts | Zod validation, retry once, cached fallback | AI stream |
| LLM latency is high | Demo feels slow | Preload cached outputs and show progress states | AI and UI streams |
| Database setup slows team | No shared state | Seeded JSON fallback first, Prisma second | DB stream |
| Merge conflicts across pages | Lost time | Respect file ownership and merge order | All streams |
| Emails look spammy | Product narrative weakens | Human approval, quality rubric, compliance warnings | UI and AI streams |
| Calibration feels fake | Demo loses credibility | Show predicted-vs-actual evidence and label replay honestly | Calibration/API stream |
| Scope creep | Core loop incomplete | Do not build roadmap modules | Project lead |
| Compliance concerns | Demo appears unsafe | Controlled recipients only, opt-out, suppression, no tracking pixels | Gmail stream |

---

# 23. Open Questions and Assumptions

These are real unknowns from the current spec/workspace. Do not silently invent answers.

## Product and Demo

Question:

```text
Will the hackathon judges expect a real Gmail draft/send, or is safe-mode replay acceptable?
```

Default assumption:

```text
Build safe-mode replay as mandatory. Add Gmail draft creation as optional proof.
```

Question:

```text
How many live controlled recipients are available for the demo?
```

Default assumption:

```text
Use one live controlled send at most, plus 4-6 replayed replies.
```

Question:

```text
What exact startup offer should be demoed?
```

Default assumption:

```text
Use the agency follow-up offer from the spec.
```

## Technical

Question:

```text
Database provider: Supabase, Neon, local Postgres, or SQLite fallback?
```

Default assumption:

```text
Use Postgres-compatible Prisma schema. If no hosted DB is ready, use local SQLite only as a short-term fallback and document the deviation.
```

Question:

```text
AI provider: OpenAI, Anthropic, or both?
```

Default assumption:

```text
Create provider adapter and support cached outputs. Implement one live provider first.
```

Question:

```text
Deployment target: Vercel, local only, or another host?
```

Default assumption:

```text
Optimize for local demo first. Deploy only after safe-mode path is stable.
```

Question:

```text
Auth model: single user, demo workspace, or Google login?
```

Default assumption:

```text
Single demo workspace. Gmail OAuth is separate and optional.
```

## Compliance and Data

Question:

```text
If live sending externally, what business address and opt-out destination should be used?
```

Default assumption:

```text
Do not live-send external cold emails. Send only to controlled recipients.
```

Question:

```text
Can lead CSV contain real personal data?
```

Default assumption:

```text
Use synthetic/demo leads unless explicitly approved.
```

## Design

Question:

```text
What brand direction should the UI use?
```

Default assumption:

```text
Founder cockpit: dark, sharp, high-contrast, with clear evidence cards and calibration animation.
```

---

# 24. Agent Operating Instructions

Create `AGENTS.md` with this content:

```md
# Crucible Agent Instructions

Crucible is a self-improving outbound engine for founders.

Core flow:
1. Founder enters offer.
2. System generates buyer archetype library.
3. CSV leads are uploaded.
4. Leads are matched to archetypes.
5. System predicts likely reactions.
6. Emails are generated with explicit hypotheses.
7. Gmail drafts/sends are created only after human approval.
8. Replies are parsed.
9. Predicted-vs-actual results calibrate archetypes.
10. Next cohort emails are rewritten.

Non-negotiables:
- Use TypeScript.
- Use Zod schemas for every AI output.
- Never claim synthetic predictions are real market proof.
- Do not auto-send without approval.
- Do not generate deceptive subject lines.
- Every email must have a hypothesis.
- Every calibration must show predicted vs actual.
- Demo Safe Mode must work without Gmail.
- Live LLM failure must fall back to cached output.
```

Create `CLAUDE.md` with this content:

```md
Use AGENTS.md and IMPLEMENTATION_PLAN.md as the source of truth.

When building:
- Create UI first with seeded data.
- Then wire database.
- Then add AI calls.
- Then add Gmail.
- Always preserve demo safe mode.
- Avoid unnecessary integrations.
- Respect workstream file ownership.
```

---

# 25. First Commands for the Build Agent

From the repository root:

```bash
npx create-next-app@latest crucible --ts --app --eslint --tailwind --src-dir false
cd crucible
npm install zod ai @ai-sdk/openai @ai-sdk/anthropic @prisma/client prisma googleapis papaparse date-fns nanoid framer-motion lucide-react
npm install -D vitest tsx prettier
npx prisma init
```

If shadcn is used, initialize it after the app scaffold:

```bash
npx shadcn@latest init
```

If a command fails because package versions or CLIs have changed, do not guess silently. Check the current tool documentation or choose the smallest working equivalent and document the deviation.

---

# 26. Final Recommendation

Build Crucible as a closed-loop outbound demo, not as a broad sales automation platform.

The best hackathon version is:

```text
8-12 archetypes
20-30 CSV leads
3 message angles
draft-first Gmail integration
seeded or controlled replies
one visible calibration event
one next-cohort rewrite
```

Prioritize:

```text
1. Demo safe mode.
2. Calibration moment.
3. Stepwise Vercel-safe demo actions.
4. Email quality and truthfulness.
5. Gmail drafts as proof of integration.
6. Visual polish after the loop works.
```

Do not let Gmail, voice, LangGraph, or external lead enrichment steal time from the core loop.

---

# 27. References

Use these primary docs when implementing deployment and Gmail behavior:

```text
Vercel Hobby plan:
https://vercel.com/docs/plans/hobby

Vercel function duration configuration:
https://vercel.com/docs/functions/configuring-functions/duration

Gmail draft creation:
https://developers.google.com/workspace/gmail/api/guides/drafts

Gmail sending:
https://developers.google.com/workspace/gmail/api/guides/sending
```
