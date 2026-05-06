import { PSR_MODEL_VERSION } from "@/lib/scoring";
import { getPsrRankingSnapshot } from "@/lib/ranking/psr-service";
import RankingClient from "./ranking-client";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const snapshot = await getPsrRankingSnapshot();

  return (
    <RankingClient
      initialPlayers={snapshot.rankings}
      initialStats={snapshot.stats}
      loadError={snapshot.loadError}
      scoringPhase={PSR_MODEL_VERSION}
    />
  );
}
