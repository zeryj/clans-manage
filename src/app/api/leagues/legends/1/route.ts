  import { NextResponse } from "next/server";
  import type { APIClanMember, BattleItem, LegendSeriesItem  } from "@/lib/type";
  import { isAxiosError } from "axios";
  import api from "@/service/axios";

  export async function GET() {
    try {
      const clantag = "#2G0LCRUGJ";
      const encodedTag = encodeURIComponent(clantag);

      const clan = await api.get(`/clans/${encodedTag}/members`);
      const members: APIClanMember[] = clan.data?.items || [];

      const legendLeagueMembers = members.filter(
        (member) => member.leagueTier?.name === "Legend League I",
      );

      const legendHistoryPromises = legendLeagueMembers.map(async (member) => {
        const encodedPTag = encodeURIComponent(member.tag);

        const [legendHistoryRes, statRankRes] = await Promise.all([
          api.get(`/v2/player/${encodedPTag}/legend/series`),
          api.get(`/v2/player/${encodedPTag}/legend/season`).catch(() => null),
        ]);

        const rawItems: LegendSeriesItem[] = legendHistoryRes.data?.items ?? [];
        const MAX_DAYS = 7;

        const compactItems = [...rawItems]
          .sort((a, b) => b.day.localeCompare(a.day))
          .slice(0, MAX_DAYS)
          .map((item) => ({
            day: item.day,
            attacks: item.attacks,
            defenses: item.defenses,
            attackTrophies: item.attackTrophies,
            defenseTrophies: item.defenseTrophies,
            trophies: item.trophies,
          }));

        const totalattackTrophies = compactItems.reduce(
          (sum, atk) => sum + (atk.attackTrophies || 0),
          0,
        );
        const totaldefenseTrophies = compactItems.reduce(
          (sum, def) => sum + (def.defenseTrophies || 0),
          0,
        );

        const historyDays = compactItems.map((item) => item.day);

        const logRank = await Promise.all(
          historyDays.map(async (day) => {
            const rankday = await api
              .get(`/v2/player/${encodedPTag}/legend/${day}/battlelog`)
              .catch(() => null);

            const attacks: BattleItem[] = rankday?.data?.attacks ?? [];
            const defenses: BattleItem[] = rankday?.data?.defenses ?? [];

            const compactAttack = attacks.map((b) => ({
                type: "attack" as const,
                time: b.time,
                stars: b.stars,
                destruction: b.destructionPercentage,
                trophies: b.trophies,
              }))
            const compactDefenses = defenses.map((b) => ({
                type: "defense" as const,
                time: b.time,
                stars: b.stars,
                destruction: b.destructionPercentage,
                trophies: b.trophies,
              }))

            return {
              day,
              battlelog: {
                attacks: compactAttack,
                defenses: compactDefenses,
              },
            };
          }),
        );

        const stat = statRankRes?.data?.stats ?? null;

        return {
          tag: member.tag,
          name: member.name,
          stat,
          trophies: member.trophies,
          totalattackTrophies,
          totaldefenseTrophies,
          leagueTier: member.leagueTier,
          rankedHistory: {
            items: compactItems,
          },
          rankday: logRank,
        };
      });

      const results = await Promise.allSettled(legendHistoryPromises);

      const legendHistory = results.map((result, index) => {
        if (result.status === "fulfilled") {
          return result.value;
        }

        const member = legendLeagueMembers[index];
        return {
          tag: member.tag,
          name: member.name,
          trophies: member.trophies,
          leagueTier: member.leagueTier,
          rankedHistory: null,
          error: "History tidak tersedia",
        };
      });

      return NextResponse.json({
        success: true,
        total: legendHistory.length,
        members: legendHistory,
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
