"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, AlertTriangle, CheckCircle2, FileText, Mail, Send } from "lucide-react";
import { archetypes, outboundEmails, prospects } from "./seed/data";
import { HypothesisPill } from "./hypothesis-pill";
import { GmailConnectCard } from "./gmail-connect-card";

type GmailStatus = {
  configured: boolean;
  connected: boolean;
  safeMode: boolean;
  allowlistSize: number;
  allowlist?: string[];
  emailAddress?: string;
  canSend: boolean;
};

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function OutboundForge({ offerId }: { offerId: string }) {
  const [emails, setEmails] = useState(outboundEmails);
  const [testRecipients, setTestRecipients] = useState("");
  const [gmailBusy, setGmailBusy] = useState<
    "draft" | "send" | "reply" | null
  >(null);
  const [gmailMessage, setGmailMessage] = useState<string | null>(null);
  const [sentEmailIds, setSentEmailIds] = useState<string[]>([]);
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);

  const byProspect = useMemo(() => {
    const map = new Map(prospects.map((p) => [p.id, p]));
    return map;
  }, []);
  const byArchetype = useMemo(() => {
    const map = new Map(archetypes.map((a) => [a.id, a]));
    return map;
  }, []);

  const approvedCount = emails.filter((e) => e.approved).length;
  const approvedEmails = emails.filter((e) => e.approved);

  useEffect(() => {
    let cancelled = false;
    async function loadGmailStatus() {
      try {
        const res = await fetch("/api/gmail/status", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json.ok) {
          const status = json.data as GmailStatus;
          setGmailStatus(status);
          if (!testRecipients.trim() && status.allowlist?.length) {
            setTestRecipients(status.allowlist.join(", "));
          }
        }
      } catch {
        // Gmail is optional; the connect card will show detailed failures.
      }
    }
    void loadGmailStatus();
    return () => {
      cancelled = true;
    };
  }, [testRecipients]);

  function toggleApprove(id: string) {
    setEmails((all) =>
      all.map((e) =>
        e.id === id
          ? {
              ...e,
              approved: !e.approved,
              status: !e.approved ? "approved" : "draft",
            }
          : e,
      ),
    );
  }

  async function createGmailDrafts() {
    if (approvedEmails.length === 0) {
      setGmailMessage("Approve one generated email first.");
      return;
    }
    const recipients = parseRecipientList(testRecipients);
    if (recipients.length === 0) {
      setGmailMessage("Add at least one controlled test recipient or plus alias.");
      return;
    }

    setGmailBusy("draft");
    setGmailMessage(null);
    try {
      const res = await fetch("/api/gmail/create-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: approvedEmails.map((email, index) =>
            toApprovedEmail(email, pickRecipient(recipients, index)),
          ),
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.error?.message ?? "Draft creation failed.");
      }
      const failed = json.data?.failed?.[0];
      if (failed) {
        throw new Error(`${failed.reason}: ${failed.message}`);
      }
      setEmails((all) =>
        all.map((email) =>
          approvedEmails.some((approved) => approved.id === email.id)
            ? { ...email, status: "drafted_in_gmail" }
            : email,
        ),
      );
      setGmailMessage(
        `Created ${json.data?.created?.length ?? 0} Gmail drafts for controlled test recipients.`,
      );
    } catch (err) {
      setGmailMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setGmailBusy(null);
    }
  }

  async function sendApprovedTestCohort() {
    if (approvedEmails.length === 0) {
      setGmailMessage("Approve one generated email first.");
      return;
    }
    const recipients = parseRecipientList(testRecipients);
    if (recipients.length === 0) {
      setGmailMessage("Add at least one controlled test recipient or plus alias.");
      return;
    }

    setGmailBusy("send");
    setGmailMessage(null);
    const sentIds: string[] = [];
    const failures: string[] = [];
    try {
      for (let index = 0; index < approvedEmails.length; index += 1) {
        const email = approvedEmails[index]!;
        const res = await fetch("/api/gmail/send-approved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: toApprovedEmail(email, pickRecipient(recipients, index)),
          }),
        });
        const json = await res.json();
        if (json.ok) sentIds.push(email.id);
        else failures.push(`${email.id}: ${json.error?.message ?? "Send failed."}`);
      }
      setEmails((all) =>
        all.map((email) =>
          sentIds.includes(email.id) ? { ...email, status: "sent" } : email,
        ),
      );
      setSentEmailIds(sentIds);
      setGmailMessage(
        failures.length === 0
          ? `Sent ${sentIds.length} approved test emails.`
          : `Sent ${sentIds.length}; blocked/failed ${failures.length}. ${failures[0]}`,
      );
    } catch (err) {
      setGmailMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setGmailBusy(null);
    }
  }

  async function triggerTestReplies() {
    const recipients = parseRecipientList(testRecipients);
    setGmailBusy("reply");
    setGmailMessage(null);
    try {
      const res = await fetch("/api/gmail/trigger-test-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients,
          sentEmailIds,
          scenario: "alias-personas",
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.error?.message ?? "Reply simulator trigger failed.");
      }
      const warnings = json.data?.warnings ?? [];
      setGmailMessage(
        warnings[0] ??
          `Triggered reply simulator; reported ${json.data?.replied ?? 0} replies.`,
      );
    } catch (err) {
      setGmailMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setGmailBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="label">Signal-to-Message Forge - cohort 1</div>
          <h2 className="mt-1 text-lg font-semibold">
            {emails.length} signal-aware drafts - {approvedCount} approved
          </h2>
          <p className="mt-1 text-sm text-white/55">
            Every email tests an explicit hypothesis. Nothing sends until you approve. Gmail draft creation
            is opt-in.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a href="#gmail-live-controls" className="btn-secondary">
            <FileText className="h-4 w-4" /> Live Gmail proof
          </a>
          <Link href={`/runs/${offerId}/monitor`} className="btn-primary">
            Open monitor <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <section
        id="gmail-live-controls"
        className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <GmailConnectCard />
        <div className="surface p-5">
          <div className="label">Controlled Gmail live mode</div>
          <h3 className="mt-1 text-base font-semibold text-white/90">
            Send the approved mini-cohort to your receiver aliases
          </h3>
          <p className="mt-2 text-sm text-white/55">
            This uses only the {approvedEmails.length} approved drafts below and
            cycles across the allowlisted test recipients.
          </p>
          <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
            <LivePill
              label="Gmail"
              value={gmailStatus?.connected ? "connected" : "not connected"}
              ok={Boolean(gmailStatus?.connected)}
            />
            <LivePill
              label="Safe mode"
              value={gmailStatus?.safeMode ? "send blocked" : "live send on"}
              ok={!gmailStatus?.safeMode}
            />
            <LivePill
              label="Recipients"
              value={`${parseRecipientList(testRecipients).length} loaded`}
              ok={parseRecipientList(testRecipients).length > 0}
            />
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <input
              type="text"
              value={testRecipients}
              onChange={(event) => setTestRecipients(event.target.value)}
              placeholder="Allowlisted receiver aliases auto-fill here"
              className="min-w-0 rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-ember-400/60"
            />
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={() => void createGmailDrafts()}
                disabled={gmailBusy !== null || approvedEmails.length === 0}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-45"
              >
                <FileText className="h-4 w-4" />
                {gmailBusy === "draft" ? "Creating..." : "Create Gmail drafts"}
              </button>
              <button
                type="button"
                onClick={() => void sendApprovedTestCohort()}
                disabled={gmailBusy !== null || approvedEmails.length === 0}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Send className="h-4 w-4" />
                {gmailBusy === "send" ? "Sending..." : "Send approved test cohort"}
              </button>
              <button
                type="button"
                onClick={() => void triggerTestReplies()}
                disabled={gmailBusy !== null}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Mail className="h-4 w-4" />
                {gmailBusy === "reply" ? "Triggering..." : "Trigger test replies"}
              </button>
              <Link href={`/runs/${offerId}/monitor`} className="btn-secondary">
                <Mail className="h-4 w-4" /> Poll Gmail replies
              </Link>
            </div>
          </div>
          {approvedEmails.length > 0 ? (
            <p className="mt-3 text-xs text-white/45">
              Drafts can be created in safe mode. Sending requires safe mode off,
              Gmail connected, and recipients in the allowlist.
            </p>
          ) : (
            <p className="mt-3 text-xs text-signal-amber">
              Approve one email below before using Gmail live mode.
            </p>
          )}
          {gmailMessage ? (
            <p className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
              {gmailMessage}
            </p>
          ) : null}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {emails.map((e) => {
          const prospect = byProspect.get(e.prospectId);
          const archetype = byArchetype.get(e.archetypeId);
          const wc = wordCount(e.body);
          const wcOk = wc <= 120;
          return (
            <article
              key={e.id}
              className={`surface flex flex-col gap-4 p-5 transition ${
                e.approved ? "ring-1 ring-signal-green/30" : ""
              }`}
            >
              <header className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/40">
                    To - {prospect?.firstName} {prospect?.lastName} - {prospect?.company}
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/40">{prospect?.email}</div>
                </div>
                <span className={`chip ${e.approved ? "chip-good" : ""}`}>
                  {e.approved ? "Approved" : "Draft"}
                </span>
              </header>

              <HypothesisPill>{e.hypothesis}</HypothesisPill>

              <div>
                <div className="label">Subject</div>
                <div className="mt-1 font-mono text-sm text-white/90">{e.subject}</div>
              </div>

              <div>
                <div className="label">Body</div>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-white/85">{e.body}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4 text-xs sm:grid-cols-4">
                <Stat label="Reply likelihood" value={`${Math.round(e.predictedReplyLikelihood * 100)}%`} />
                <Stat label="CTA quality" value={`${e.ctaQuality}/10`} />
                <Stat
                  label="Word count"
                  value={`${wc}/120`}
                  tone={wcOk ? "chip-good" : "chip-bad"}
                />
                <Stat label="Archetype" value={archetype?.name ?? "—"} />
              </div>

              <div className="text-xs">
                <span className="text-white/40">Predicted objection: </span>
                <span className="text-white/85">{e.predictedObjection}</span>
              </div>

              {e.complianceWarnings.length > 0 ? (
                <div className="rounded-lg border border-signal-amber/30 bg-signal-amber/10 px-3 py-2 text-xs text-signal-amber">
                  <AlertTriangle className="mr-1 inline h-3 w-3" />
                  {e.complianceWarnings.join(" - ")}
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                <label className="flex items-center gap-2 text-sm text-white/85">
                  <input
                    type="checkbox"
                    checked={e.approved}
                    onChange={() => toggleApprove(e.id)}
                    className="h-4 w-4 rounded border-white/20 bg-ink-900 text-ember-500 focus:ring-ember-400"
                  />
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`h-3.5 w-3.5 ${e.approved ? "text-signal-green" : "text-white/30"}`}
                    />
                    Human approval
                  </span>
                </label>
                <span className="inline-flex items-center gap-1 text-[11px] text-white/40">
                  <Mail className="h-3 w-3" /> {e.status.replace(/_/g, " ")}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function LivePill({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-white/40">{label}</div>
      <div className={ok ? "text-signal-green" : "text-signal-amber"}>
        {value}
      </div>
    </div>
  );
}

function parseRecipientList(value: string): string[] {
  return value
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

function pickRecipient(recipients: string[], index: number): string {
  return recipients[index % recipients.length]!;
}

function toApprovedEmail(
  email: (typeof outboundEmails)[number],
  recipient: string,
) {
  const prospect = prospects.find((p) => p.id === email.prospectId);
  return {
    emailId: email.id,
    to: {
      email: recipient,
      name: prospect ? `${prospect.firstName} ${prospect.lastName}` : undefined,
    },
    subject: email.subject,
    body: email.body,
    approved: email.approved,
  };
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      {tone ? (
        <div className={`mt-1 ${tone}`}>{value}</div>
      ) : (
        <div className="mt-0.5 text-sm font-medium text-white/85">{value}</div>
      )}
    </div>
  );
}
