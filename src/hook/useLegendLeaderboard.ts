"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { APIClanMember } from "@/lib/type";

export type LegendRankDivision = "Legend League I" | "Legend League II" | "Legend League III";

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

export function useLegendLeaderboard(id: 1 | 2 | 3, refreshKey: number = 0) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LegendResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchLagends() {
      setLoading(true);
      setError(null);

      try {
        // Sesuaikan path URL API Route kamu
        const res = await fetch(`/api/leagues/legends/${id}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Gagal mengambil data liga");

        const result = await res.json();
        setData(result);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Terjadi kesalahan");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchLagends();
    return () => controller.abort();
  }, [id, refreshKey]);
  return {
    members: data?.members ?? [],
    total: data?.total ?? 0,
    loading,
    error,
  };
}
