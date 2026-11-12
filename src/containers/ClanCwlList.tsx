"use client";

import { useCallback, useEffect, useState } from "react";
import { useCwlMemberSearch } from "@/hook/cwl";
import type { APIClanMember } from "@/lib/type";
import { normalizeTag } from "@/lib/type";
import data from "@/lib/data.json";
import { FaTrash } from "react-icons/fa";

interface ClanCwlListProps {
  id?: number;
  tag?: string;
  name?: string;
}

export default function ClanCwlList({ id, tag, name }: ClanCwlListProps) {
  // 1. Dapatkan clan dari data.json berdasarkan tag
  const initialClan = data.ClanList.data.find(
    (c) =>
      (tag && normalizeTag(c.tag) === normalizeTag(tag)) ||
      (id !== undefined && c.id === id)
  );

  // 2. Inisialisasi state dari CWL.data di data.json (jika ada)
  const initialMembers =
    (initialClan?.CWL?.data as unknown as APIClanMember[]) ?? [];

  const [cwlMembers, setCwlMembers] = useState<APIClanMember[]>(initialMembers);

  // 3. Search dan filter
  const { searchTerm, setSearchTerm, filteredMembers } =
    useCwlMemberSearch(cwlMembers);

  return (
    <div className="flex flex-col gap-3 bg-[#071A45] p-4 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#2c4176]">
        <div>
          <h4>
            {name ? `Daftar Peserta CWL - ${name}` : "Daftar Peserta CWL"}
          </h4>
          {tag && (
            <span className="text-xs text-zinc-400 font-mono">
              Tag: {tag}
            </span>
          )}
        </div>

        {/* Input Search */}
        <div className="relative w-full sm:w-72 flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama atau tag..."
            className="w-full bg-[#12244F] border border-[#2c4176] rounded-md px-3 py-1.5 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-blue-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* List Member */}
      <div className="flex flex-col divide-y divide-[#1e3466] max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div
              key={member.tag}
              className="flex items-center justify-between py-2.5 px-2 hover:bg-[#12244F]/50 rounded transition"
            >
              {/* Info Nama & Role */}
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium text-sm text-zinc-100">
                    {member.name || "Tanpa Nama"}
                  </p>
                  <p className="text-xs text-zinc-400 font-mono">
                    {member.tag}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-zinc-400">
            {searchTerm
              ? `Tidak ada member CWL yang cocok dengan "${searchTerm}"`
              : initialMembers.length > 0
              ? ` ${initialMembers.length} member CWL`
              : "Belum ada member CWL."}
          </div>
        )}
      </div>
    </div>
  );
}