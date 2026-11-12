"use client";

import Image from "next/image";
import { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaSearch,
  FaShieldAlt,
  FaStar,
  FaSyncAlt,
  FaTrophy,
} from "react-icons/fa";
import { GiSwordClash } from "react-icons/gi";
import {
  LEGEND_DIVISIONS,
  useLegendLeaderboard,
} from "@/hook/useLegendLeaderboard";
import type { LegendLeaderboardMember } from "@/lib/type";

export default function LegendLeaderboard() {
  const {
    selectedDivision,
    setSelectedDivision,
    searchTerm,
    setSearchTerm,
    filteredMembers,
    counts,
    isLoading,
    lastUpdated,
    refreshData,
  } = useLegendLeaderboard();

  const [expandedTag, setExpandedTag] = useState<string | null>(null);

  const toggleExpand = (tag: string) => {
    setExpandedTag((prev) => (prev === tag ? null : tag));
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return "-";
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white">
      {/* Top Banner / Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#12244F] border border-[#2c4176] shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FaTrophy className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Legend League Leaderboard
            </h1>
          </div>
        </div>

        {/* Auto Refresh & Manual Refresh Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col text-xs text-zinc-400 bg-[#071A45] px-3 py-1.5 rounded-lg border border-[#2c4176]">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <FaClock className="text-blue-400 text-xs" />
              <span>
                Auto-refresh: <strong>12:00 AM</strong>
              </span>
            </div>
            <span className="text-[11px] text-zinc-400">
              Update: {formatLastUpdated(lastUpdated)}
            </span>
          </div>

          <button
            type="button"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-sm font-semibold transition cursor-pointer"
            title="Perbarui data statistik pemain"
          >
            <FaSyncAlt
              className={`text-xs ${isLoading ? "animate-spin" : ""}`}
            />
            <span>{isLoading ? "Memperbarui..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Division Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Division Filter Tabs */}
        <div className="flex items-center gap-2 bg-[#12244F] p-1.5 rounded-xl border border-[#2c4176] overflow-x-auto">
          {LEGEND_DIVISIONS.map((div) => {
            const isSelected = selectedDivision === div.key;
            const count = counts[div.key] || 0;
            return (
              <button
                type="button"
                key={div.key}
                onClick={() => setSelectedDivision(div.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-zinc-300 hover:bg-[#18316b] hover:text-white"
                }`}
              >
                <span>{div.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[#071A45] text-zinc-400 border border-[#2c4176]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <FaSearch className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama player atau tag..."
            className="w-full pl-9 pr-8 py-2 bg-[#12244F] border border-[#2c4176] rounded-xl text-sm placeholder:text-zinc-500 focus:outline-none focus:border-blue-400 text-white transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Leaderboard Table / Card List */}
      <div className="bg-[#12244F] rounded-xl border border-[#2c4176] shadow-lg overflow-hidden">
        {/* Table Header (Desktop) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-5 py-3.5 bg-[#0b1c46] border-b border-[#2c4176] text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-4">Player & Clan</div>
          <div className="col-span-2 text-right">Trofi (Trophies)</div>
          <div className="col-span-2 text-center">Serangan (Attacks)</div>
          <div className="col-span-2 text-center">Pertahanan (Defenses)</div>
          <div className="col-span-1 text-center">Detail</div>
        </div>

        {/* Member Items */}
        <div className="divide-y divide-[#1e3466]">
          {isLoading && filteredMembers.length === 0 ? (
            <div className="p-12 text-center">
              <FaSyncAlt className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-zinc-400">
                Memuat data leaderboard & statistik...
              </p>
            </div>
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <MemberRow
                key={member.tag}
                member={member}
                isExpanded={expandedTag === member.tag}
                onToggle={() => toggleExpand(member.tag)}
              />
            ))
          ) : (
            <div className="p-12 text-center text-sm text-zinc-400">
              {searchTerm ? (
                <>
                  Tidak ada pemain yang cocok dengan kata kunci &quot;
                  {searchTerm}&quot; di {selectedDivision}
                </>
              ) : (
                <>Belum ada data anggota untuk divisi {selectedDivision}</>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MemberRowProps {
  member: LegendLeaderboardMember;
  isExpanded: boolean;
  onToggle: () => void;
}

function MemberRow({ member, isExpanded, onToggle }: MemberRowProps) {
  const rank = member.rankPosition ?? 0;
  const stats = member.legendStats;
  const details = member.legendDetails;

  // Rank styling badge
  const getRankBadge = (pos: number) => {
    if (pos === 1) {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-slate-900 font-extrabold text-xs shadow-md shadow-amber-500/20 border border-amber-200">
          1
        </span>
      );
    }
    if (pos === 2) {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 font-extrabold text-xs shadow-md border border-slate-100">
          2
        </span>
      );
    }
    if (pos === 3) {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 font-extrabold text-xs shadow-md border border-amber-500">
          3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#071A45] text-zinc-300 font-bold text-xs border border-[#2c4176]">
        {pos}
      </span>
    );
  };

  return (
    <div
      className={`transition-colors ${isExpanded ? "bg-[#18316b]/40" : "hover:bg-[#18316b]/20"}`}
    >
      {/* Row Main Content */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left cursor-pointer px-4 sm:px-5 py-3.5 flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:items-center"
      >
        {/* Mobile top bar: Rank & Player info */}
        <div className="flex items-center justify-between lg:contents">
          {/* Rank Badge */}
          <div className="lg:col-span-1 flex items-center lg:justify-center">
            {getRankBadge(rank)}
          </div>

          {/* Player Name & Tag */}
          <div className="lg:col-span-4 flex items-center gap-3">
            {member.leagueTier?.iconUrls?.small && (
              <div className="relative w-8 h-8 shrink-0">
                <Image
                  src={member.leagueTier.iconUrls.small}
                  alt={member.leagueTier.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm sm:text-base text-zinc-100 truncate">
                  {member.name || "Tanpa Nama"}
                </p>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#071A45] border border-[#2c4176] text-blue-300">
                  TH {member.townHallLevel}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <span>{member.tag}</span>
              </div>
            </div>
          </div>

          {/* Mobile Right: Trophies summary */}
          <div className="lg:hidden flex items-center gap-2">
            <span className="font-bold text-amber-400 text-sm flex items-center gap-1">
              <FaTrophy className="text-xs" />
              {member.trophies?.toLocaleString() ?? 0}
            </span>
            <span className="text-zinc-400 p-1" aria-hidden="true">
              {isExpanded ? (
                <FaChevronUp className="w-3 h-3" />
              ) : (
                <FaChevronDown className="w-3 h-3" />
              )}
            </span>
          </div>
        </div>

        {/* Trophies (Desktop) */}
        <div className="hidden lg:flex lg:col-span-2 items-center justify-end gap-1.5 font-bold text-amber-400 text-sm">
          <FaTrophy className="text-xs" />
          <span>{member.trophies?.toLocaleString() ?? 0}</span>
        </div>

        {/* Attack Stats */}
        <div className="lg:col-span-2 flex items-center justify-between lg:justify-center gap-2 text-xs py-1 px-2.5 rounded bg-[#071A45]/60 border border-[#2c4176]/50 lg:border-none lg:bg-transparent">
          <span className="lg:hidden text-zinc-400 flex items-center gap-1">
            <GiSwordClash className="text-emerald-400" /> Serangan
          </span>
          <div className="text-right lg:text-center">
            <div className="flex items-center gap-1.5 justify-end lg:justify-center">
              <span className="font-semibold text-zinc-200">
                {stats?.attacks} atk
              </span>
              <span className="text-emerald-400 font-medium">
                ({stats?.attackTriples} ⭐⭐⭐)
              </span>
            </div>
            {typeof stats?.averageOffense === "number" && (
              <div className="text-[11px] text-emerald-400 font-mono">
                +{stats.averageOffense.toFixed(1)} avg pts
              </div>
            )}
          </div>
        </div>

        {/* Defense Stats */}
        <div className="lg:col-span-2 flex items-center justify-between lg:justify-center gap-2 text-xs py-1 px-2.5 rounded bg-[#071A45]/60 border border-[#2c4176]/50 lg:border-none lg:bg-transparent">
          <span className="lg:hidden text-zinc-400 flex items-center gap-1">
            <FaShieldAlt className="text-rose-400" /> Bertahan
          </span>
          <div className="text-right lg:text-center">
            {stats &&
            stats.defenses !== undefined &&
            stats.defenses !== null ? (
              <div className="flex items-center gap-1.5 justify-end lg:justify-center">
                <span className="font-semibold text-zinc-200">
                  {stats.defenses} def
                </span>
                <span className="text-rose-400 font-medium">
                  ({stats.defenseTriples ?? 0} ⭐⭐⭐)
                </span>
              </div>
            ) : (
              <span className="text-zinc-500">-</span>
            )}
            {typeof stats?.averageDefense === "number" && (
              <div className="text-[11px] text-rose-400 font-mono">
                {stats.averageDefense.toFixed(1)} avg pts
              </div>
            )}
          </div>
        </div>

        {/* Detail Toggle Icon (Desktop) */}
        <div className="hidden lg:flex lg:col-span-1 justify-center text-zinc-400">
          {isExpanded ? (
            <FaChevronUp className="w-3.5 h-3.5" />
          ) : (
            <FaChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {/* Expanded Detail Panel */}
      {isExpanded && (
        <div className="px-4 sm:px-6 pb-4 pt-1 bg-[#091a45] border-t border-[#1e3466] text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3">
            {/* Offense Breakdown Card */}
            <div className="p-3 rounded-lg bg-[#12244F] border border-[#2c4176]">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-2">
                <GiSwordClash className="w-4 h-4" />
                <span>Rincian Serangan (Offense)</span>
              </div>
              {stats?.offenseStars ? (
                <div className="space-y-1.5 text-zinc-300">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-amber-300">
                      <FaStar /> 3 Bintang (Triples):
                    </span>
                    <span className="font-bold text-white">
                      {stats.offenseStars.three}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-zinc-300">
                      <FaStar /> 2 Bintang:
                    </span>
                    <span className="font-bold text-white">
                      {stats.offenseStars.two}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <FaStar /> 1 Bintang:
                    </span>
                    <span className="font-bold text-white">
                      {stats.offenseStars.one}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">0 Bintang (Gagal):</span>
                    <span className="font-bold text-white">
                      {stats.offenseStars.zero}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500">
                  Statistik serangan belum tersedia untuk season ini.
                </p>
              )}
            </div>

            {/* Defense Breakdown Card */}
            <div className="p-3 rounded-lg bg-[#12244F] border border-[#2c4176]">
              <div className="flex items-center gap-1.5 font-semibold text-rose-400 mb-2">
                <FaShieldAlt className="w-4 h-4" />
                <span>Rincian Bertahan (Defense)</span>
              </div>
              {stats?.defenseStars ? (
                <div className="space-y-1.5 text-zinc-300">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-rose-400">
                      <FaStar /> Terkena 3 Bintang:
                    </span>
                    <span className="font-bold text-white">
                      {stats.defenseStars.three}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-zinc-300">
                      <FaStar /> Terkena 2 Bintang:
                    </span>
                    <span className="font-bold text-white">
                      {stats.defenseStars.two}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <FaStar /> Terkena 1 Bintang:
                    </span>
                    <span className="font-bold text-white">
                      {stats.defenseStars.one}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-400">
                      Pertahanan Sempurna (0⭐):
                    </span>
                    <span className="font-bold text-white">
                      {stats.defenseStars.zero}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500">
                  Statistik bertahan belum tersedia untuk season ini.
                </p>
              )}
            </div>

            {/* Favorite Troops & Army Groups */}
            <div className="p-3 rounded-lg bg-[#12244F] border border-[#2c4176] md:col-span-2 lg:col-span-1">
              <div className="font-semibold text-blue-400 mb-2">
                <span>Pasukan & Komposisi Favorit</span>
              </div>
              {details?.favoriteTroops && details.favoriteTroops.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-zinc-400">
                    Pasukan sering digunakan:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {details.favoriteTroops.slice(0, 4).map((t) => (
                      <span
                        key={t.id}
                        className="px-2 py-0.5 rounded bg-[#071A45] border border-[#2c4176] text-[11px] text-zinc-200"
                      >
                        {t.name} ({t.attacks}x)
                      </span>
                    ))}
                  </div>

                  {details.armyGroups && details.armyGroups.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#2c4176]">
                      <p className="text-[11px] text-zinc-400">
                        Komposisi Utama:
                      </p>
                      <p className="text-xs text-zinc-200 truncate font-mono">
                        {details.armyGroups[0].name}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-500">
                  Informasi formasi belum terdata.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
