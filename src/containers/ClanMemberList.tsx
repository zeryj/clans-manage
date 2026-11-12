"use client";

import { useState } from "react";
import { useMemo } from "react";
import type { APIClanMember } from "@/lib/type";

interface ClanMemberListProps {
  members: APIClanMember[];
}

export default function ClanMemberList({ members, }: ClanMemberListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredMembers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return members;

    return members.filter((member) => {
      const nameMatch = (member.name || "").toLowerCase().includes(query);
      const tagMatch = (member.tag || "").toLowerCase().includes(query);
      return nameMatch || tagMatch;
    });
  }, [members, searchTerm]);

  return (
    <div className="flex flex-col gap-3 bg-[#071A45] p-4 text-white">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#2c4176]">
        <div>
          <h4>Daftar Anggota</h4>
        </div>

        {/* Input Pencarian */}
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
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <>
                        <span className="text-blue-400 font-mono">
                          {member.leagueTier?.name}
                        </span>

                        <span className="capitalize">{member.tag}</span>
                        <span>•</span>
                      </>
                    
                    <span>TH {member.townHallLevel}</span>
                  </div>
                </div>
              </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end font-semibold text-amber-400 text-sm">
                    <span>{member.trophies}</span>
                  </div>
                </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-zinc-400">
            Tidak ada member yang cocok dengan kata kunci &quot;{searchTerm}
            &quot;
          </div>
        )}
      </div>
    </div>
  );
}
