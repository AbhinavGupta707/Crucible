# Crucible Agent Instructions

Crucible is a signal-led, self-improving outbound engine for founders.

Core flow:
1. Founder enters offer.
2. Signal-enriched CSV leads are uploaded.
3. Signal Radar ranks leads and explains why now.
4. System generates Buyer Memory archetypes.
5. Leads are matched to archetypes.
6. System predicts likely reactions using signal + archetype.
7. Signal-aware emails are generated with explicit hypotheses.
8. Gmail drafts/sends are created only after human approval.
9. Replies are parsed.
10. Predicted-vs-actual results calibrate Signal Memory, Buyer Memory, and Message Memory.
11. Next Signal Cohort leads and emails are reprioritised and rewritten.

Non-negotiables:
- Use TypeScript.
- Use Zod schemas for every AI output.
- Never claim synthetic predictions are real market proof.
- Do not auto-send without approval.
- Do not generate deceptive subject lines.
- Every email must have a hypothesis.
- Every priority lead must explain "why this lead, why now."
- Every outbound email must reference the lead signal naturally when a signal exists.
- Every calibration must show predicted vs actual.
- Calibration must update Signal Memory, Buyer Memory, and Message Memory.
- Demo Safe Mode must work without Gmail.
- Live LLM failure must fall back to cached output.
- Long workflows must be split into user-triggered steps.
- Vercel deployment must not require background workers.
- Do not build live Apollo, Clay, LinkedIn, or scraping integrations for MVP.
