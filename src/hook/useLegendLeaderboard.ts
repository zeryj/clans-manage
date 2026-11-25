"use client";

import { useEffect, useRef, useState } from "react";

export type LegendRankDivision =
  | "Legend League I"
  | "Legend League II"
  | "Legend League III";

export interface LegendMember {
  tag: string;
  name: string;
  trophies: number;
  leagueTier: any;
  rankedHistory: any;
  rankedAtk?: any[];
  rankedDef?: any[];
  AvgStarAtk?: number;
  AvgDestructionAtk?: number;
  AvgStarDef?: number;
  AvgDestructionDef?: number;
  ThropyDef?: number;
  ThropyAtk?: number;
  error?: string;
}

interface LegendResponse {
  success: boolean;
  total: number;
  members: LegendMember[];
}

// Client-side in-memory cache untuk navigasi antar tab instan
const clientTabCache = new Map<number, LegendResponse>();

export function useLegendLeaderboard(id: 1 | 2 | 3, refreshKey: number = 0) {
  const [data, setData] = useState<LegendResponse | null>(
    () => clientTabCache.get(id) || null,
  );
  const [loading, setLoading] = useState<boolean>(!clientTabCache.has(id));
  const [error, setError] = useState<string | null>(null);

  // Lacak refreshKey sebelumnya untuk mendeteksi trigger refresh manual
  const prevRefreshKeyRef = useRef(refreshKey);

  useEffect(() => {
    const isManualRefresh = refreshKey !== prevRefreshKeyRef.current;
    prevRefreshKeyRef.current = refreshKey;

    // Jika data sudah ada di client cache dan bukan manual refresh, pakai data cache langsung (0ms)
    const cachedItem = clientTabCache.get(id);
    if (cachedItem && !isManualRefresh) {
      setData(cachedItem);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    async function fetchLegends() {
      setLoading(true);
      setError(null);

      try {
        const query = isManualRefresh ? "?forceRefresh=true" : "";
        const res = await fetch(`/api/leagues/legends/${id}${query}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Gagal mengambil data liga");

        const result: LegendResponse = await res.json();
        clientTabCache.set(id, result);
        setData(result);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Terjadi kesalahan");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchLegends();
    return () => controller.abort();
  }, [id, refreshKey]);

  return {
    members: data?.members ?? [],
    total: data?.total ?? 0,
    loading,
    error,
  };
}
