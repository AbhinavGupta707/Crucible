"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSimulationIntake,
  IntakeValues,
} from "@/components/message-simulation-intake";
import { SimulationLab } from "@/components/simulation-lab";
import { OutreachRewritePreview } from "@/components/outreach-rewrite-preview";
import {
  SimulationProgressRail,
  SimStage,
} from "@/components/simulation-progress-rail";
import { usePageTransition } from "@/components/page-transition-provider";

const EMPTY: IntakeValues = {
  productIdea: "",
  targetBuyer: "",
  coldEmail: "",
  desiredReply: "",
};

export default function Home() {
  const { go } = usePageTransition();
  const [stage, setStage] = useState<SimStage>("intake");
  const [intake, setIntake] = useState<IntakeValues>(EMPTY);

  const onRun = (values: IntakeValues) => {
    setIntake(values);
    setStage("simulating");
  };

  const onSimComplete = () => setStage("rewrite");
  const onAbort = () => setStage("intake");
  const onRunAgain = () => setStage("simulating");
  const onContinue = () => go("/runs/demo-offer/prospects", "Opening Signal Radar");

  return (
    <main className="min-h-screen w-full">
      <TopNav />
      <div className="px-6 pt-6 sm:px-10 lg:px-14">
        <SimulationProgressRail stage={stage} />
      </div>

      <AnimatePresence mode="wait">
        {stage === "intake" ? (
          <motion.div
            key="intake"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MessageSimulationIntake
              initial={intake.productIdea ? intake : undefined}
              onRun={onRun}
            />
          </motion.div>
        ) : null}

        {stage === "simulating" ? (
          <motion.div
            key="sim"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <SimulationLab
              coldEmail={intake.coldEmail}
              productIdea={intake.productIdea}
              targetBuyer={intake.targetBuyer}
              onComplete={onSimComplete}
              onAbort={onAbort}
            />
          </motion.div>
        ) : null}

        {stage === "rewrite" ? (
          <motion.div
            key="rewrite"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <OutreachRewritePreview
              onRunAgain={onRunAgain}
              onContinue={onContinue}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function TopNav() {
  return (
    <header className="w-full px-6 pt-6 sm:px-10 lg:px-14">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="amber-glow flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 text-[10px] font-bold text-black/80">
            C
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Crucible</div>
            <div className="text-dim text-[10px] uppercase tracking-widest">
              Self-improving outbound
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <span className="chip">Hypothesis-first</span>
          <span className="chip chip-cyan">
            <span className="pulse-dot pulse-dot--cyan" /> Controlled proof
          </span>
        </div>
      </div>
    </header>
  );
}
