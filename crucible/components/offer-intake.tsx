"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import { DEMO_OFFER_ID, offer as seedOffer } from "./seed/data";

const TONES = ["concise", "founder-led", "warm", "direct", "technical"] as const;

export function OfferIntake() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    selling: seedOffer.productSummary,
    buyer: seedOffer.likelyBuyer,
    pain: seedOffer.painClaim,
    proof: seedOffer.proofPoint,
    cta: seedOffer.desiredCta,
    tone: seedOffer.tone as (typeof TONES)[number],
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function loadSeed() {
    setForm({
      selling: seedOffer.productSummary,
      buyer: seedOffer.likelyBuyer,
      pain: seedOffer.painClaim,
      proof: seedOffer.proofPoint,
      cta: seedOffer.desiredCta,
      tone: seedOffer.tone,
    });
  }

  function buildBuyerMemory() {
    setSubmitting(true);
    // Simulated build pause - the real call would hit the API workstream's route.
    setTimeout(() => {
      router.push(`/runs/${DEMO_OFFER_ID}/library`);
    }, 750);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <section className="surface p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="label">Step 1 of 7</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Offer intake</h1>
            <p className="mt-2 max-w-xl text-sm text-white/60">
              We turn your offer into a buyer memory: archetypes, likely objections, and angles to test. No
              cold templates. Every email will carry an explicit hypothesis.
            </p>
          </div>
          <button onClick={loadSeed} className="btn-ghost shrink-0" title="Load the demo offer">
            <Wand2 className="h-4 w-4" /> Load demo
          </button>
        </div>

        <div className="mt-8 space-y-5">
          <Field
            label="What are you selling?"
            hint="One paragraph. Be specific about what the product does."
          >
            <textarea
              className="field min-h-[96px] resize-y"
              value={form.selling}
              onChange={(e) => update("selling", e.target.value)}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Who do you think buys it?" hint="Best ICP guess.">
              <input className="field" value={form.buyer} onChange={(e) => update("buyer", e.target.value)} />
            </Field>
            <Field label="Desired CTA" hint="What action should the prospect take?">
              <input className="field" value={form.cta} onChange={(e) => update("cta", e.target.value)} />
            </Field>
          </div>
          <Field label="What pain do you solve?">
            <textarea
              className="field min-h-[72px] resize-y"
              value={form.pain}
              onChange={(e) => update("pain", e.target.value)}
            />
          </Field>
          <Field label="What proof do you have?" hint="Customer outcome, pilot result, or honest 'none yet'.">
            <textarea
              className="field min-h-[72px] resize-y"
              value={form.proof}
              onChange={(e) => update("proof", e.target.value)}
            />
          </Field>
          <Field label="Tone">
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => update("tone", t)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition ${
                    form.tone === t
                      ? "border-ember-400/60 bg-ember-500/15 text-ember-400"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/40">
            Demo Safe Mode is on by default. No Gmail, no live AI, no real sends.
          </p>
          <button
            onClick={buildBuyerMemory}
            disabled={submitting}
            className="btn-primary w-full sm:w-auto"
          >
            {submitting ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                Building buyer memory...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Build buyer memory
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="surface-raised p-5">
          <div className="label">What you'll get</div>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-plasma-400" />
              <span>An offer hypothesis with risky assumptions surfaced.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-plasma-400" />
              <span>Signal Radar ranks leads before Buyer Memory predicts objections.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-plasma-400" />
              <span>A loop that updates the archetypes after replies arrive.</span>
            </li>
          </ul>
        </div>
        <div className="surface p-5">
          <div className="label">Demo path</div>
          <ol className="mt-3 space-y-1 text-sm text-white/70">
            <li>1. Build buyer memory</li>
            <li>2. Rank signals</li>
            <li>3. Build buyer memory</li>
            <li>4. Forge signal-aware emails</li>
            <li>4. Replay replies</li>
            <li>5. Learn from replies</li>
            <li>6. Generate next signal cohort</li>
          </ol>
        </div>
        <div className="surface p-5">
          <div className="label">Honesty notes</div>
          <ul className="mt-3 space-y-2 text-xs text-white/50">
            <li>- Predictions are model output, not market proof.</li>
            <li>- Replies in this demo are seeded, not from real recipients.</li>
            <li>- No email is sent without your explicit approval.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium text-white/85">{label}</span>
        {hint ? <span className="text-[11px] text-white/40">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}
