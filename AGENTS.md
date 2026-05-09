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
- Long workflows must be split into user-triggered steps.
- Vercel deployment must not require background workers.

