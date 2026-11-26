"use client";

import { useQuery } from "@tanstack/react-query";

export type LegendRankDivision =
  | "Legend League I"
  | "Legend League II"
  | "Legend League III";

export interface LegendLeagueTier {
  id: number;
  name: string;
  iconUrls?: {
    small?: string;
    medium?: string;
    large?: string;
  };
}

export interface LegendDaySummary {
  day: string;
  attacks: number;
  defenses: number;
  recordedDefenses?: number;
  automaticDefenses?: number;
  closingTrophies?: number | null;
  globalRank?: number | null;
  attackTrophies: number;
  defenseTrophies: number;
  trophies: number;
}

export interface LegendBattleLogItem {
  type?: "attack" | "defense" | string;
  stars?: number;
  destruction?: number;
  destructionPercentage?: number;
  trophies?: number;
  opponentTag?: string;
  opponentName?: string;
  timestamp?: string;
}

export interface LegendRankDay {
  day: string;
  battlelog:
    | {
        items?: LegendBattleLogItem[];
      }
    | LegendBattleLogItem[]
    | null;
}

export interface LegendSeasonStat {
  attack?: {
    stars?: number;
    destruction?: number;
    trophies?: number;
  };
  defense?: {
    stars?: number;
    destruction?: number;
    trophies?: number;
  };
  attacks?: number;
  defenses?: number;
  attackTrophies?: number;
  defenseTrophies?: number;
  avgAttackStars?: number;
  avgAttackDestruction?: number;
  avgDefenseStars?: number;
  avgDefenseDestruction?: number;
  [key: string]: unknown;
}

export interface LegendMember {
  tag: string;
  name: string;
  trophies: number;
  leagueTier?: LegendLeagueTier;
  
  stat?: LegendSeasonStat | null;
  rankedHistory?: {
    tag: string;
    items: LegendDaySummary[];
  } | null;
  rankday?: LegendRankDay[];
  
  rankedAtk?: LegendBattleLogItem[];
  rankedDef?: LegendBattleLogItem[];
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

export function useLegendLeaderboard(id: 1 | 2 | 3) {
  const query = useQuery<LegendResponse>({
    queryKey: ["legend-leaderboard", id],
    queryFn: async ({ signal }) => {
      const res = await fetch(`/api/leagues/legends/${id}`, { signal });
      if (!res.ok) {
        throw new Error(`Gagal mengambil data liga (Status: ${res.status})`);
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, 
  });

  return {
    members: query.data?.members ?? [],
    total: query.data?.total ?? 0,
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}