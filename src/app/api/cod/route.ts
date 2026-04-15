import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cod?username=PlayerName&platform=uno
 *
 * Fetches Call of Duty player stats via the unofficial Activision API.
 * Platforms: uno (Activision ID), battle (Battle.net), psn, xbl
 *
 * This uses the same internal API that tracker.gg and wzstats.gg use.
 * No official API exists — this is reverse-engineered and may break.
 */

const COD_API_BASE = "https://my.callofduty.com/api/papi-client";

interface CodProfile {
  username: string;
  platform: string;
  level: number;
  prestige: number;
  totalXp: number;
  lifetime: {
    kills: number;
    deaths: number;
    kdRatio: number;
    wins: number;
    losses: number;
    winLossRatio: number;
    gamesPlayed: number;
    timePlayed: number;
    headshots: number;
    bestKillStreak: number;
  };
  weekly: {
    kills: number;
    deaths: number;
    kdRatio: number;
    matchesPlayed: number;
  } | null;
}

async function getSSOToken(): Promise<string | null> {
  /* In production, you'd authenticate with Activision credentials
     and cache the ACT_SSO_COOKIE. For now, we use an env variable
     that can be obtained manually from a logged-in session. */
  return process.env.COD_SSO_TOKEN || null;
}

async function fetchCodStats(
  username: string,
  platform: string
): Promise<CodProfile | null> {
  const ssoToken = await getSSOToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0",
  };

  if (ssoToken) {
    headers["Cookie"] = `ACT_SSO_COOKIE=${ssoToken}`;
  }

  const encodedUsername = encodeURIComponent(username);

  try {
    /* Try Warzone stats first */
    const wzRes = await fetch(
      `${COD_API_BASE}/stats/cod/v1/title/mw/platform/${platform}/gamer/${encodedUsername}/profile/type/wz`,
      { headers, next: { revalidate: 300 } } // cache 5 min
    );

    if (wzRes.ok) {
      const wzData = await wzRes.json();
      const lt = wzData?.data?.lifetime?.all?.properties;
      const weekly = wzData?.data?.weekly?.all?.properties;

      if (lt) {
        return {
          username,
          platform,
          level: wzData?.data?.level || 0,
          prestige: wzData?.data?.prestige || 0,
          totalXp: wzData?.data?.totalXp || 0,
          lifetime: {
            kills: lt.kills || 0,
            deaths: lt.deaths || 0,
            kdRatio: lt.kdRatio || 0,
            wins: lt.wins || 0,
            losses: lt.losses || 0,
            winLossRatio: lt.wlRatio || 0,
            gamesPlayed: lt.gamesPlayed || 0,
            timePlayed: lt.timePlayedTotal || 0,
            headshots: lt.headshots || 0,
            bestKillStreak: lt.bestKillStreak || 0,
          },
          weekly: weekly
            ? {
                kills: weekly.kills || 0,
                deaths: weekly.deaths || 0,
                kdRatio: weekly.kdRatio || 0,
                matchesPlayed: weekly.matchesPlayed || 0,
              }
            : null,
        };
      }
    }

    /* Fallback: try multiplayer stats */
    const mpRes = await fetch(
      `${COD_API_BASE}/stats/cod/v1/title/mw/platform/${platform}/gamer/${encodedUsername}/profile/type/mp`,
      { headers, next: { revalidate: 300 } }
    );

    if (mpRes.ok) {
      const mpData = await mpRes.json();
      const lt = mpData?.data?.lifetime?.all?.properties;

      if (lt) {
        return {
          username,
          platform,
          level: mpData?.data?.level || 0,
          prestige: mpData?.data?.prestige || 0,
          totalXp: mpData?.data?.totalXp || 0,
          lifetime: {
            kills: lt.kills || 0,
            deaths: lt.deaths || 0,
            kdRatio: lt.kdRatio || 0,
            wins: lt.wins || 0,
            losses: lt.losses || 0,
            winLossRatio: lt.wlRatio || 0,
            gamesPlayed: lt.gamesPlayed || 0,
            timePlayed: lt.timePlayedTotal || 0,
            headshots: lt.headshots || 0,
            bestKillStreak: lt.bestKillStreak || 0,
          },
          weekly: null,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const platform = searchParams.get("platform") || "uno";

  if (!username) {
    return NextResponse.json(
      { error: "Se requiere el parametro 'username'." },
      { status: 400 }
    );
  }

  const validPlatforms = ["uno", "battle", "psn", "xbl"];
  if (!validPlatforms.includes(platform)) {
    return NextResponse.json(
      { error: `Plataforma invalida. Opciones: ${validPlatforms.join(", ")}` },
      { status: 400 }
    );
  }

  const stats = await fetchCodStats(username, platform);

  if (!stats) {
    return NextResponse.json(
      {
        error: "No se encontraron estadisticas para este jugador.",
        hint: "Verifica que el nombre de usuario y la plataforma sean correctos. El formato de Activision ID es: NombreDeUsuario#1234567",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: stats });
}
