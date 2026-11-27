import { LegendSeasonStat } from './../../../../../hook/useLegendLeaderboard';
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";
import type { APIClanMember, BattleItem, LegendSeriesItem } from "@/lib/type";
import api from "@/service/axios";

const CACHE_KEY = "legend_league_1";
const CACHE_TTL_SECONDS = 180;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("forceRefresh") === "true";

    if (!forceRefresh) {
      const cachedData = getCache(CACHE_KEY);
      if (cachedData) {
        return NextResponse.json(cachedData, {
          headers: {
            "X-Cache": "HIT",
            "Cache-Control": "public, s-maxage=180, stale-while-revalidate=300",
          },
        });
      }
    }

    // Normalisasi tag clan agar selalu memiliki awalan '#' dan ter-encode dengan benar
    const rawClanTag = process.env.CLAN_TAG || "#2G0LCRUGJ";
    const cleanClanTag = rawClanTag.trim().toUpperCase();
    const clanTagWithHash = cleanClanTag.startsWith("#")
      ? cleanClanTag
      : `#${cleanClanTag}`;
    const encodedTag = encodeURIComponent(clanTagWithHash);

    const clan = await api.get(`/clans/${encodedTag}/members`);
    const members: APIClanMember[] = clan.data?.items || [];

    const legendLeagueMembers = members
      .filter((member) => member.leagueTier?.name === "Legend League I")
      .sort((a, b) => (b.trophies ?? 0) - (a.trophies ?? 0));

    // Proses data pemain per kelompok (chunk) agar koneksi tetap stabil
    const chunkSize = 5;
    const legendHistory: Array<{
      tag: string;
      name: string;
      stat: unknown;
      trophies: number;
      totalattackTrophies?: number;
      totaldefenseTrophies?: number;
      leagueTier?: APIClanMember["leagueTier"];
      rankedHistory?: {
        items: Array<{
          day: string;
          attacks: number;
          defenses: number;
          attackTrophies: number;
          defenseTrophies: number;
          trophies: number;
        }>;
      } | null;
      rankday?: Array<{
        day: string;
        battlelog: {
          attacks: Array<{
            type: "attack";
            time?: string;
            stars?: number;
            destruction?: number;
            destructionPercentage?: number;
            trophies?: number;
          }>;
          defenses: Array<{
            type: "defense";
            time?: string;
            stars?: number;
            destruction?: number;
            destructionPercentage?: number;
            trophies?: number;
          }>;
          items: Array<{
            type: "attack" | "defense";
            time?: string;
            stars?: number;
            destruction?: number;
            destructionPercentage?: number;
            trophies?: number;
          }>;
        };
      }>;
      error?: string;
    }> = [];

    for (let i = 0; i < legendLeagueMembers.length; i += chunkSize) {
      const chunk = legendLeagueMembers.slice(i, i + chunkSize);
      const chunkResults = await Promise.allSettled(
        chunk.map(async (member) => {
          const rawMemberTag = member.tag.trim().toUpperCase();
          const memberTagWithHash = rawMemberTag.startsWith("#")
            ? rawMemberTag
            : `#${rawMemberTag}`;
          const encodedPTag = encodeURIComponent(memberTagWithHash);

          const [legendHistoryRes, statRankRes] = await Promise.all([
            api.get(`/v2/player/${encodedPTag}/legend/series`),
            api
              .get(`/v2/player/${encodedPTag}/legend/season`)
              .catch(() => null),
          ]);

          const rawItems: LegendSeriesItem[] =
            legendHistoryRes.data?.items ?? [];
          const seasonStart = statRankRes?.data?.seasonStart; // "2026-11-23T05:00:00.000Z"
          const seasonEnd = statRankRes?.data?.seasonEnd; // "2026-12-21T05:00:00.000Z" 

          // Ekstrak format YYYY-MM-DD dari seasonStart dan seasonEnd
          const startDateStr = seasonStart ? seasonStart.split("T")[0] : null;
          const endDateStr = seasonEnd ? seasonEnd.split("T")[0] : null;

          // Filter rawItems agar hanya mencakup hari di antara seasonStart dan seasonEnd
          const filteredItems = rawItems.filter((item) => {
            // Normalisasi item.day jika sewaktu-waktu berformat ISO string
            const itemDayStr = item.day.split("T")[0];

            if (startDateStr && itemDayStr < startDateStr) return false;
            // Catatan: gunakan >= jika seasonEnd adalah batas eksklusif (hari reset musim baru)
            if (endDateStr && itemDayStr >= endDateStr) return false;

            return true;
          });

          // Gunakan filteredItems (bukan rawItems) untuk proses selanjutnya
          const compactItems = [...filteredItems]
            .sort((a, b) => b.day.localeCompare(a.day))
            .map((item) => ({
              day: item.day,
              attacks: item.attacks,
              defenses: item.defenses,
              attackTrophies: item.attackTrophies,
              defenseTrophies: item.defenseTrophies,
              trophies: item.trophies,
            }));

          // Total trofi serangan dan pertahanan dihitung dari seluruh hari di musim ini
          const totalattackTrophies = compactItems.reduce(
            (sum, atk) => sum + (atk.attackTrophies || 0),
            0,
          );
          const totaldefenseTrophies = compactItems.reduce(
            (sum, def) => sum + (def.defenseTrophies || 0),
            0,
          );

          // Optimasi: Hanya panggil /battlelog untuk hari-hari yang memiliki riwayat serangan atau pertahanan
          const activeDays = compactItems.filter(
            (item) => (item.attacks ?? 0) > 0 || (item.defenses ?? 0) > 0,
          );

          const activeBattlelogs = await Promise.all(
            activeDays.map(async (item) => {
              const rankday = await api
                .get(`/v2/player/${encodedPTag}/legend/${item.day}/battlelog`)
                .catch(() => null);

              const attacks: BattleItem[] = rankday?.data?.attacks ?? [];
              const defenses: BattleItem[] = rankday?.data?.defenses ?? [];

              const compactAttack = attacks.map((b) => ({
                type: "attack" as const,
                time: b.time,
                stars: b.stars ?? 0,
                destruction: b.destructionPercentage ?? 0,
                destructionPercentage: b.destructionPercentage ?? 0,
                trophies: b.trophies ?? 0,
              }));

              const compactDefenses = defenses.map((b) => ({
                type: "defense" as const,
                time: b.time,
                stars: b.stars ?? 0,
                destruction: b.destructionPercentage ?? 0,
                destructionPercentage: b.destructionPercentage ?? 0,
                trophies: b.trophies ?? 0,
              }));

              return {
                day: item.day,
                battlelog: {
                  attacks: compactAttack,
                  defenses: compactDefenses,
                  items: [...compactAttack, ...compactDefenses],
                },
              };
            }),
          );

          const battlelogMap = new Map(
            activeBattlelogs.map((log) => [log.day, log.battlelog]),
          );

          // Menghasilkan rankday untuk seluruh hari (kompatibel dengan LegendLeaderboard dan Legend1Leaderboard)
          const logRank = compactItems.map((item) => ({
            day: item.day,
            battlelog: battlelogMap.get(item.day) ?? {
              attacks: [],
              defenses: [],
              items: [],
            },
          }));

          // Normalisasi stats musim agar sinkron dengan ekspektasi tampilan UI
          const rawStats = statRankRes?.data?.stats ?? null;
          const stat = rawStats
            ? {
                ...rawStats,
                attack: {
                  stars: rawStats.offenseStars
                    ? Number(
                        (
                          (rawStats.offenseStars.one * 1 +
                            rawStats.offenseStars.two * 2 +
                            rawStats.offenseStars.three * 3) /
                          (rawStats.attacks || 1)
                        ).toFixed(2),
                      )
                    : (rawStats.attack?.stars ?? 0),
                  destruction: rawStats.attack?.destruction ?? 0,
                  trophies: rawStats.averageOffense
                    ? Math.round(rawStats.averageOffense)
                    : (rawStats.attack?.trophies ?? 0),
                },
                defense: {
                  stars: rawStats.defenseStars
                    ? Number(
                        (
                          (rawStats.defenseStars.one * 1 +
                            rawStats.defenseStars.two * 2 +
                            rawStats.defenseStars.three * 3) /
                          (rawStats.defenses || 1)
                        ).toFixed(2),
                      )
                    : (rawStats.defense?.stars ?? 0),
                  destruction: rawStats.defense?.destruction ?? 0,
                  trophies: rawStats.averageDefense
                    ? Math.round(rawStats.averageDefense)
                    : (rawStats.defense?.trophies ?? 0),
                },
              }
            : null;

          return {
            tag: member.tag,
            name: member.name,
            stat,
            trophies: member.trophies,
            totalattackTrophies,
            totaldefenseTrophies,
            leagueTier: member.leagueTier,
            seasonStart,
            seasonEnd,
            rankedHistory: {
              items: compactItems,
            },
            rankday: logRank,
          };
        }),
      );

      chunkResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          legendHistory.push(result.value);
        } else {
          const member = chunk[index];
          legendHistory.push({
            tag: member.tag,
            name: member.name,
            stat: null,
            trophies: member.trophies,
            leagueTier: member.leagueTier,
            rankedHistory: null,
            error: "History tidak tersedia",
          });
        }
      });
    }

    const responseData = {
      success: true,
      total: legendHistory.length,
      members: legendHistory,
    };

    setCache(CACHE_KEY, responseData, CACHE_TTL_SECONDS);

    return NextResponse.json(responseData, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, s-maxage=180, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        "Axios Error:",
        error.response?.status,
        error.response?.data,
      );
      return NextResponse.json(
        { error: error.response?.data || "Gagal mengambil data" },
        { status: error.response?.status || 500 },
      );
    }

    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
