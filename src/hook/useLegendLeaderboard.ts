"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LegendLeaderboardMember } from "@/lib/type";

export type LegendRankDivision = "Legend I" | "Legend II" | "Legend III";

export interface DivisionMeta {
  key: LegendRankDivision;
  label: string;
  shortLabel: string;
  badgeNumber: number;
}

export const LEGEND_DIVISIONS: DivisionMeta[] = [
  { key: "Legend I", label: "Legend 1", shortLabel: "L1", badgeNumber: 1 },
  { key: "Legend II", label: "Legend 2", shortLabel: "L2", badgeNumber: 2 },
  { key: "Legend III", label: "Legend 3", shortLabel: "L3", badgeNumber: 3 },
];

export function normalizeDivisionName(
  tierName?: string,
): LegendRankDivision | null {
  if (!tierName) return null;
  const upper = tierName.trim().toUpperCase();
  if (upper === "LEGEND I" || upper === "LEGEND 1") return "Legend I";
  if (upper === "LEGEND II" || upper === "LEGEND 2") return "Legend II";
  if (upper === "LEGEND III" || upper === "LEGEND 3") return "Legend III";
  return null;
}

export function useLegendLeaderboard() {
  const [members, setMembers] = useState<LegendLeaderboardMember[]>([]);
  const [selectedDivision, setSelectedDivision] =
    useState<LegendRankDivision>("Legend I");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const lastAutoRefreshDateRef = useRef<string>("");

  // Fetch data function
  const fetchData = useCallback(async (isManualRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `/api/leagues/members${isManualRefresh ? "?refresh=true" : ""}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Gagal mengambil data (Status: ${res.status})`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        setMembers(data.members);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.error || "Format respons tidak valid");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Gagal memuat data";
      console.error("Gagal memuat data leaderboard legend:", errMsg);
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Auto-refresh schedule for 12:00 PM (12 siang)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const scheduleNext12PM = () => {
      const now = new Date();
      const target = new Date(now);
      target.setHours(12, 0, 0, 0);

      // Jika waktu sekarang sudah lewat jam 12 siang hari ini, jadwalkan untuk besok jam 12 siang
      if (now.getTime() >= target.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const delay = target.getTime() - now.getTime();

      timeoutId = setTimeout(() => {
        const todayDateStr = new Date().toDateString();
        lastAutoRefreshDateRef.current = todayDateStr;
        console.log(
          "[Auto-Refresh] Menjalankan refresh otomatis pukul 12:00 siang",
        );
        fetchData(true);
        scheduleNext12PM(); // Jadwalkan hari berikutnya
      }, delay);
    };

    scheduleNext12PM();

    // Interval checker fallback setiap 30 detik (untuk menangani device sleep/wake)
    intervalId = setInterval(() => {
      const now = new Date();
      const todayDateStr = now.toDateString();

      // Jika jam 12 siang (antara 12:00:00 dan 12:00:59) dan belum auto-refresh hari ini
      if (
        now.getHours() === 12 &&
        now.getMinutes() === 0 &&
        lastAutoRefreshDateRef.current !== todayDateStr
      ) {
        lastAutoRefreshDateRef.current = todayDateStr;
        console.log(
          "[Auto-Refresh Interval] Terdeteksi jam 12:00 siang, memperbarui data...",
        );
        fetchData(true);
      }
    }, 30000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchData]);

  // Group members by division and sort by trophies descending
  const divisionRankings = useMemo(() => {
    const grouped: Record<LegendRankDivision, LegendLeaderboardMember[]> = {
      "Legend I": [],
      "Legend II": [],
      "Legend III": [],
    };

    for (const member of members) {
      const div = normalizeDivisionName(member.leagueTier?.name);
      if (div && grouped[div]) {
        grouped[div].push(member);
      }
    }

    // Sort each division from highest to lowest trophies
    for (const divKey of [
      "Legend I",
      "Legend II",
      "Legend III",
    ] as LegendRankDivision[]) {
      grouped[divKey].sort((a, b) => {
        const trophiesA = a.trophies ?? 0;
        const trophiesB = b.trophies ?? 0;
        if (trophiesB !== trophiesA) {
          return trophiesB - trophiesA; // Tertinggi ke terendah
        }
        // Fallback urutan: serang triples terbanyak
        const triplesA = a.legendStats?.attackTriples ?? 0;
        const triplesB = b.legendStats?.attackTriples ?? 0;
        return triplesB - triplesA;
      });

      // Beri peringkat posisi (1, 2, 3...)
      grouped[divKey] = grouped[divKey].map((m, idx) => ({
        ...m,
        rankPosition: idx + 1,
      }));
    }

    return grouped;
  }, [members]);

  // Filter based on active division and search term
  const filteredMembers = useMemo(() => {
    const activeList = divisionRankings[selectedDivision] || [];
    const query = searchTerm.trim().toLowerCase();
    if (!query) return activeList;

    const cleanQuery = query.startsWith("#") ? query.slice(1) : query;

    return activeList.filter((m) => {
      const nameMatch = (m.name || "").toLowerCase().includes(query);
      const cleanTag = (m.tag || "").toLowerCase().replace("#", "");
      const tagMatch = cleanTag.includes(cleanQuery);
      const clanMatch = (m.clanName || "").toLowerCase().includes(query);
      return nameMatch || tagMatch || clanMatch;
    });
  }, [divisionRankings, selectedDivision, searchTerm]);

  // Counts per division
  const counts = useMemo(() => {
    return {
      "Legend I": divisionRankings["Legend I"].length,
      "Legend II": divisionRankings["Legend II"].length,
      "Legend III": divisionRankings["Legend III"].length,
      total: members.length,
    };
  }, [divisionRankings, members.length]);

  return {
    members,
    selectedDivision,
    setSelectedDivision,
    searchTerm,
    setSearchTerm,
    filteredMembers,
    counts,
    isLoading,
    error,
    lastUpdated,
    refreshData: () => fetchData(true),
  };
}
