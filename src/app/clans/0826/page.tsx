import Image from "next/image";
import ClanCwlList from "@/containers/ClanCwlList";
import CwlMemberManager from "@/containers/CwlMemberManager";
import { supabase } from "@/lib/supabase";
import { clansApi } from "@/service/endpoints";
import { normalizeTag, type APIClanMember } from "@/lib/type";

interface ClanDisplayItem {
  id: number;
  tag: string;
  logo: string;
  name: string;
}

export default async function AdminPage() {
  
  const { data, error } = await supabase
    .from("clans")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Gagal mengambil data clans:", error.message);
  }

  const clans: ClanDisplayItem[] = data ?? [];

  const allMembersResults = await Promise.all(
    clans.map(async (c) => {
      try {
        const res = await clansApi.getClanMembers(c.tag);
        return (res?.items ?? []).map((m) => ({
          ...m,
          clanName: c.name,
        }));
      } catch {
        return [];
      }
    }),
  );

  
  const seenTags = new Set<string>();
  const cwlAvailableMembers: APIClanMember[] = [];

  for (const m of allMembersResults.flat()) {
    const normalizedKey = normalizeTag(m.tag);
    if (!seenTags.has(normalizedKey)) {
      seenTags.add(normalizedKey);
      cwlAvailableMembers.push(m);
    }
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-4 flex flex-col gap-5">
      {clans.map((item) => (
        <div
          key={item.tag}
          className="h-fit border border-[#2c4176] relative rounded-md bg-[#12244F]"
        >
          <div className="flex items-center gap-3 p-3">
            <Image
              src={item.logo}
              alt={`logo ${item.name}`}
              width={80}
              height={80}
              className="aspect-square w-[50px] h-[50px] object-contain"
            />
            <div className="grid grid-cols-1">
              <h3 className="uppercase font-bold text-lg text-white">
                {item.name}
              </h3>
              <span className="text-[12px] font-light text-zinc-300 font-mono">
                {item.tag}
              </span>
            </div>
          </div>
          <CwlMemberManager members={cwlAvailableMembers} clanTag={item.tag} />
          <ClanCwlList tag={item.tag} name={item.name} page="admin" />
        </div>
      ))}
    </div>
  );
}