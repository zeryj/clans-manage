"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { APIClanMember } from "@/lib/type";

export interface ClanDisplayItem {
  id: number;
  tag: string;
  logo: string;
  name: string;
}

// 1. Hook untuk mengambil semua daftar Clan dari Supabase
export function useClans() {
  return useQuery({
    queryKey: ["clans"],
    queryFn: async (): Promise<ClanDisplayItem[]> => {
      const { data, error } = await supabase
        .from("clans")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

// 2. Hook untuk mengambil daftar peserta CWL berdasarkan clanTag
export function useCwlMembers(clanTag?: string) {
  return useQuery({
    queryKey: ["cwl-members", clanTag],
    queryFn: async (): Promise<APIClanMember[]> => {
      if (!clanTag) return [];
      const res = await fetch(`/api/cwl?clanTag=${encodeURIComponent(clanTag)}`);
      if (!res.ok) throw new Error("Gagal memuat data CWL");
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
    enabled: Boolean(clanTag), // Hanya dijalankan jika clanTag tersedia
  });
}

// 3. Hook Mutation untuk menghapus peserta CWL & otomatis refresh cache
export function useDeleteCwlMember(clanTag?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberTag: string) => {
      const res = await fetch("/api/cwl", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clanTag, tag: memberTag }),
      });
      if (!res.ok) throw new Error("Gagal menghapus member CWL");
      return res.json();
    },
    onSuccess: () => {
      // Otomatis me-refresh daftar peserta CWL setelah berhasil dihapus
      queryClient.invalidateQueries({ queryKey: ["cwl-members", clanTag] });
    },
  });
}