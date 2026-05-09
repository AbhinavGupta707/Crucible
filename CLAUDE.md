Use AGENTS.md and IMPLEMENTATION_PLAN.md as the source of truth.

When building:
- Create UI first with seeded data.
- Then wire database.
- Then add AI calls.
- Then add Gmail.
- Always preserve demo safe mode.
- Avoid unnecessary integrations.
- Respect workstream file ownership.
- Keep routes Vercel-safe: no single endpoint should run the whole loop.
- Keep Gmail optional and draft-first.
- Keep USE_CACHED_AI=true until the safe-mode demo is polished.
- Treat the signal-led pivot in IMPLEMENTATION_PLAN.md as source of truth.
- Add Signal Radar before Buyer Memory.
- Use seeded/imported CSV signals only; do not add live scraping or Apollo/Clay/LinkedIn integrations.
- Calibration must update Signal Memory, Buyer Memory, and Message Memory.
