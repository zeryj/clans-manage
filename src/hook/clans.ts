import clanConfig from "@/lib/data.json";
import type { APIClan } from "@/lib/type";
import { clansApi } from "@/service/endpoints";

export interface ConfiguredClanData {
  key: string;
  tag: string;
  clan?: APIClan;
  error?: string;
}

export async function getClanMemberSearch(): Promise<ConfiguredClanData[]> {
  const clanList = clanConfig.ClanList.data;

  const results = await Promise.allSettled(
    clanList.map(async (clan) => {
      const clanData = await clansApi.getClan(clan.tag);
      return { key: String(clan.id), tag: clan.tag, clan: clanData };
    }),
  );

  return results.map((res, index) => {
    if (res.status === "fulfilled") {
      return res.value;
    }
    return {
      key: index.toString(),
      tag: "",
      error: (res.reason?.message || "Gagal mengambil data clan") as string,
    };
  });
}

// Backward-compatibility alias
export const useClanMemberSearch = getClanMemberSearch;
