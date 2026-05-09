import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GmailConnectCard } from "@/components/gmail-connect-card";
import { DEMO_OFFER_ID } from "@/components/seed/data";

type GmailSettingsPageProps = {
  searchParams: Promise<{
    gmail_status?: string;
    gmail_detail?: string;
  }>;
};

export default async function GmailSettingsPage({
  searchParams,
}: GmailSettingsPageProps) {
  const params = await searchParams;
  const status = params.gmail_status;
  const detail = params.gmail_detail;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href={`/runs/${DEMO_OFFER_ID}/forge`}
        className="inline-flex items-center gap-2 text-sm text-white/55 underline-offset-4 hover:text-white/80 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Signal Forge
      </Link>

      {status ? (
        <section className="surface border-l-4 border-ember-400/60 p-4 text-sm text-white/75">
          <div className="font-medium text-white/90">
            Gmail OAuth status: {status.replace(/_/g, " ")}
          </div>
          {detail ? <p className="mt-1 text-white/55">{detail}</p> : null}
        </section>
      ) : null}

      <GmailConnectCard />
    </div>
  );
}
