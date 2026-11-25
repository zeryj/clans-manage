import { isAxiosError } from "axios";
import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";
import type { APIClanMember } from "@/lib/type";
import api from "@/service/axios";

const CACHE_KEY = "legend_league_1";
const CACHE_TTL_SECONDS = 180; // 3 menit

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("forceRefresh") === "true";

    // 1. Cek Cache Server jika bukan permintaan paksa refresh
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
      (member: any) => member.leagueTier?.name === "Legend League I",
    );

    // 2. Fetch history dengan Concurrency Batching (chunk size 5)
    const chunkSize = 5;
    const legendHistory: any[] = [];

    for (let i = 0; i < legendLeagueMembers.length; i += chunkSize) {
      const chunk = legendLeagueMembers.slice(i, i + chunkSize);
      const chunkPromises = chunk.map(async (member) => {
        const encodedPTag = encodeURIComponent(member.tag);
        const lagendHistory = await api.get(
          `/v2/player/${encodedPTag}/legend/season`,
        );

        return {
          tag: member.tag,
          name: member.name,
          trophies: member.trophies,
          leagueTier: member.leagueTier,
          rankedHistory: lagendHistory.data,
        };
      });

      const chunkResults = await Promise.allSettled(chunkPromises);

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

    // 3. Simpan data baru ke Cache Server
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
