# Crucible

Signal-led outbound that learns.

Crucible is a founder-led GTM demo that turns a rough startup idea and cold email into a living outbound system. It simulates market reactions, rewrites the message, ranks leads by buying signals, sends controlled Gmail outreach, watches replies come back, and updates memory for the next cohort.

The core idea is simple:

```text
Who should we contact?
Why now?
What should we say?
What happened?
What did the market teach us?
Who should we contact next?
```

Crucible makes that loop visible.

## What It Does

Crucible is built around a magical but controlled demo flow:

1. A founder enters a product idea, target buyer, desired reply, and current cold email.
2. A live Simulation Lab shows buyer personas reacting to the message in real time.
3. Crucible identifies objections, weak phrasing, missing proof, and likely reply patterns.
4. The system rewrites the outbound message into a sharper, signal-aware template.
5. Signal Radar ranks leads using ICP fit, signal strength, freshness, archetype match, and message confidence.
6. Signal Forge generates approved outreach with explicit hypotheses.
7. Gmail can create drafts, send a controlled test cohort, trigger receiver-side test replies, and poll real replies.
8. The Learning Loop compares predictions against replies and updates signal, buyer, and message memory.
9. Next Signal Cohort reprioritises who to contact next and rewrites copy using what was learned.

## Why It Feels Different

Most outbound tools stop at writing emails. Crucible behaves more like a learning GTM cockpit.

It does not just ask "can we generate copy?" It asks:

- Which signal makes this lead worth contacting now?
- Which buyer belief are we testing?
- Which objection did we predict?
- Did the reply prove us right or wrong?
- Should we change who we target next?
- Should the message memory evolve?

That creates the demo climax: outbound is no longer a one-shot send. It becomes a self-improving system.

## Product Flow

```text
Idea + cold email
  -> Market Simulation Lab
  -> Refined outreach template
  -> Signal Radar
  -> Buyer Memory
  -> Signal-to-Message Forge
  -> Gmail drafts or controlled live sends
  -> Reply Monitor
  -> Learning Loop
  -> Next Signal Cohort
```

## Key Features

- Simulation Lab: interactive buyer/persona reactions to a founder's cold email.
- Signal Radar: ranks leads by signal type, freshness, ICP fit, intent, and priority.
- Buyer Memory: predicts objections, preferred angles, and confidence by archetype.
- Signal Forge: generates hypothesis-driven outbound with approval controls.
- Gmail Live Proof: controlled draft, send, auto-reply, and poll flow using test accounts.
- Reply Monitor: parses real Gmail replies and classifies sentiment, outcome, and objections.
- Learning Loop: updates Signal Memory, Buyer Memory, and Message Memory after replies.
- Next Cohort: shows how the system changes targeting and copy after learning.
- Demo Safe Mode: deterministic seeded flow keeps the hackathon demo reliable.

## Live Vs Deterministic

Crucible intentionally separates live proof from reliable demo theatre.

Live pieces:

- Gmail OAuth connection.
- Gmail draft creation.
- Gmail send to allowlisted test recipients.
- Apps Script receiver auto-replies.
- Gmail reply polling.

Deterministic pieces:

- Simulation Lab personas.
- Signal Radar scoring.
- Seeded lead and signal data.
- Cached AI-style outputs.
- Learning Loop calibration.
- Next Signal Cohort recommendations.

This gives the best of both worlds: a live integration judges can believe, and a polished end-to-end story that does not collapse if a provider is slow.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Prisma schema and repository layer
- Gmail API
- Google Apps Script for controlled reply simulation
- Vitest
- Cached AI workflows with provider adapters

## Local Setup

The app lives in `crucible/`.

```powershell
cd crucible
npm install
npm.cmd run dev
```

Open:

```text
http://localhost:3000
```

Useful checks:

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

## Environment Variables

Create `crucible/.env.local`. Do not commit this file.

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/callback

GMAIL_CONTROLLED_RECIPIENTS=receiver+agencyowner@gmail.com,receiver+operator@gmail.com
GMAIL_REPLY_SIMULATOR_URL=
GMAIL_REPLY_SIMULATOR_SECRET=

USE_CACHED_AI=true
DEMO_SAFE_MODE=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For a live Gmail send test:

```env
DEMO_SAFE_MODE=false
```

`DEMO_SAFE_MODE=true` blocks real sends. Draft creation can still work.

## Controlled Gmail Demo

The Gmail live proof is designed to be safe:

- Sender account connects through Gmail OAuth.
- Emails only send after human approval.
- Sends are blocked unless `DEMO_SAFE_MODE=false`.
- Sends are restricted to `GMAIL_CONTROLLED_RECIPIENTS`.
- Receiver replies are generated by a private Apps Script test harness.

Minimum live sequence:

1. Connect Gmail from the app.
2. Open Signal Forge.
3. Confirm approved drafts and allowlisted recipients.
4. Click `Create Gmail drafts`.
5. Set `DEMO_SAFE_MODE=false` and restart the dev server.
6. Click `Send approved test cohort`.
7. Click `Trigger test replies`.
8. Open Monitor.
9. Click `Poll Gmail replies`.
10. Continue to Learning Loop.

## Demo Walkthrough

The recommended judge-facing demo is:

1. Start on the home page and enter a startup idea plus current cold email.
2. Run the Simulation Lab and let the persona cards react live.
3. Show the before/after rewrite and explain the message got sharper before a single send.
4. Continue to Signal Radar and show why certain leads matter now.
5. Open Signal Forge and show the explicit hypotheses behind each email.
6. Create Gmail drafts or run the controlled live send.
7. Trigger receiver-side replies and poll Gmail.
8. Show Reply Monitor parsing objections and outcomes.
9. Click Replay Seeded Replies if needed to guarantee the learning-loop climax.
10. Run Learning Loop and show Signal Memory, Buyer Memory, and Message Memory updating.
11. End on Next Signal Cohort: the system now knows who to target next and what to say differently.

Closing line:

```text
Crucible does not just write outbound. It remembers what the market taught you and uses that memory in the next send.
```

## Repository Structure

```text
crucible/
  app/              Next.js routes and API endpoints
  components/       UI screens and demo components
  lib/              AI, Gmail, scoring, API, and DB logic
  prisma/           Prisma schema and seed script
  tests/            Unit and integration tests
```

## Status

This is a hackathon MVP. It is designed to demonstrate full product functionality with a safe deterministic core and a controlled live Gmail proof. It is not intended for unrestricted cold sending.

