export type PersonaStatus = "idle" | "thinking" | "typing" | "responding" | "complete";

export type PersonaTone = "warm" | "neutral" | "skeptical" | "negative";

export interface PersonaReaction {
  id: string;
  name: string;
  role: string;
  initials: string;
  accent: "amber" | "cyan" | "rose" | "mint" | "violet" | "slate";
  tone: PersonaTone;
  reaction: string;
  objection: string;
  liked: string;
  disliked: string;
  replyLikelihood: number;
  confidence: number;
  tags: string[];
  thinkingTrace: string[];
}

export interface ObjectionCluster {
  label: string;
  weight: number;
  example: string;
}

export interface RewriteBlock {
  text: string;
  highlight?: "improved" | "removed" | "kept";
  note?: string;
}

export interface SimulationSeed {
  personas: PersonaReaction[];
  objections: ObjectionCluster[];
  weaknesses: { label: string; severity: "low" | "med" | "high"; note: string }[];
  metrics: {
    overallReplyLikelihoodBefore: number;
    overallReplyLikelihoodAfter: number;
    confidenceBefore: number;
    confidenceAfter: number;
    objectionCoverageBefore: number;
    objectionCoverageAfter: number;
    ctaClarityBefore: number;
    ctaClarityAfter: number;
    rewriteDelta: number;
  };
  rewrite: {
    subjectBefore: string;
    subjectAfter: string;
    before: RewriteBlock[];
    after: RewriteBlock[];
    improvements: { label: string; detail: string }[];
  };
  exampleInputs: {
    productIdea: string;
    targetBuyer: string;
    coldEmail: string;
    desiredReply: string;
  };
}

export const exampleInputs = {
  productIdea:
    "Crucible is a self-improving outbound engine that simulates how real buyers will react to your cold emails before you send them, then rewrites the message until it actually lands.",
  targetBuyer:
    "Founders and growth leads at 5–50 person B2B SaaS companies running their own outbound.",
  coldEmail: `Subject: Quick question

Hi {first_name},

I noticed you're scaling {company} and wanted to reach out because we help companies like yours improve efficiency and drive better results with AI.

We've helped hundreds of founders 10x their pipeline by leveraging next-gen automation.

Would you be open to a quick 15-min call this week?

Best,
{your_name}`,
  desiredReply:
    "Yes, send me details — or — Happy to take a 15 min intro next week.",
};

export const simulationSeed: SimulationSeed = {
  personas: [
    {
      id: "agency-owner",
      name: "Anna Martinez",
      role: "Overworked Agency Owner",
      initials: "AM",
      accent: "amber",
      tone: "skeptical",
      reaction:
        "Smells like every other AI pitch. I'd skim the first line and archive it.",
      objection: "Too vague — 'improve efficiency' tells me nothing specific.",
      liked: "Short and respects my time.",
      disliked: "'AI' as a buzzword with no proof or specifics.",
      replyLikelihood: 12,
      confidence: 78,
      tags: ["No specificity", "Buzzword-fatigue"],
      thinkingTrace: [
        "Reading subject…",
        "Flagging vague benefit claim",
        "No proof, no story — archiving",
      ],
    },
    {
      id: "tool-fatigued",
      name: "Daniel Smith",
      role: "Tool-Fatigued Operator",
      initials: "DS",
      accent: "cyan",
      tone: "neutral",
      reaction:
        "Curious about what makes this different. Would skim once, but the body has nothing concrete.",
      objection:
        "I've heard '10x pipeline' from 40 vendors. Show me one specific outcome.",
      liked: "Direct ask at the end.",
      disliked: "'Hundreds of founders' is unverifiable filler.",
      replyLikelihood: 18,
      confidence: 71,
      tags: ["Unverifiable claim", "Wants proof"],
      thinkingTrace: [
        "Scanning for specifics…",
        "Generic claim detected",
        "Likely ignore",
      ],
    },
    {
      id: "growth-founder",
      name: "Sophia Chen",
      role: "Growth-Focused Founder",
      initials: "SC",
      accent: "mint",
      tone: "warm",
      reaction:
        "Would reply if it referenced something specific I'm doing this quarter.",
      objection: "No personalization tied to my company's actual situation.",
      liked: "The CTA is concrete — '15 min call this week.'",
      disliked: "Opening line could apply to literally any company.",
      replyLikelihood: 34,
      confidence: 82,
      tags: ["Wants relevance", "Open to call"],
      thinkingTrace: [
        "Scanning context…",
        "No reference to current quarter",
        "Reply only if intriguing follow-up",
      ],
    },
    {
      id: "skeptical-consultant",
      name: "Thomas Jones",
      role: "Skeptical Solo Consultant",
      initials: "TJ",
      accent: "rose",
      tone: "skeptical",
      reaction:
        "Reads like a copy-paste blast. I assume there are 200 others in the queue.",
      objection: "Where's the hypothesis about MY problem?",
      liked: "Nothing memorable.",
      disliked: "Generic flattery + buzzword soup.",
      replyLikelihood: 7,
      confidence: 88,
      tags: ["Mass-blast vibe", "Will not reply"],
      thinkingTrace: [
        "Detecting template patterns…",
        "Personalization score: low",
        "Marking as spam-adjacent",
      ],
    },
    {
      id: "trust-first",
      name: "Priya Raman",
      role: "Trust-First Buyer",
      initials: "PR",
      accent: "violet",
      tone: "neutral",
      reaction:
        "I might reply if there were a name I recognized or a credible signal in the email.",
      objection: "No social proof, no warm context, no shared connection.",
      liked: "Polite, brief, no pressure.",
      disliked: "Asks for 15 minutes from a complete stranger.",
      replyLikelihood: 22,
      confidence: 74,
      tags: ["Wants social proof", "Trust gap"],
      thinkingTrace: [
        "Looking for known names…",
        "No signal found",
        "Hold for now",
      ],
    },
    {
      id: "wrong-person",
      name: "Marcus Hale",
      role: "Wrong-Person Gatekeeper",
      initials: "MH",
      accent: "slate",
      tone: "negative",
      reaction:
        "Not my decision. I'd forward only if it were unusually compelling — this isn't.",
      objection:
        "You're emailing me but pitching something only the founder buys.",
      liked: "Short — won't waste my time deleting it.",
      disliked: "Misaligned to my role.",
      replyLikelihood: 4,
      confidence: 91,
      tags: ["Wrong ICP", "Will delete"],
      thinkingTrace: [
        "Checking role fit…",
        "Not a buyer — won't escalate",
        "Archiving",
      ],
    },
  ],
  objections: [
    {
      label: "Lacks specificity",
      weight: 78,
      example: "'Improve efficiency' / 'drive results' = says nothing.",
    },
    {
      label: "Unverifiable proof",
      weight: 64,
      example: "'Hundreds of founders 10x'd' with no name or number.",
    },
    {
      label: "No personalization",
      weight: 71,
      example: "Generic flattery applies to any 5–50 person SaaS.",
    },
    {
      label: "Trust / social proof gap",
      weight: 52,
      example: "No shared connection, customer name, or credible signal.",
    },
  ],
  weaknesses: [
    {
      label: "Weak proof",
      severity: "high",
      note: "'10x pipeline' triggers buzzword fatigue without an example.",
    },
    {
      label: "Unclear differentiation",
      severity: "med",
      note: "Doesn't say what makes Crucible different from 40 other AI tools.",
    },
    {
      label: "Soft personalization",
      severity: "high",
      note: "Opening line is template-shaped. Reads as a blast.",
    },
  ],
  metrics: {
    overallReplyLikelihoodBefore: 16,
    overallReplyLikelihoodAfter: 52,
    confidenceBefore: 38,
    confidenceAfter: 89,
    objectionCoverageBefore: 41,
    objectionCoverageAfter: 86,
    ctaClarityBefore: 32,
    ctaClarityAfter: 92,
    rewriteDelta: 53,
  },
  rewrite: {
    subjectBefore: "Quick question",
    subjectAfter:
      "Saw {company} hiring 3 SDRs — does the playbook keep up?",
    before: [
      { text: "Hi {first_name}," },
      {
        text:
          "I noticed you're scaling {company} and wanted to reach out because we help companies like yours improve efficiency and drive better results with AI.",
        highlight: "removed",
        note: "Generic, applies to anyone.",
      },
      {
        text:
          "We've helped hundreds of founders 10x their pipeline by leveraging next-gen automation.",
        highlight: "removed",
        note: "Unverifiable, buzzword-heavy.",
      },
      {
        text: "Would you be open to a quick 15-min call this week?",
        highlight: "kept",
        note: "Concrete CTA — kept, sharpened below.",
      },
      { text: "Best,\n{your_name}" },
    ],
    after: [
      { text: "Hi {first_name}," },
      {
        text:
          "Saw you posted 3 SDR roles in the last week — congrats on the momentum. Most outbound teams I work with end up rewriting the same 4 emails 11 times before one of them lands.",
        highlight: "improved",
        note: "Specific signal + a real pattern they'll recognize.",
      },
      {
        text:
          "We help {company} simulate how 6 buyer personas will actually react to a draft *before* you send it, so you stop guessing and start shipping the version that gets replies.",
        highlight: "improved",
        note: "Concrete mechanism instead of buzzwords.",
      },
      {
        text:
          "Happy to share a quick 90-second walk-through if it'd save your team a benchmark cycle this quarter — and if not, no follow-up.",
        highlight: "improved",
        note: "Sharpens the CTA, lowers the ask, gives them an out.",
      },
      { text: "Best,\n{your_name}" },
    ],
    improvements: [
      {
        label: "Personalization",
        detail: "Opens with a real signal (3 SDR hires) instead of generic flattery.",
      },
      {
        label: "Specific value",
        detail: "Replaces '10x pipeline' with the actual mechanism.",
      },
      {
        label: "Lower-friction CTA",
        detail: "90-second walk-through > '15 min call this week'.",
      },
      {
        label: "Trust signal",
        detail: "Volunteers a 'no follow-up' clause to defuse pressure.",
      },
    ],
  },
  exampleInputs,
};
