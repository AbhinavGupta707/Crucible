# Final direction: **Crucible — Signal-Led Outbound That Learns**

**Crucible is a signal-led GTM engine for founder-led outbound.** It takes an offer and signal-enriched leads, ranks who matters now, explains why now, uses buyer memory to predict likely objections and message angles, writes hypothesis-driven signal-aware outreach, drafts or sends via Gmail, monitors replies, classifies outcomes, and updates signal, buyer, and message memory so the next cohort is sharper.

The core loop is:

```text
Offer + lead signals → Signal Radar → lead priority + why now
→ Buyer Memory → predicted objection + message angle
→ Signal-to-Message Forge → Gmail draft/send or replay
→ reply parsing → predicted-vs-actual analysis
→ Signal Memory + Buyer Memory + Message Memory
→ next signal cohort reprioritised and rewritten
```

The hackathon demo should show one thing clearly:

> **Crucible gets the first signal-led campaign partly wrong, learns which signals and messages actually produced replies, updates its memory, and reprioritises the next cohort.**

That is the product.

## 2026-05-09 pivot addendum: signal-led GTM layer

This addendum supersedes any older wording below that frames the product primarily as buyer archetype simulation.

The product should now feel closer to a **signal-led GTM engine** than a pure persona simulator:

```text
Who should I contact?
Why now?
What should I say?
What happened?
What did we learn?
Who should we contact next?
```

Keep buyer archetypes, prediction, reply parsing, Gmail draft-first, calibration, cached AI, and demo safe mode. Add one layer before buyer matching and one learning object after replies:

```text
Before matching: Signal Radar ranks leads using ICP fit, signal strength, freshness, archetype match, and message confidence.
After replies: Signal Memory learns which signal types actually performed.
```

Do **not** build live Apollo, Clay, LinkedIn, or scraping integrations for MVP. Signals are imported through seeded/demo CSV fields.

---

# 1. What we should build, and what we should not build

## Build this for MVP

1. **Offer Intake**
   Founder describes product, ICP guess, pain, proof point, desired CTA.

2. **Signal Radar / Lead Queue**
   Upload 20–30 signal-enriched leads. Rank who to contact first and explain "why this lead, why now."

3. **Buyer Memory**
   8–12 synthetic buyer archetypes, each with predicted objections, preferred framing, confidence, and version history.

4. **Lead CSV Upload**
   Upload 20–30 enriched leads with signal fields. Each lead is scored, ranked, and matched to an archetype.

5. **Pre-flight Simulation**
   For each lead, Crucible predicts: reply likelihood, likely objection, best message angle, and signal relevance.

6. **Signal-to-Message Forge**
   Generates cold emails and follow-ups. Every email is tied to an explicit hypothesis and references the lead signal naturally.

7. **Gmail Integration**
   For demo: create Gmail drafts or send a small number of emails from a new Gmail account to controlled/test recipients. Gmail API supports direct sends through `users.messages.send`, and draft creation requires an RFC 2822 MIME message encoded as base64URL. ([Google for Developers][1])

8. **Reply Monitor**
   Poll Gmail for replies in demo; use Gmail push notifications with Pub/Sub only as production architecture. Gmail supports `messages.list` with query syntax like the Gmail search box, and push notifications are available via Cloud Pub/Sub for mailbox changes. ([Google for Developers][2])

9. **Response Parser**
   Classifies replies into a fixed taxonomy.

10. **Calibration Engine**
    Compares predicted vs actual response. Updates Buyer Memory, Message Memory, and Signal Memory.

11. **Next Signal Cohort Generator**
    Reprioritises the next leads and rewrites the next batch of emails using calibrated memory.

## Do not build this for MVP

Avoid these for the hackathon:

```text
real Apollo/Clay API integration
full email deliverability stack
LinkedIn automation
100-person focus group
investor pitch coach
buyer legal/procurement committee
CRM sync
billing/team accounts
multi-domain sending
tracking pixels/open tracking
```

The buyer committee and investor coach are good roadmap modules, but they dilute the 10x outbound story.

---

# 2. Positioning

## One-liner

> **Crucible turns lead signals into sharper outbound: it ranks who to contact, explains why now, drafts signal-aware messages, monitors replies, and learns which signals and messages convert.**

## Track framing

This fits the **10x outbound engine** track directly.

Most outbound products help with enrichment, lead scoring, personalization, sequencing, or deliverability. Clay emphasizes enrichment, intent signals, account/contact scoring and personalized outbound; Apollo positions itself around prospecting, buying intent and lead scoring; Gojiberry emphasizes high-intent signals, ICP filtering, relevant outreach, and tracking which signals/campaigns convert. Crucible’s wedge is different: **signal → message → real response → signal/buyer/message memory → next cohort**. ([Clay][3], [Gojiberry][19])

## Demo line

> “Apollo helps you find prospects. Clay helps you enrich them. Gojiberry helps you spot warm signals. Crucible helps you learn which signals and messages actually work for your offer.”

Slightly safer version:

> “Crucible makes the learning loop explicit: every email is an experiment, every reply updates signal, buyer, and message memory, and the next cohort uses that memory.”

---

# 3. Inspiration from open-source and industry projects

## TinyTroupe

TinyTroupe is directly relevant for the **synthetic persona library**. Its README describes `TinyPerson` agents with personalities, interests and goals interacting inside `TinyWorld` environments, and explicitly lists ad evaluation, product feedback, brainstorming, and simulated focus groups as possible use cases. It also warns that it is experimental and for simulation only, which is exactly how we should frame Crucible’s synthetic layer. ([GitHub][4])

**Borrow:**

```text
Persona as a first-class object
Simulation environments
Persona-specific traits/goals/interests
Persona interactions
Simulation-only honesty
```

**Do not borrow:**

```text
Broad “simulate anything” positioning
Large focus-group framing
Research-heavy UI
```

## MiroFish

MiroFish is the Chinese/open-source project you were remembering. It presents itself as a multi-agent swarm-intelligence simulation engine that constructs a parallel digital world from seed information and runs many agents with personalities, memory and behavioral logic. Its license is AGPL-3.0, so we should use it as inspiration, not copy code unless we are willing to comply with AGPL obligations. ([GitHub][5])

**Borrow:**

```text
Seed information → digital world → agents → interactions → report
Visible simulation “world”
Versioned evolution of agents
God’s-eye rerun concept
```

**Do not borrow:**

```text
“Predict anything” language
Thousands of agents
Macro prediction claims
AGPL code without license planning
```

## Vercel auto-outbound

Vercel Labs’ `auto-outbound` is useful for the campaign/data-flow pattern. It creates campaigns, accepts contacts via CSV, supports company/person research toggles, generates follow-up sequences, and can sync generated emails to Outreach in different modes, including “store only,” “upsert,” and “full sequence enrollment.” ([GitHub][6])

**Borrow:**

```text
Campaign object
CSV contact import
Generated multi-touch sequence
Manual review mode
External outreach integration as optional
```

**Differentiate:**

```text
auto-outbound generates emails
Crucible predicts, sends, observes, calibrates, and rewrites
```

## OpenSDR

OpenSDR is an open-source sales-development/research tool that runs as a CLI and MCP server, with tools for researching companies, LinkedIn profile discovery, mutual connections, and message drafting. It is useful inspiration for future lead research, not the hackathon MVP. ([GitHub][7])

**Borrow later:**

```text
Company research tool
MCP-style lead-research tools
CLI agent patterns
```

**Do not build now:**

```text
LinkedIn browser automation
live scraping
multi-step research agents
```

## SalesGPT

SalesGPT is useful for conversation-state thinking. Its README describes a context-aware sales agent that understands sales-conversation stage and can work across voice, email and messaging channels while using product knowledge tools to reduce hallucinations. ([GitHub][8])

**Borrow:**

```text
Stage-aware sales reasoning
Conversation state
Product knowledge grounding
```

**Do not build now:**

```text
autonomous closer
payment collection
multi-channel sales agent
```

---

# 4. Product requirements

## Primary user

```text
Early-stage founder
Founding sales hire
Technical founder doing outbound
GTM operator at a B2B startup
Outbound agency operator
```

## Primary pain

The founder does not know:

```text
which buyer archetype actually responds
which message angle works
why people ignore them
which objections are predictable
how to learn from replies systematically
how to improve cohort 2 from cohort 1
```

## Core product promise

Crucible should answer:

```text
Who should I target?
What are they likely to object to?
What should I say first?
What hypothesis is this email testing?
What happened when I sent it?
What did we predict correctly?
What did we get wrong?
What should the next batch say differently?
```

## MVP acceptance criteria

The project is done when the user can:

```text
1. Enter a founder offer.
2. Generate 8–12 buyer archetypes.
3. Upload a CSV of 20–30 leads.
4. Match every lead to an archetype.
5. Generate outbound emails tied to hypotheses.
6. Create Gmail drafts or send controlled test emails.
7. Pull in staged or real Gmail replies.
8. Classify replies into a fixed taxonomy.
9. Compare predicted vs actual outcomes.
10. Update at least one archetype from v1 to v2.
11. Generate a visibly improved next-cohort email.
12. Run the full demo without relying on live scraping.
```

---

# 5. High-level architecture

## Recommended stack

For hackathon speed:

```text
Frontend: Next.js App Router + TypeScript
UI: Tailwind + shadcn/ui + Framer Motion
AI UI / structured generation: Vercel AI SDK
Agent orchestration: custom TypeScript workflow first; LangGraph optional
Database: Postgres via Supabase or Neon
ORM: Prisma
Vector search: pgvector, optional for MVP
Email: Gmail API via googleapis
Auth: simple Google OAuth for one test Gmail account
LLM: provider adapter, OpenAI/Anthropic/Bedrock-compatible
Tracing: LangSmith optional
Voice: ElevenLabs optional, not core
Build agents: Codex / Claude Code
Kiro: optional spec/steering layer, not runtime
```

Vercel AI SDK is useful because it supports structured object generation through schemas; OpenAI Structured Outputs are useful because they constrain model responses to a JSON Schema, which matters for stable personas, reply classifiers and calibration outputs. ([Vercel][9])

LangGraph is useful if you want durable, debuggable, multi-step workflows; the official docs call out persistence, streaming and debugging/deployment support. For a one-day build, I would start with a simple TypeScript orchestrator and only use LangGraph if someone on the team already knows it. ([LangChain Docs][10])

Claude Code and Codex are fine for the build. Claude Code’s own docs describe it as an agentic coding tool that reads your codebase, edits files, runs commands and integrates with development tools. Kiro is also useful for spec-driven development, with docs, specs, steering and hooks; use it as a planning/spec layer if you want sponsor alignment, but do not make it a runtime dependency. ([Claude][11])

## Architecture diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│ Next.js UI: Offer Intake, Library, Prospects, Campaign,      │
│ Calibration, Next Cohort                                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                           │
│ Next.js Route Handlers                                      │
│ /api/offers /api/personas /api/prospects /api/campaigns      │
│ /api/gmail /api/replies /api/calibration                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Crucible Orchestrator                    │
│ Hypothesis Agent                                            │
│ Persona Synthesizer                                         │
│ Prospect Matcher                                            │
│ Pre-flight Simulator                                        │
│ Outreach Generator                                          │
│ Gmail Draft/Send Service                                    │
│ Response Parser                                             │
│ Calibration Agent                                           │
│ Next Cohort Generator                                       │
└───────────────┬───────────────────────┬─────────────────────┘
                │                       │
                ▼                       ▼
┌─────────────────────────────┐   ┌───────────────────────────┐
│ Postgres + Prisma           │   │ Gmail API                 │
│ campaigns, leads, personas, │   │ drafts, send, list, get   │
│ predictions, replies, memory│   │ replies                   │
└─────────────────────────────┘   └───────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Model Provider Adapter                   │
│ Structured output, classification, generation, calibration  │
└─────────────────────────────────────────────────────────────┘
```

---

# 6. User experience and demo wow factor

The UI matters as much as the backend. The winning demo should feel alive.

## Screen 1: Offer Intake

Visual: dark, clean founder cockpit.

Fields:

```text
What are you selling?
Who do you think buys it?
What pain do you solve?
What proof do you have?
What is your desired CTA?
Tone: concise / founder-led / warm / direct / technical
```

Demo button:

```text
Build buyer memory
```

Output:

```text
Offer hypothesis
ICP guess
Buyer/user/champion split
Likely objections
Message angles to test
```

## Screen 2: Buyer Archetype Library

This is the first wow moment.

Show 8–12 cards, not 50.

Each card:

```text
Overworked Agency Owner
Version: v1
Predicted reply likelihood: 42%
Top objection: “I don’t have time to switch tools”
Best angle: ROI / time recovered
Confidence: 61%
```

Card categories:

```text
Early adopter
Skeptical operator
Budget-sensitive owner
Technical evaluator
Trust-first buyer
Wrong-person gatekeeper
Competitor-locked buyer
Interested-but-later buyer
```

Visual:

```text
Persona cards pulse into existence.
Each has a color-coded confidence and objection tag.
```

## Screen 3: Prospect Inbox

Upload CSV.

Columns:

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
linkedin_summary optional
```

Each prospect row shows:

```text
Prospect → matched archetype → confidence → predicted objection → recommended angle
```

Example:

```text
Sarah Chen, Founder, BrightOps
Matched to: Budget-sensitive operator
Confidence: 0.81
Predicted objection: “already using spreadsheets”
Best angle: missed revenue / time saved
```

## Screen 4: Outbound Forge

For every generated email, show the experiment hypothesis at the top.

```text
Hypothesis:
“Agency owners respond better to missed-revenue framing than AI-productivity framing.”

Variant:
Pain-led

Subject:
After-hours leads

Body:
Hi Sarah — quick question...
```

Each email has:

```text
Predicted reply likelihood
Predicted objection
CTA quality score
Compliance warning
Human approval checkbox
```

Important: the product should **not** look like an auto-spam machine. Every message should be reviewed before sending.

## Screen 5: Campaign Monitor / Gmail Inbox

Show real or staged replies arriving.

Reply cards:

```text
Reply from Sarah
Actual outcome: Interested but later
Actual objection: timing
Prediction: pricing objection
Prediction result: wrong
```

No-reply entries should be low-confidence:

```text
Observed: no reply
Confidence: low
Possible causes: timing, deliverability, weak relevance, wrong buyer
```

## Screen 6: Calibration View

This is the main demo climax.

Show a predicted-vs-actual matrix:

```text
Archetype: Budget-sensitive operator

Predicted:
- pricing objection: 70%
- trust objection: 15%
- timing objection: 10%
- competitor: 5%

Actual:
- pricing objection: 30%
- trust objection: 10%
- timing objection: 50%
- competitor: 10%

Accuracy: 42%
Calibration triggered.
```

Then show the persona card flipping:

```text
Budget-sensitive operator v1 → v2

Added:
- timing objection
- prefers “15-min fit check” CTA
- dislikes “book a demo”
- responds better to implementation-light messaging

Removed:
- over-weighted price sensitivity
```

## Screen 7: Next Cohort Generator

Show before/after email.

```text
Cohort 1:
“Book a demo to see how AI can automate your ops.”

Cohort 2:
“Worth a quick 15-min fit check to see if this removes one manual follow-up from your week?”
```

Show metric punchline, clearly labelled:

```text
Cohort 1 simulated quality: 31%
Cohort 2 after calibration: 58%
```

If you use pre-staged replies, label it as “demo replay” or “replayed controlled test,” not “live market proof.”

---

# 7. Core data model

Use Postgres + Prisma. Below is the build-ready conceptual schema.

## Main tables

```prisma
model Workspace {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())

  offers    Offer[]
  gmailConnections GmailConnection[]
}

model GmailConnection {
  id             String   @id @default(uuid())
  workspaceId    String
  workspace      Workspace @relation(fields: [workspaceId], references: [id])

  email          String
  accessToken    String
  refreshToken   String
  scope          String
  tokenExpiresAt DateTime
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

## Offer and hypotheses

```prisma
model Offer {
  id              String   @id @default(uuid())
  workspaceId     String
  workspace       Workspace @relation(fields: [workspaceId], references: [id])

  title           String
  rawFounderInput String
  productSummary  String
  icpGuess        String
  buyer           String?
  user            String?
  painClaim       String
  proofPoint      String?
  desiredCta      String
  tone            String
  createdAt       DateTime @default(now())

  hypotheses      ExperimentHypothesis[]
  archetypes      BuyerArchetype[]
  campaigns       Campaign[]
}

model ExperimentHypothesis {
  id          String @id @default(uuid())
  offerId     String
  offer       Offer @relation(fields: [offerId], references: [id])

  statement   String
  angle       String // pain, roi, trust, speed, competitor, founder-led
  targetRole  String?
  status      String @default("untested") // untested, supported, contradicted, inconclusive
  confidence  Float  @default(0.0)
  createdAt   DateTime @default(now())
}
```

## Buyer archetypes and versions

```prisma
model BuyerArchetype {
  id          String @id @default(uuid())
  offerId     String
  offer       Offer @relation(fields: [offerId], references: [id])

  name        String
  segment     String
  role        String
  description String
  activeVersionId String?
  createdAt   DateTime @default(now())

  versions    BuyerArchetypeVersion[]
  matches     ProspectMatch[]
}

model BuyerArchetypeVersion {
  id             String @id @default(uuid())
  archetypeId     String
  archetype       BuyerArchetype @relation(fields: [archetypeId], references: [id])

  versionNumber   Int
  voiceStyle      String
  currentWorkflow String
  painIntensity   String
  buyingPower     String
  riskTolerance   String

  predictedObjections Json
  preferredAngles      Json
  dislikedPhrases      Json
  likelyReplyPatterns  Json
  calibrationConfidence Float @default(0.5)

  createdFrom          String // cold_start, calibration, manual_edit
  observedEvidence     Json?
  createdAt            DateTime @default(now())
}
```

## Leads and matching

```prisma
model Prospect {
  id          String @id @default(uuid())
  workspaceId String

  firstName   String
  lastName    String?
  email       String
  title       String?
  company     String
  industry    String?
  companySize String?
  website     String?
  notes       String?
  trigger     String?
  source      String // csv, gmail, apollo_future, clay_future
  createdAt   DateTime @default(now())

  matches     ProspectMatch[]
  emails      OutboundEmail[]
}

model ProspectMatch {
  id                String @id @default(uuid())
  prospectId         String
  prospect           Prospect @relation(fields: [prospectId], references: [id])

  archetypeId        String
  archetype          BuyerArchetype @relation(fields: [archetypeId], references: [id])

  archetypeVersionId String
  confidence         Float
  reasoning          String
  matchedSignals     Json
  createdAt          DateTime @default(now())
}
```

## Campaigns, cohorts and outbound emails

```prisma
model Campaign {
  id          String @id @default(uuid())
  offerId     String
  offer       Offer @relation(fields: [offerId], references: [id])

  name        String
  status      String @default("draft") // draft, approved, sending, monitoring, calibrated
  createdAt   DateTime @default(now())

  cohorts     CampaignCohort[]
}

model CampaignCohort {
  id          String @id @default(uuid())
  campaignId  String
  campaign    Campaign @relation(fields: [campaignId], references: [id])

  cohortNumber Int
  personaLibraryVersion String
  status       String @default("draft")
  successMetric String?
  killCriterion String?
  createdAt    DateTime @default(now())

  emails       OutboundEmail[]
  calibrationRuns CalibrationRun[]
}

model OutboundEmail {
  id          String @id @default(uuid())
  cohortId    String
  cohort      CampaignCohort @relation(fields: [cohortId], references: [id])

  prospectId  String
  prospect    Prospect @relation(fields: [prospectId], references: [id])

  hypothesisId String?
  angle        String
  subject      String
  body         String
  predictedReplyLikelihood Float
  predictedObjection       String
  predictedOutcome         String
  status       String @default("draft") // draft, approved, gmail_draft_created, sent, replied, bounced
  gmailDraftId String?
  gmailMessageId String?
  gmailThreadId String?
  replyToAlias String?
  createdAt    DateTime @default(now())
}
```

## Replies and calibration

```prisma
model EmailEvent {
  id          String @id @default(uuid())
  emailId     String
  email       OutboundEmail @relation(fields: [emailId], references: [id])

  type        String // sent, open_future, reply, bounce, unsubscribe
  rawPayload  Json?
  createdAt   DateTime @default(now())
}

model ReplyAnalysis {
  id          String @id @default(uuid())
  emailId     String
  email       OutboundEmail @relation(fields: [emailId], references: [id])

  rawReplyText String
  outcome      String // positive, interested_later, wrong_person, not_relevant, pricing_objection, trust_objection, competitor_locked, unsubscribe, no_reply
  objectionType String?
  sentiment    String
  funnelStage  String?
  volunteeredInfo Json?
  confidence   Float
  predictedWasCorrect Boolean
  mismatchReason String?
  createdAt    DateTime @default(now())
}

model CalibrationRun {
  id          String @id @default(uuid())
  cohortId    String
  cohort      CampaignCohort @relation(fields: [cohortId], references: [id])

  status      String // pending, running, complete
  summary     String?
  accuracyBefore Float?
  accuracyAfter  Float?
  triggeredUpdates Json?
  createdAt   DateTime @default(now())
}

model PersonaUpdate {
  id          String @id @default(uuid())
  calibrationRunId String
  archetypeId String
  oldVersionId String
  newVersionId String

  reason      String
  diff        Json
  createdAt   DateTime @default(now())
}

model SuppressionEntry {
  id          String @id @default(uuid())
  workspaceId String
  email       String
  reason      String // unsubscribe, manual, bounced, complaint
  createdAt   DateTime @default(now())
}
```

---

# 8. Agent architecture

Use structured outputs for every agent. Do not let the model free-form anything that affects the UI or database.

## Agent 1: Hypothesis Agent

**Input:**

```json
{
  "rawFounderInput": "...",
  "icpGuess": "...",
  "desiredCta": "book_discovery",
  "tone": "founder-led"
}
```

**Output:**

```ts
const OfferHypothesisSchema = z.object({
  title: z.string(),
  productSummary: z.string(),
  icpGuess: z.string(),
  likelyBuyer: z.string(),
  likelyUser: z.string(),
  champion: z.string().optional(),
  painClaim: z.string(),
  proofPoint: z.string().optional(),
  desiredCta: z.string(),
  messageAngles: z.array(z.enum([
    "pain", "roi", "trust", "speed", "competitive", "founder_led"
  ])),
  riskyAssumptions: z.array(z.object({
    statement: z.string(),
    riskLevel: z.enum(["low", "medium", "high"]),
    whyItMatters: z.string()
  }))
});
```

## Agent 2: Persona Synthesizer

Generates 8–12 archetypes.

Each archetype needs:

```ts
const ArchetypeSchema = z.object({
  name: z.string(),
  segment: z.string(),
  role: z.string(),
  description: z.string(),
  currentWorkflow: z.string(),
  painIntensity: z.enum(["low", "medium", "high"]),
  buyingPower: z.enum(["none", "influencer", "budget_owner", "final_decision"]),
  riskTolerance: z.enum(["low", "medium", "high"]),
  voiceStyle: z.string(),
  predictedObjections: z.array(z.object({
    type: z.enum([
      "pricing", "trust", "timing", "wrong_person", "competitor",
      "unclear_value", "implementation", "no_budget", "too_busy"
    ]),
    probability: z.number().min(0).max(1),
    examplePhrase: z.string()
  })),
  preferredAngles: z.array(z.object({
    angle: z.string(),
    reason: z.string(),
    probabilityBoost: z.number()
  })),
  dislikedPhrases: z.array(z.string()),
  likelyReplyPatterns: z.array(z.string())
});
```

## Agent 3: Prospect Matcher

Matches real prospect to archetype.

Scoring formula:

```text
match_score =
  0.35 role/title similarity
+ 0.25 company/segment similarity
+ 0.20 trigger/notes similarity
+ 0.10 industry/company-size fit
+ 0.10 LLM judgment score
```

Output:

```ts
const ProspectMatchSchema = z.object({
  prospectId: z.string(),
  archetypeId: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  matchedSignals: z.array(z.string()),
  riskFlags: z.array(z.string())
});
```

## Agent 4: Pre-flight Simulator

For each prospect-archetype pair, predict:

```ts
const PreflightPredictionSchema = z.object({
  replyLikelihood: z.number().min(0).max(100),
  predictedOutcome: z.enum([
    "positive",
    "interested_later",
    "wrong_person",
    "not_relevant",
    "pricing_objection",
    "trust_objection",
    "competitor_locked",
    "unsubscribe",
    "no_reply"
  ]),
  predictedObjection: z.string(),
  bestAngle: z.enum(["pain", "roi", "trust", "speed", "competitive", "founder_led"]),
  phrasesToUse: z.array(z.string()),
  phrasesToAvoid: z.array(z.string()),
  confidence: z.number().min(0).max(1)
});
```

## Agent 5: Outreach Generator

Generates emails with explicit hypotheses.

Output:

```ts
const OutboundEmailDraftSchema = z.object({
  hypothesis: z.string(),
  angle: z.string(),
  subject: z.string(),
  body: z.string(),
  followUp1: z.string(),
  followUp2: z.string(),
  predictedReplyLikelihood: z.number().min(0).max(100),
  predictedObjection: z.string(),
  cta: z.string(),
  complianceFooter: z.string(),
  riskWarnings: z.array(z.string())
});
```

Email rules:

```text
under 120 words
one clear CTA
no fake familiarity
no invented customer proof
pre-empt one predicted objection
include opt-out line if sending externally
human approval required
```

## Agent 6: Response Parser

Reply taxonomy:

```ts
const ReplyAnalysisSchema = z.object({
  outcome: z.enum([
    "positive",
    "interested_later",
    "wrong_person",
    "not_relevant",
    "pricing_objection",
    "trust_objection",
    "competitor_locked",
    "unsubscribe",
    "hostile",
    "bounce",
    "no_reply"
  ]),
  sentiment: z.enum(["positive", "neutral", "negative", "hostile"]),
  objectionType: z.string().nullable(),
  funnelStage: z.enum([
    "cold",
    "curious",
    "qualified_interest",
    "meeting_ready",
    "nurture",
    "closed_negative"
  ]),
  volunteeredInfo: z.array(z.object({
    fact: z.string(),
    usefulness: z.enum(["low", "medium", "high"])
  })),
  predictedWasCorrect: z.boolean(),
  mismatchReason: z.string().nullable(),
  confidence: z.number().min(0).max(1)
});
```

## Agent 7: Calibration Agent

Takes the last cohort’s predictions and actual outcomes.

Calculates:

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
accuracy < 0.65
or unpredicted objection appears in >= 30% of replies
or preferred angle underperforms another angle by >= 20%
or unsubscribe/hostile rate exceeds threshold
```

Output:

```ts
const CalibrationUpdateSchema = z.object({
  archetypeId: z.string(),
  shouldUpdate: z.boolean(),
  reason: z.string(),
  oldPredictions: z.array(z.string()),
  observedReality: z.array(z.string()),
  newPredictedObjections: z.array(z.object({
    type: z.string(),
    probability: z.number(),
    evidence: z.string()
  })),
  newPreferredAngles: z.array(z.object({
    angle: z.string(),
    reason: z.string()
  })),
  phrasesToUse: z.array(z.string()),
  phrasesToAvoid: z.array(z.string()),
  confidenceAfter: z.number().min(0).max(1)
});
```

## Agent 8: Next Cohort Generator

Creates the improved campaign.

Output:

```ts
const NextCohortPlanSchema = z.object({
  summary: z.string(),
  changesFromPreviousCohort: z.array(z.string()),
  segmentsToDoubleDown: z.array(z.string()),
  segmentsToPause: z.array(z.string()),
  revisedMessageAngles: z.array(z.object({
    archetype: z.string(),
    newAngle: z.string(),
    why: z.string()
  })),
  newEmailTemplates: z.array(z.object({
    archetype: z.string(),
    subject: z.string(),
    body: z.string(),
    hypothesis: z.string()
  })),
  killCriterion: z.string(),
  successMetric: z.string()
});
```

---

# 9. Gmail integration design

## Demo mode and live mode

Build two modes:

```text
Demo Safe Mode:
- uses CSV leads
- creates emails in-app
- plays back seeded replies
- calibration works for real
- no Gmail needed

Live Gmail Mode:
- connects a new Gmail account
- creates drafts or sends to controlled recipients
- polls Gmail replies
- classifies replies
```

This gives you reliability and a real integration.

## OAuth setup

1. Create Google Cloud project.
2. Enable Gmail API.
3. Configure OAuth consent screen.
4. Add the new Gmail account as a test user.
5. Request only the scopes needed.

Recommended MVP scopes:

```text
gmail.compose  -> create Gmail drafts
gmail.send     -> send approved emails
gmail.readonly -> read replies for classification
```

Gmail scopes are explicit OAuth scopes; `users.messages.send` accepts `gmail.send`, `gmail.compose`, `gmail.modify`, or full mail scope, but we should avoid broad `https://mail.google.com/` for the demo. ([Google for Developers][1])

## Draft-first flow

Use draft-first as default.

```text
1. Generate emails.
2. Founder reviews.
3. App creates Gmail drafts.
4. Founder optionally sends from Gmail or app.
```

Why draft-first:

```text
safer
less spammy
better for demo
avoids accidental sends
shows human-in-the-loop
```

Gmail draft creation requires building a MIME message, base64URL-encoding it, and calling `drafts.create` with `message.raw`. ([Google for Developers][12])

## Sending flow

If sending live:

```text
1. Check suppression list.
2. Check recipient is in approved demo list.
3. Build MIME message.
4. Add Reply-To plus alias if available.
5. Call users.messages.send.
6. Store returned messageId/threadId.
7. Poll thread for replies.
```

Use only controlled recipients for hackathon. Do not send real cold emails to strangers during demo.

## Reply tracking

Best MVP approach:

```text
Poll Gmail every 10–20 seconds using messages.list with query filters.
Use threadId and/or Reply-To plus addressing to associate replies.
Fetch full message.
Extract plain text.
Run Response Parser.
```

Use query examples:

```text
from:(prospect@email.com) newer_than:1d
to:(your-demo-account@gmail.com) newer_than:1d
subject:(same subject)
```

Gmail `messages.list` supports `q` with the same query format as Gmail search, and can filter by labels. ([Google for Developers][2])

Production approach:

```text
Gmail users.watch → Pub/Sub → webhook → history API → fetch changed messages
```

Gmail’s push-notification docs explain that Pub/Sub can notify your backend when a mailbox changes, avoiding polling. ([Google for Developers][13])

## Headers and threading

For each outbound email store:

```text
gmailMessageId
gmailThreadId
recipientEmail
replyToAlias
campaignId
cohortId
prospectId
```

Use a reply alias if possible:

```text
youraccount+crucible-c1-l17@gmail.com
```

Also include internal metadata in your database, not in visible email copy.

## Compliance guardrails

For any real B2B sending, include:

```text
accurate sender identity
truthful subject line
valid business contact address or opt-out route
unsubscribe/opt-out handling
suppression list
human approval
low volume
no tracking pixels in MVP
```

In the UK, ICO guidance says PECR’s electronic-mail consent rule does not apply to corporate subscribers, but you must not disguise identity, must provide a valid opt-out address, and UK GDPR still applies when processing personal data; sole traders and some partnerships are treated differently. ([ICO][14])

For the US, FTC CAN-SPAM guidance says commercial emails need accurate headers, non-deceptive subject lines, a physical postal address, opt-out instructions, and prompt honoring of opt-outs; the law also applies to B2B email. ([Federal Trade Commission][15])

Also respect sending limits and authentication. Google Workspace lists a 2,000-message daily user limit, 500 for trial accounts, and 500 external recipients per Gmail API message; Google sender guidelines require SPF or DKIM for all senders and SPF/DKIM/DMARC for bulk senders, plus low spam rates. ([Google Workspace Help][16])

---

# 10. API routes

Use Next.js route handlers.

```text
POST /api/offers
POST /api/offers/:offerId/archetypes/generate
POST /api/prospects/upload-csv
POST /api/prospects/:prospectId/match
POST /api/campaigns
POST /api/campaigns/:campaignId/cohorts
POST /api/cohorts/:cohortId/preflight
POST /api/cohorts/:cohortId/generate-emails
POST /api/emails/:emailId/approve
POST /api/gmail/connect
GET  /api/gmail/callback
POST /api/gmail/create-drafts
POST /api/gmail/send-approved
POST /api/gmail/poll-replies
POST /api/replies/:replyId/analyze
POST /api/cohorts/:cohortId/calibrate
POST /api/cohorts/:cohortId/next
GET  /api/demo/seed
POST /api/demo/replay-replies
```

## Important response patterns

All endpoints should return:

```json
{
  "ok": true,
  "data": {},
  "warnings": [],
  "traceId": "..."
}
```

LLM endpoints should support:

```text
live mode
cached mode
retry-on-schema-failure
```

---

# 11. Folder structure

```text
crucible/
  app/
    page.tsx
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
      cohorts/[cohortId]/preflight/route.ts
      cohorts/[cohortId]/generate-emails/route.ts
      emails/[emailId]/approve/route.ts
      gmail/connect/route.ts
      gmail/callback/route.ts
      gmail/create-drafts/route.ts
      gmail/send-approved/route.ts
      gmail/poll-replies/route.ts
      replies/[replyId]/analyze/route.ts
      cohorts/[cohortId]/calibrate/route.ts
      cohorts/[cohortId]/next/route.ts
      demo/seed/route.ts
      demo/replay-replies/route.ts

  components/
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
      evals/
        outbound-quality.ts
        reply-parser-eval.ts
        calibration-eval.ts

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

    scoring/
      match-score.ts
      reply-likelihood.ts
      prediction-accuracy.ts
      calibration-trigger.ts

    demo/
      seed.ts
      replay.ts
      sample-leads.csv
      sample-replies.json
      sample-offer.txt

  prisma/
    schema.prisma
    migrations/

  tests/
    unit/
    integration/
    evals/

  AGENTS.md
  CLAUDE.md
  .kiro/
    steering/
      product.md
      tech.md
      structure.md
      ai-output-rules.md
    specs/
      crucible-mvp/
        requirements.md
        design.md
        tasks.md
```

---

# 12. Key prompt templates

## Global simulation/system rule

```text
You are part of Crucible, a self-improving outbound engine.

Rules:
- Treat all synthetic buyer reactions as hypotheses, not facts.
- Do not claim market proof.
- Be specific, concise, and uncomfortable where needed.
- Every outbound email must test an explicit hypothesis.
- Every prediction must include confidence.
- Every calibration must compare predicted vs actual.
- Do not invent prospect facts not present in the lead data.
- Do not create deceptive subject lines.
- Do not generate aggressive, manipulative, or spammy copy.
- Return only JSON matching the schema.
```

## Persona synthesizer prompt

```text
Given this founder offer, create 8–12 buyer archetypes.

Offer:
{{offer}}

Create archetypes that are meaningfully different across:
- role
- buying authority
- pain intensity
- risk tolerance
- current workaround
- likely objections
- preferred message angle
- phrases they dislike

Do not create generic personas.
Each archetype must be useful for outbound generation.
Return JSON only.
```

## Outreach generator prompt

```text
Generate a cold email for this prospect.

Offer:
{{offer}}

Prospect:
{{prospect}}

Matched buyer archetype:
{{archetype_version}}

Preflight prediction:
{{prediction}}

Experiment hypothesis:
{{hypothesis}}

Rules:
- Under 120 words.
- One clear CTA.
- Founder-led tone.
- Do not invent traction, clients, funding, or facts.
- Pre-empt exactly one predicted objection.
- No manipulative language.
- Include an opt-out sentence if external_send=true.
- Return JSON only.
```

## Response parser prompt

```text
Classify this reply.

Outbound email:
{{email}}

Prediction:
{{prediction}}

Raw reply:
{{reply}}

Classify into:
positive, interested_later, wrong_person, not_relevant,
pricing_objection, trust_objection, competitor_locked,
unsubscribe, hostile, bounce, no_reply.

Then state whether the prediction was correct and why.
Return JSON only.
```

## Calibration prompt

```text
You are calibrating a buyer archetype.

Archetype v{{old_version}}:
{{archetype}}

Predictions made:
{{predictions}}

Actual reply analyses:
{{reply_analyses}}

Task:
1. Identify what the archetype got right.
2. Identify what it got wrong.
3. Update predicted objections.
4. Update preferred message angles.
5. Add phrases to use and avoid.
6. Generate a new archetype version.
7. Explain the diff.

Return JSON only.
```

---

# 13. Scoring and calibration logic

## Reply likelihood score

Use deterministic scoring after LLM outputs:

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

## Prediction accuracy

For each sent email:

```text
exact outcome match = 1.0
same family match = 0.6
wrong but same sentiment = 0.3
wrong = 0.0
no reply = excluded or low-confidence bucket
```

Outcome families:

```text
positive family:
positive, meeting_ready

soft interest family:
interested_later, nurture

negative fit family:
wrong_person, not_relevant, competitor_locked

objection family:
pricing_objection, trust_objection, timing, implementation

hard negative:
unsubscribe, hostile
```

## Calibration trigger

```ts
shouldCalibrate(archetype) =
  sent_count >= 5 &&
  (
    prediction_accuracy < 0.65 ||
    unpredicted_objection_rate >= 0.30 ||
    hostile_or_unsubscribe_rate >= 0.10 ||
    new_objection_cluster_count >= 2
  )
```

For the demo, lower thresholds so one visible calibration happens after 5–8 replies.

## No-reply handling

No-reply should not be treated as strong evidence.

```text
No reply is weak evidence.
Possible causes:
- wrong timing
- deliverability
- inbox overload
- unclear value
- wrong buyer
- weak CTA
```

Display confidence as low unless there is a broader pattern.

---

# 14. Demo script

## Three-minute flow

### Act 1 — cold start, 45 seconds

Founder enters:

```text
We help small agencies automatically follow up with inbound leads
who go quiet after a discovery call. It reads call notes and drafts
personalized follow-ups so founders stop losing warm prospects.
```

Click:

```text
Build buyer memory
```

Show archetypes:

```text
Overworked Agency Owner
Skeptical Solo Consultant
Ops-Minded Studio Manager
Growth-Focused Founder
Tool-Fatigued Operator
```

### Act 2 — generate campaign, 60 seconds

Upload CSV.

Show matching:

```text
Sarah → Overworked Agency Owner → confidence 0.84
James → Tool-Fatigued Operator → confidence 0.76
Priya → Growth-Focused Founder → confidence 0.81
```

Generate emails.

Show hypothesis tags:

```text
Hypothesis A:
“Agency owners respond better to missed-revenue framing than AI automation framing.”

Hypothesis B:
“Tool-fatigued operators need low-implementation language before they engage.”
```

Create Gmail drafts or send one test email.

### Act 3 — replies and calibration, 75 seconds

Play back replies.

Show parser:

```text
Prediction: pricing objection
Actual: timing / implementation objection
Prediction wrong
```

Run calibration.

Show archetype update:

```text
Tool-Fatigued Operator v1 → v2

Added:
- “I don't have time to set up another tool”
- prefers “we draft, you approve”
- dislikes “automation platform”

Confidence: 51% → 73%
```

Generate next cohort.

Show before/after:

```text
Cohort 1:
“AI follow-up automation for agencies.”

Cohort 2:
“Never lose a warm lead because you forgot the second follow-up — we draft it, you approve it.”
```

Closing line:

> “Crucible does not just write outbound. It remembers what the market taught you and uses that memory in the next send.”

---

# 15. Gmail live-demo setup

## Option A: safest

Use Gmail API to create drafts only.

```text
Connect Gmail
Generate 5 emails
Create Gmail drafts
Open Gmail inbox/drafts tab
Show drafts exist
Replay seeded replies in app
```

This proves integration without sending.

## Option B: stronger

Send 2–3 emails to controlled recipients.

```text
Send to teammates / alternate Gmail accounts
Teammates reply with prepared responses
App polls inbox
Parser classifies live replies
Calibration runs
```

## Option C: hybrid

Use one real live email and the rest replayed.

This is my recommendation.

```text
1 live controlled send
4 seeded reply replays
1 visible calibration
```

---

# 16. Dependencies

## Core package list

```json
{
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "typescript": "latest",
    "tailwindcss": "latest",
    "framer-motion": "latest",
    "lucide-react": "latest",
    "zod": "latest",
    "ai": "latest",
    "@ai-sdk/openai": "latest",
    "@ai-sdk/anthropic": "latest",
    "@prisma/client": "latest",
    "prisma": "latest",
    "googleapis": "latest",
    "papaparse": "latest",
    "date-fns": "latest",
    "nanoid": "latest"
  },
  "devDependencies": {
    "vitest": "latest",
    "tsx": "latest",
    "eslint": "latest",
    "prettier": "latest"
  }
}
```

## Optional

```json
{
  "optional": {
    "@langchain/langgraph": "latest",
    "langsmith": "latest",
    "elevenlabs": "latest",
    "pgvector": "latest"
  }
}
```

## Environment variables

```bash
DATABASE_URL=

OPENAI_API_KEY=
ANTHROPIC_API_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GMAIL_DEMO_ACCOUNT=

ELEVENLABS_API_KEY=
LANGSMITH_API_KEY=
LANGSMITH_TRACING=false

NEXT_PUBLIC_APP_URL=
DEMO_SAFE_MODE=true
```

---

# 17. ElevenLabs role

Do **not** make ElevenLabs core. Use it only if you have spare time.

Best use:

```text
Voice debrief after calibration:
“Your tool-fatigued operator archetype changed. The system expected pricing objections,
but real replies showed setup-time anxiety. Cohort two now leads with low implementation.”
```

ElevenLabs can support voice-rich agents and text-to-speech streaming, but this is sparkle, not the product spine. ([ElevenLabs][17])

Optional UI moment:

```text
A “GTM Chief of Staff” voice narrates the calibration result.
```

Risk:

```text
voice latency / audio failure / noisy room
```

Fallback:

```text
pre-rendered audio clip
```

---

# 18. Kiro, Codex and Claude Code setup

Use Codex/Claude Code as primary builders. Add Kiro-compatible files for sponsor alignment.

## `AGENTS.md`

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
7. Gmail drafts/sends are created after human approval.
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
```

## `CLAUDE.md`

```md
Use the AGENTS.md instructions.

When building:
- Create UI first with seeded data.
- Then wire database.
- Then add AI calls.
- Then add Gmail.
- Always preserve demo safe mode.
- Avoid adding unnecessary integrations.
```

## Kiro files

Kiro’s docs describe specs as structured artifacts that turn high-level ideas into implementation plans, and steering files as persistent project context in `.kiro/steering/`; hooks can automate prompts or shell commands on file save, task execution and other IDE events. ([Kiro][18])

Create:

```text
.kiro/steering/product.md
.kiro/steering/tech.md
.kiro/steering/structure.md
.kiro/steering/ai-output-rules.md

.kiro/specs/crucible-mvp/requirements.md
.kiro/specs/crucible-mvp/design.md
.kiro/specs/crucible-mvp/tasks.md
```

The product can also export a Kiro-style spec for the **next outbound experiment**, but this is optional.

---

# 19. Quality requirements

## AI reliability

```text
All AI outputs must be schema-validated.
Retry malformed outputs once.
Fallback to cached demo output if second attempt fails.
Log prompt, model, schema, latency and validation result.
```

## Email quality rubric

Every email gets scored:

```text
Relevance: 0–10
Specificity: 0–10
Brevity: 0–10
CTA clarity: 0–10
Objection pre-emption: 0–10
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

## Calibration quality

Test:

```text
If actual objection differs from predicted objection, persona updates.
If no-reply only, calibration confidence remains low.
If unsubscribe, suppression list updates.
If wrong person, next cohort suggests alternate buyer.
```

## Demo reliability

Must pass:

```text
App loads with seeded data.
CSV upload works.
Persona library renders.
Email generation works or uses cache.
Gmail connect failure does not break demo.
Seeded replies can replay.
Calibration animation works.
Next cohort output appears.
```

---

# 20. Test plan

## Unit tests

```text
match-score.test.ts
reply-likelihood.test.ts
prediction-accuracy.test.ts
calibration-trigger.test.ts
mime-builder.test.ts
csv-parser.test.ts
suppression-list.test.ts
```

## Integration tests

```text
offer → archetypes
prospect CSV → matches
matches → preflight predictions
predictions → email drafts
reply → classification
classification → calibration
calibration → new archetype version
new version → next cohort email
```

## LLM eval fixtures

Use five demo offers:

```text
1. AI follow-up tool for agencies
2. AI intake assistant for law firms
3. AI meeting prep tool for recruiters
4. AI invoice chasing tool for freelancers
5. AI onboarding assistant for HR teams
```

For each, assert:

```text
8+ archetypes generated
no duplicate archetype names
at least 3 distinct objection types
emails under 120 words
all emails have hypotheses
reply parser returns valid taxonomy
calibration updates at least one archetype when mismatch is seeded
```

---

# 21. Roadmap

## MVP

```text
CSV leads
buyer archetypes
preflight prediction
hypothesis-driven emails
Gmail draft/send
reply parsing
calibration
next cohort
```

## V1

```text
Apollo/Clay import
Resend/Postmark integration
real campaign analytics
open/click tracking only where compliant
CRM sync
team review workflow
suppression management
deliverability warnings
```

## V2

```text
LinkedIn/manual task generation
buyer committee simulation for enterprise deals
investor pitch simulation
real customer-response calibration over weeks
workspace-level memory
agency multi-client mode
```

## V3

```text
automated experiment design
multi-armed bandit style angle allocation
domain-specific outbound playbooks
lead-source recommendation
market-specific persona libraries
```

Avoid calling it reinforcement learning unless you actually implement RL. Use:

```text
self-improving outbound memory
calibrated buyer archetypes
closed-loop outbound
```

---

# 22. Hour-by-hour build plan

## Hours 0–2: Scaffold and seeded UI

```text
Create Next.js app.
Add Tailwind/shadcn.
Create screens.
Add seeded demo data.
Render full flow with no backend.
```

## Hours 2–4: Data model

```text
Add Prisma.
Create schema.
Seed demo offer, personas, prospects, emails, replies.
Build repositories.
```

## Hours 4–7: AI schemas and generators

```text
Add Zod schemas.
Implement Hypothesis Agent.
Implement Persona Synthesizer.
Implement Prospect Matcher.
Implement Outreach Generator.
Use cached output fallback.
```

## Hours 7–10: Campaign workflow

```text
CSV upload.
Lead matching.
Preflight predictions.
Email generation.
Human approval UI.
```

## Hours 10–13: Gmail integration

```text
Google OAuth.
Create drafts.
Optional send controlled emails.
Poll Gmail replies.
Parse message text.
```

## Hours 13–16: Response parser and calibration

```text
Reply taxonomy.
Predicted-vs-actual matrix.
Calibration trigger.
Persona v1→v2 generation.
Version diff UI.
```

## Hours 16–19: Demo polish

```text
Framer Motion card flips.
Cohort before/after graph.
Replay seeded replies.
Demo safe mode toggle.
```

## Hours 19–22: Hardening

```text
Tests.
Fallbacks.
Cached outputs.
Error states.
Compliance warnings.
```

## Hours 22–24: Pitch and rehearsal

```text
3-minute script.
1-minute fallback script.
Gmail failure path.
AI failure path.
No-internet demo path.
```

---

# 23. Codex/Claude build prompts

## Prompt 1: scaffold

```text
Build a Next.js TypeScript app called Crucible.

Create a polished dashboard UI with these pages:
- Offer Intake
- Buyer Archetype Library
- Prospect Inbox
- Outbound Forge
- Campaign Monitor
- Calibration
- Next Cohort

Use seeded data first. Do not add AI calls yet.
Use Tailwind and clean reusable components.
Add a demo safe mode toggle.
```

## Prompt 2: database

```text
Add Prisma/Postgres schema for:
Workspace, GmailConnection, Offer, ExperimentHypothesis,
BuyerArchetype, BuyerArchetypeVersion, Prospect, ProspectMatch,
Campaign, CampaignCohort, OutboundEmail, EmailEvent,
ReplyAnalysis, CalibrationRun, PersonaUpdate, SuppressionEntry.

Add repositories and a seed script that creates the full demo flow.
```

## Prompt 3: structured AI

```text
Add Zod schemas and structured AI wrappers for:
OfferHypothesis, Archetype, ProspectMatch, PreflightPrediction,
OutboundEmailDraft, ReplyAnalysis, CalibrationUpdate, NextCohortPlan.

Use Vercel AI SDK structured output.
Every function must validate output and support cached fallback.
```

## Prompt 4: Gmail

```text
Implement Gmail OAuth and Gmail services:
- connect account
- create RFC 2822 MIME email
- base64URL encode
- create draft
- send approved email
- poll replies using Gmail messages.list and messages.get
- parse plain text reply

Keep Gmail optional. Demo Safe Mode must work without Gmail.
```

## Prompt 5: calibration UI

```text
Build the calibration experience:
- predicted-vs-actual matrix
- archetype card version diff
- v1 to v2 animation
- calibration summary
- next cohort email rewrite

Use seeded replies if Gmail has no replies.
```

---

# 24. Final build recommendation

Build **Crucible as a closed-loop outbound demo**, not a research simulator.

The best MVP is:

```text
8–12 archetypes
20–30 CSV leads
3 message angles
Gmail draft/send integration
seeded or controlled replies
one visible calibration event
one next-cohort rewrite
```

The winning product narrative:

> **Outbound tools personalize. Crucible learns. It predicts what a prospect will object to, sends a hypothesis-driven message, watches what actually happens, and updates the buyer model so the next campaign is smarter.**

[1]: https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send "Method: users.messages.send  |  Gmail  |  Google for Developers"
[2]: https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list "Method: users.messages.list  |  Gmail  |  Google for Developers"
[3]: https://www.clay.com/?utm_source=chatgpt.com "Clay | Go to market with unique data—and the ability to act on it"
[4]: https://github.com/microsoft/tinytroupe "GitHub - microsoft/TinyTroupe: LLM-powered multiagent persona simulation for imagination enhancement and business insights. · GitHub"
[5]: https://github.com/666ghj/MiroFish "GitHub - 666ghj/MiroFish: A Simple and Universal Swarm Intelligence Engine, Predicting Anything. 简洁通用的群体智能引擎，预测万物 · GitHub"
[6]: https://github.com/vercel-labs/auto-outbound "GitHub - vercel-labs/auto-outbound: AI generated emails, set up directly in Outreach for SDRs · GitHub"
[7]: https://github.com/MatthewDailey/open-sdr "GitHub - MatthewDailey/open-sdr: Automate research and outbound lead generation. · GitHub"
[8]: https://github.com/filip-michalsky/SalesGPT "GitHub - filip-michalsky/SalesGPT: Context-aware AI Sales Agent to automate sales outreach. · GitHub"
[9]: https://vercel.com/docs/ai-sdk?utm_source=chatgpt.com "AI SDK"
[10]: https://docs.langchain.com/oss/python/langgraph/workflows-agents?utm_source=chatgpt.com "Workflows and agents - Docs by LangChain"
[11]: https://code.claude.com/docs/en/overview?utm_source=chatgpt.com "Claude Code overview - Claude Code Docs"
[12]: https://developers.google.com/workspace/gmail/api/guides/drafts "Create and send draft emails  |  Gmail  |  Google for Developers"
[13]: https://developers.google.com/workspace/gmail/api/guides/push "Configure push notifications in Gmail API  |  Google for Developers"
[14]: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/ "Business-to-business marketing | ICO"
[15]: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business "CAN-SPAM Act: A Compliance Guide for Business | Federal Trade Commission"
[16]: https://knowledge.workspace.google.com/admin/gmail/gmail-sending-limits-in-google-workspace "Gmail sending limits in Google Workspace  |  Google Workspace Help"
[17]: https://elevenlabs.io/docs/eleven-agents/overview?utm_source=chatgpt.com "ElevenAgents | ElevenLabs Documentation"
[18]: https://kiro.dev/docs/specs/?utm_source=chatgpt.com "Specs - IDE - Docs"
[19]: https://gojiberry.ai/ "Gojiberry"
