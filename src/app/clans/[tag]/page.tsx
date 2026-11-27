
import Image from "next/image";
import ClanCwlList from "@/containers/ClanCwlList";
import ClanMemberList from "@/containers/ClanMemberList";

import { supabase } from "@/lib/supabase";
import type { APIClanMember } from "@/lib/type";
import { normalizeTag } from "@/lib/type";
import { officialClansApi } from "@/service/endpoints";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export default async function ClanDetailPage({ params }: PageProps) {
  const { tag } = await params;

  
  const { data: allClans } = await supabase
    .from("clans")
    .select("id, name, tag, logo");

  const otherClans = (allClans ?? []).filter(
    (c) => normalizeTag(c.tag) !== normalizeTag(tag),
  );

  
  const [clan, currentwar, otherMembersResults] = await Promise.all([
    officialClansApi.getClan(tag),
    officialClansApi.getCurrentWar(tag),
    Promise.all(
      otherClans.map(async (c) => {
        try {
          const res = await officialClansApi.getClanMembers(c.tag);
          return (res?.items ?? []).map((m) => ({
            ...m,
            clanName: c.name,
          }));
        } catch {
          return [];
        }
      }),
    ),
  ]);

  const currentMembers: APIClanMember[] = (clan.memberList ?? []).map((m) => ({
    ...m,
    clanName: clan.name,
  }));

  const otherMembers: APIClanMember[] = otherMembersResults.flat();

  const seenTags = new Set<string>();
  const cwlAvailableMembers: APIClanMember[] = [];

  for (const m of [...currentMembers, ...otherMembers]) {
    const normalizedTagKey = normalizeTag(m.tag);
    if (!seenTags.has(normalizedTagKey)) {
      seenTags.add(normalizedTagKey);
      cwlAvailableMembers.push(m);
    }
  }

  const countAllAttack =
    (currentwar?.attacksPerMember || 1) * (currentwar?.teamSize || 0);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-4 flex flex-col gap-5">
      <div className="flex flex-col justify-center min-h-10 h-fit border border-[#2c4176] relative rounded-md bg-[#12244F] gap-4">
        {/* Header Clan */}
        <div className="flex items-center justify-between h-fit w-fit gap-3 m-4">
          {/* logo & detail */}
          <div className="flex items-center gap-3 ">
            {(clan.badgeUrls?.large ||
              clan.badgeUrls?.medium ||
              clan.badgeUrls?.small) && (
              <Image
                src={
                  clan.badgeUrls.large ||
                  clan.badgeUrls.medium ||
                  clan.badgeUrls.small
                }
                alt="logo clan"
                width={80}
                height={80}
                className="aspect-square w-[80px] h-[80px] object-contain"
              />
            )}
            <div className="grid grid-cols-1">
              <h3 className="uppercase font-bold text-lg text-white">
                {clan.name}
              </h3>
              <span className="text-[12px] font-light text-zinc-300 font-mono">
                {clan.tag}
              </span>
              <span className="text-xs text-blue-300">
                Level {clan.clanLevel}
              </span>
            </div>
          </div>

          {/* count members */}
          <div className="bg-[#071A45] px-4 py-2 rounded-lg border-2 border-[#2c4176] text-white font-semibold">
            {clan.members}/50
          </div>
        </div>

        {/* Deskripsi Clan */}
        <div className="bg-[#071A45] p-3 rounded-lg border-2 border-[#2c4176] text-white m-4">
          <p className="max-h-20 scrollbar-thin overflow-auto font-normal text-sm text-zinc-200 whitespace-pre-line">
            {clan.description || "Tidak ada deskripsi."}
          </p>
        </div>

        {/* Daftar Anggota Clan Aktif */}
        <ClanMemberList members={clan.memberList ?? []} />
      </div>

      {/* currentwar */}
      {currentwar && (
        <div className="bg-[#12244F] p-3 rounded-lg flex justify-between border-2 border-[#2c4176] text-white text-[12px]">
          <div className="flex flex-col place-items-center w-fit gap-1">
            {(currentwar.clan?.badgeUrls?.large ||
              currentwar.clan?.badgeUrls?.medium ||
              currentwar.clan?.badgeUrls?.small) && (
              <Image
                src={
                  currentwar.clan.badgeUrls.large ||
                  currentwar.clan.badgeUrls.medium ||
                  currentwar.clan.badgeUrls.small
                }
                className="flex justify-self-center"
                alt={`logo ${currentwar.clan?.name || "Clan"}`}
                width={50}
                height={50}
              />
            )}
            <span>{currentwar.clan?.name || "Clan"}</span>
            <span className="font-normal">
              Atk : {currentwar.clan?.attacks ?? 0}/{countAllAttack}
            </span>
            <span>
              destruction:{" "}
              {Number(currentwar.clan?.destructionPercentage ?? 0).toFixed(1)}%
            </span>
          </div>
          <div className="flex flex-col place-items-center justify-center w-fit flex-none">
            <span className="font-bold text-sm">
              {currentwar.teamSize} VS {currentwar.teamSize}
            </span>
            <span className="text-[10px] uppercase text-zinc-400">
              {currentwar.state}
            </span>
          </div>
          <div className="flex flex-col place-items-center w-fit gap-1 ">
            {(currentwar.opponent?.badgeUrls?.large ||
              currentwar.opponent?.badgeUrls?.medium ||
              currentwar.opponent?.badgeUrls?.small) && (
              <Image
                src={
                  currentwar.opponent.badgeUrls.large ||
                  currentwar.opponent.badgeUrls.medium ||
                  currentwar.opponent.badgeUrls.small
                }
                className="flex justify-self-center"
                alt={`logo ${currentwar.opponent?.name || "Opponent"}`}
                width={50}
                height={50}
              />
            )}
            <span>{currentwar.opponent?.name || "Opponent"}</span>
            <span className="font-normal">
              Atk : {currentwar.opponent?.attacks ?? 0}/{countAllAttack}
            </span>
            <span>
              destruction:{" "}
              {Number(currentwar.opponent?.destructionPercentage ?? 0).toFixed(
                1,
              )}
              %
            </span>
          </div>
        </div>
      )}

      {/* daftar cwl */}
      <div className="border border-[#2c4176] rounded-md">
        {/* <CwlMemberManager members={cwlAvailableMembers} clanTag={clan.tag} /> */}
        <ClanCwlList tag={clan.tag} name={clan.name} page="member" />
      </div>
    </div>
  );
}