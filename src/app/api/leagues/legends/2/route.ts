import { NextResponse } from "next/server";
import type { APIClanMember, APIPlayer, APILeagueGroupList, APILeagueGroupLog} from "@/lib/type";
import { isAxiosError } from "axios";
import api from "@/service/axios";
import CwlMemberManager from "@/containers/CwlMemberManager";

export async function GET(request: Request) {
  try {
    const clantag = "#2G0LCRUGJ";
    const encodedTag = encodeURIComponent(clantag);

    const clan = await api.get(`/clans/${encodedTag}/members`);
    const members: APIClanMember[] = clan.data?.items || [];

    const legendLeagueMembers = members.filter(
      (member: any) => member.leagueTier?.name === "Legend League II",
    );

    const playersDetail: APIPlayer[] = await Promise.all(
      legendLeagueMembers.map(async (player) => {
        const encodedPTag = encodeURIComponent(player.tag);
        const getplayer = await api.get(`/players/${encodedPTag}`);
        return getplayer.data;
      })
    );

    const Promisehistory = playersDetail.map(async (members : any) => {
      const encodedGTag = encodeURIComponent(members.currentLeagueGroupTag);
      const membersTag = encodeURIComponent(members.tag);
      const seasonId = members.currentLeagueSeasonId; 
      
      const lagendHistory = await api.get(
        `/leaguegroup/${encodedGTag}/${seasonId}?playerTag=${membersTag}`,
      );
      
      const groupmembers: APILeagueGroupList[] = lagendHistory.data?.members || [];
      const membersAtk: APILeagueGroupLog[] = lagendHistory.data?.attackLogs || [];
      const membersDef: APILeagueGroupLog[] = lagendHistory.data?.defenseLogs || [];

      const playerRankData = groupmembers.find((item: any) => item.playerTag === members.tag) || null;
      
      
  const totalDestructionAtk = membersAtk.reduce(
    (sum: number, atk: any) => sum + (atk.destructionPercentage || 0),
    0
  );
  const avgDestructionAtk = membersAtk.length > 0 ? Number((totalDestructionAtk / membersAtk.length).toFixed(2)) : 0;
  const totalStarsAtk = membersAtk.reduce(
    (sum: number, atk: any) => sum + (atk.stars || 0),
    0
  );
  const avgStarAtk = membersAtk.length > 0 ? Number((totalStarsAtk / membersAtk.length).toFixed(2)) : 0;

  const totalDestructionDef = membersDef.reduce(
    (sum: number, atk: any) => sum + (atk.destructionPercentage || 0),
    0
  );
  const avgDestructionDef = membersDef.length > 0 ? Number((totalDestructionDef / membersDef.length).toFixed(2)) : 0;
  const totalStarsDef = membersDef.reduce(
    (sum: number, atk: any) => sum + (atk.stars || 0),
    0
  );
  const avgStarDef = membersDef.length > 0 ? Number((totalStarsDef / membersDef.length).toFixed(2)) : 0;

  const thropyAtk = membersAtk.reduce(
    (sum: number, atk:any) => sum + (atk.trophies || 0),
    0
  )
  const thropyDef = membersDef.reduce(
    (sum: number, def:any) => sum + (def.trophies || 0),
    0
  )
      return {
        tag: members.tag,
        name: members.name,
        trophies: members.trophies,
        leagueTier: members.leagueTier,
        rankedHistory: playerRankData,
        ThropyAtk:thropyAtk,
        ThropyDef: thropyDef,
        rankedAtk: membersAtk,
        rankedDef: membersDef,
        AvgStarAtk: avgStarAtk,
        AvgDestructionAtk: avgDestructionAtk,
        AvgStarDef: avgStarDef,
        AvgDestructionDef: avgDestructionDef,

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
