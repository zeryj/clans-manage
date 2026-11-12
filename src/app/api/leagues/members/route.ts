import { readFile } from "node:fs/promises";
import path from "node:path";
import axios from "axios";
import type {
  APIClanMember,
  LegendLeaderboardMember,
  LocalDataJson,
  PlayerLegendSeasonResponse,
} from "@/lib/type";
import { cocClient } from "@/service/axios";
import { formatTag } from "@/service/endpoints";

const DATA_PATH = path.join(process.cwd(), "src", "lib", "data.json");

interface LeaderboardCache {
  timestamp: number;
  members: LegendLeaderboardMember[];
}

let leaderboardCache: LeaderboardCache | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

async function readData(): Promise<LocalDataJson> {
  const file = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(file);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const withStats = searchParams.get("stats") !== "false";
    const forceRefresh = searchParams.get("refresh") === "true";
    const specificTag = searchParams.get("tag");

    // If specific player tag is requested, return their ClashKing legend stats
    if (specificTag) {
      try {
        const res = await cocClient.get(
          `/v2/player/${formatTag(specificTag)}/legend/season`,
        );
        return Response.json({ success: true, data: res.data });
      } catch (err: unknown) {
        const status = axios.isAxiosError(err)
          ? err.response?.status || 500
          : 500;
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : "Gagal mengambil data player";
        return Response.json(
          {
            success: false,
            error: msg,
          },
          { status },
        );
      }
    }

    const now = Date.now();

    // Return cached leaderboard if still fresh
    if (
      !forceRefresh &&
      leaderboardCache &&
      now - leaderboardCache.timestamp < CACHE_TTL_MS
    ) {
      return Response.json({
        success: true,
        source: "cache",
        timestamp: leaderboardCache.timestamp,
        totalCount: leaderboardCache.members.length,
        members: leaderboardCache.members,
      });
    }

    const data = await readData();
    const clans = data.ClanList?.data ?? [];

    // Fetch live members from official Supercell CoC API for each clan
    const clanPromises = clans.map(async (clan) => {
      try {
        const res = await cocClient.get(
          `/clans/${formatTag(clan.tag)}/members`,
        );
        return {
          clanName: clan.name,
          clanTag: clan.tag,
          items: (res.data?.items ?? []) as APIClanMember[],
        };
      } catch (err) {
        console.warn(
          `[CoC Official API] Gagal mengambil member live untuk clan ${clan.name} (${clan.tag}), menggunakan fallback lokal.`,
        );
        return {
          clanName: clan.name,
          clanTag: clan.tag,
          items: (clan.CWL?.data ?? []) as APIClanMember[],
        };
      }
    });

    const clanResults = await Promise.all(clanPromises);

    // Collect and filter unique members belonging to Legend 1, 2, or 3
    const legendMembersMap = new Map<string, LegendLeaderboardMember>();

    for (const { clanName, clanTag, items } of clanResults) {
      for (const m of items) {
        const tierName = m.leagueTier?.name || "";
        const isLegend =
          tierName === "Legend I"|| 
          tierName === "Legend II"||
          tierName === "Legend III"||
          tierName === "Legend 1"||
          tierName === "Legend 2"||
          tierName === "Legend 3";

        if (isLegend && m.tag) {
          const cleanTag = m.tag.trim();
          if (!legendMembersMap.has(cleanTag)) {
            legendMembersMap.set(cleanTag, {
              ...m,
              tag: cleanTag,
              name: m.name || "Tanpa Nama",
              townHallLevel: m.townHallLevel ?? 0,
              trophies: m.trophies,
              clanName,
              clanTag,
            });
          }
        }
      }
    }

    const members = Array.from(legendMembersMap.values());

    // Fetch legend season stats from ClashKing in parallel
    const statsRecord: Record<string, PlayerLegendSeasonResponse | null> = {};

    if (withStats && members.length > 0) {
      const fetchPromises = members.map(async (m) => {
        try {
          const res = await cocClient.get<PlayerLegendSeasonResponse>(
            `/v2/player/${formatTag(m.tag)}/legend/season`,
          );
          return { tag: m.tag, data: res.data };
        } catch {
          return { tag: m.tag, data: null };
        }
      });

      const results = await Promise.all(fetchPromises);
      for (const r of results) {
        statsRecord[r.tag] = r.data;
      }
    }

    // Attach stats to members
    const membersWithStats: LegendLeaderboardMember[] = members.map((m) => {
      const statsData = statsRecord[m.tag] ?? null;
      return {
        ...m,
        legendDetails: statsData,
        legendStats: statsData?.stats ?? null,
      };
    });

    // Save to cache
    leaderboardCache = {
      timestamp: now,
      members: membersWithStats,
    };

    return Response.json({
      success: true,
      source: "live_coc_api",
      timestamp: now,
      totalCount: membersWithStats.length,
      members: membersWithStats,
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Gagal mengambil data leaderboard";
    console.error("Error fetching legend leaderboard members:", errorMsg);
    return Response.json(
      { success: false, error: "Gagal mengambil data leaderboard" },
      { status: 500 },
    );
  }
}
