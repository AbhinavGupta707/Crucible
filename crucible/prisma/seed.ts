import { prisma } from "../lib/db/prisma";
import { seedDemoWorkspace } from "../lib/demo/seed";

async function main() {
  console.log("Seeding Crucible demo workspace...");
  const result = await seedDemoWorkspace();
  console.log(
    `  workspace=${result.workspaceId}\n` +
      `  offer=${result.offerId}\n` +
      `  campaign=${result.campaignId}\n` +
      `  cohort=${result.cohortId}\n` +
      `  archetypes=${Object.keys(result.archetypeIds).length}\n` +
      `  prospects=${result.prospectCount}\n` +
      `  emails=${result.emailCount}\n` +
      `  replies=${result.replyCount}`,
  );
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
