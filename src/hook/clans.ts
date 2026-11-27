import { supabase } from "@/lib/supabase";
import type { APIClan } from "@/lib/type";
import { clansApi } from "@/service/endpoints";
import { useEffect,useState } from "react";
export interface ConfiguredClanData {
  key: string;
  tag: string;
  clan?: APIClan;
  error?: string;
}
interface ClanDisplayItem {
id: number;
tag: string;
logo: string;
name: string;
}

export async function getClanMemberSearch(): Promise<ConfiguredClanData[]> {
  const [allClans, setallClans ] = useState<ClanDisplayItem[]>([]);
      useEffect(()=>{
        const fetchdata = async () =>{
          const {data,error } = await supabase.from('clans').select('*')
    
          if(error) console.log('error', error)
          else setallClans(data);
        }
    
        fetchdata()
      }, [supabase])

  const results = await Promise.allSettled(
    allClans.map(async (clan) => {
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


export const useClanMemberSearch = getClanMemberSearch;
