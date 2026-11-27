"use client";

import { useCallback, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useCwlMemberSearch } from "@/hook/cwl";
import data from "@/lib/data.json";
import type { APIClanMember } from "@/lib/type";
import { normalizeTag } from "@/lib/type";

interface ClanCwlListProps {
  id?: number;
  tag?: string;
  name?: string;
  page: "admin" | "member"
}

export default function ClanCwlList({ id, tag, name, page }: ClanCwlListProps) {
  
  const initialClan = data.ClanList.data.find(
    (c) =>
      (tag && normalizeTag(c.tag) === normalizeTag(tag)) ||
      (id !== undefined && c.id === id),
  );

  const initialMembers =
    (initialClan?.CWL?.data as unknown as APIClanMember[]) ?? [];

  const [cwlMembers, setCwlMembers] = useState<APIClanMember[]>(initialMembers);
  const [deletingTag, setDeletingTag] = useState<string | null>(null);

  
  const fetchCwlMembers = useCallback(async () => {
    if (!tag) return;
    try {
      const res = await fetch(`/api/cwl?clanTag=${encodeURIComponent(tag)}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          setCwlMembers(json);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data CWL:", err);
    }
  }, [tag]);

  
  useEffect(() => {
    const handleCwlUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ clanTag?: string }>;
      if (!customEvent.detail?.clanTag || !tag) {
        fetchCwlMembers();
      } else if (
        normalizeTag(customEvent.detail.clanTag) === normalizeTag(tag)
      ) {
        fetchCwlMembers();
      }
    };

    window.addEventListener("cwl-updated", handleCwlUpdated);
    return () => {
      window.removeEventListener("cwl-updated", handleCwlUpdated);
    };
  }, [tag, fetchCwlMembers]);

  
  const handleDeleteMember = async (memberTag: string) => {
    if (!tag) return;
    setDeletingTag(memberTag);
    try {
      const res = await fetch("/api/cwl", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clanTag: tag, tag: memberTag }),
      });
      if (res.ok) {
        setCwlMembers((prev) =>
          prev.filter((m) => normalizeTag(m.tag) !== normalizeTag(memberTag)),
        );
      }
    } catch (err) {
      console.error("Gagal menghapus member CWL:", err);
    } finally {
      setDeletingTag(null);
    }
  };

  
  const { searchTerm, setSearchTerm, filteredMembers } =
    useCwlMemberSearch(cwlMembers);

  return (
    <div className="flex flex-col gap-3 bg-[#071A45] p-4 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#2c4176]">
        <div>
          <h4 className="font-semibold text-base">
            {name ? `Daftar Peserta CWL - ${name}` : "Daftar Peserta CWL"}
          </h4>
          {tag && (
            <span className="text-xs text-zinc-400 font-mono">Tag: {tag}</span>
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
              {/* Info Nama & Tag */}
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
              {/* Tombol Hapus */}
            {page === "admin" ? (
              <button
                type="button"
                onClick={() => handleDeleteMember(member.tag)}
                disabled={deletingTag === member.tag}
                className="p-2 text-zinc-400 hover:text-red-400 transition rounded disabled:opacity-50"
                title="Hapus dari CWL"
              >
                <FaTrash className="w-3.5 h-3.5" />
              </button>
            ) : null }
            </div>

          ))
        ) : (
          <div className="py-8 text-center text-sm text-zinc-400">
            {searchTerm
              ? `Tidak ada member CWL yang cocok dengan "${searchTerm}"`
              : cwlMembers.length > 0
                ? ` ${cwlMembers.length} member CWL`
                : "Belum ada member CWL."}
          </div>
        )}
      </div>
    </div>
  );
}
