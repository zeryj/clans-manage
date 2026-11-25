import { NextResponse } from "next/server";
import type { APIClanMember } from "@/lib/type";
import { isAxiosError } from "axios";
import api from "@/service/axios";

export async function GET(request: Request) {
  try {
    const clantag = "#2G0LCRUGJ";
    const encodedTag = encodeURIComponent(clantag);

    const clan = await api.get(`/clans/${encodedTag}/members`);
    const members: APIClanMember[] = clan.data?.items || [];

    const legendLeagueMembers = members.filter(
      (member: any) => member.leagueTier?.name === "Legend League I",
    );

    const Promisehistory = legendLeagueMembers.map(async (members) => {
      const encodedPTag = encodeURIComponent(members.tag);
      const lagendHistory = await api.get(
        `/v2/player/${encodedPTag}/legend/season`,
      );

      return {
        tag: members.tag,
        name: members.name,
        trophies: members.trophies,
        leagueTier: members.leagueTier,
        rankedHistory: lagendHistory.data,
      };
    });

    const results = await Promise.allSettled(Promisehistory);

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