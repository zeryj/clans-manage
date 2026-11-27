import { isAxiosError } from "axios";
import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";
import type {
  APIClanMember,
  APILeagueGroupList,
  APILeagueGroupLog,
  APIPlayer,
} from "@/lib/type";
import api from "@/service/axios";

const CACHE_KEY = "legend_league_3";
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

    const clantag = process.env.CLAN_TAG || "#2G0LCRUGJ";
    const encodedTag = encodeURIComponent(clantag);

    const clan = await api.get(`/clans/${encodedTag}/members`);
    const members: APIClanMember[] = clan.data?.items || [];

    const legendLeagueMembers = members.filter(
      (member: any) => member.leagueTier?.name === "Legend League III",
    );

    
    const chunkSize = 5;
    const playersDetail: APIPlayer[] = [];

    for (let i = 0; i < legendLeagueMembers.length; i += chunkSize) {
      const chunk = legendLeagueMembers.slice(i, i + chunkSize);
      const chunkResults = await Promise.allSettled(
        chunk.map(async (player) => {
          const encodedPTag = encodeURIComponent(player.tag);
          const getplayer = await api.get(`/players/${encodedPTag}`);
          return getplayer.data;
        }),
      );

      chunkResults.forEach((result) => {
        if (result.status === "fulfilled") {
          playersDetail.push(result.value);
        }
      });
    }

    
    const legendHistory: any[] = [];

    for (let i = 0; i < playersDetail.length; i += chunkSize) {
      const chunk = playersDetail.slice(i, i + chunkSize);
      const chunkResults = await Promise.allSettled(
        chunk.map(async (playerDetail: any) => {
          const encodedGTag = encodeURIComponent(
            playerDetail.currentLeagueGroupTag,
          );
          const membersTag = encodeURIComponent(playerDetail.tag);
          const seasonId = playerDetail.currentLeagueSeasonId;

          const lagendHistory = await api.get(
            `/leaguegroup/${encodedGTag}/${seasonId}?playerTag=${membersTag}`,
          );

          const groupmembers: APILeagueGroupList[] =
            lagendHistory.data?.members || [];
          const membersAtk: APILeagueGroupLog[] =
            lagendHistory.data?.attackLogs || [];
          const membersDef: APILeagueGroupLog[] =
            lagendHistory.data?.defenseLogs || [];

          const playerRankData =
            groupmembers.find(
              (item: any) => item.playerTag === playerDetail.tag,
            ) || null;

          const totalDestructionAtk = membersAtk.reduce(
            (sum: number, atk: any) => sum + (atk.destructionPercentage || 0),
            0,
          );
          const avgDestructionAtk =
            membersAtk.length > 0
              ? Number((totalDestructionAtk / membersAtk.length).toFixed(2))
              : 0;
          const totalStarsAtk = membersAtk.reduce(
            (sum: number, atk: any) => sum + (atk.stars || 0),
            0,
          );
          const avgStarAtk =
            membersAtk.length > 0
              ? Number((totalStarsAtk / membersAtk.length).toFixed(2))
              : 0;

          const totalDestructionDef = membersDef.reduce(
            (sum: number, atk: any) => sum + (atk.destructionPercentage || 0),
            0,
          );
          const avgDestructionDef =
            membersDef.length > 0
              ? Number((totalDestructionDef / membersDef.length).toFixed(2))
              : 0;
          const totalStarsDef = membersDef.reduce(
            (sum: number, atk: any) => sum + (atk.stars || 0),
            0,
          );
          const avgStarDef =
            membersDef.length > 0
              ? Number((totalStarsDef / membersDef.length).toFixed(2))
              : 0;

          const thropyAtk = membersAtk.reduce(
            (sum: number, atk: any) => sum + (atk.trophies || 0),
            0,
          );
          const thropyDef = membersDef.reduce(
            (sum: number, def: any) => sum + (def.trophies || 0),
            0,
          );

          return {
            tag: playerDetail.tag,
            name: playerDetail.name,
            trophies: playerDetail.trophies,
            leagueTier: playerDetail.leagueTier,
            rankedHistory: playerRankData,
            ThropyAtk: thropyAtk,
            ThropyDef: thropyDef,
            rankedAtk: membersAtk,
            rankedDef: membersDef,
            AvgStarAtk: avgStarAtk,
            AvgDestructionAtk: avgDestructionAtk,
            AvgStarDef: avgStarDef,
            AvgDestructionDef: avgDestructionDef,
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
