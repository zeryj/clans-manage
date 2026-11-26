"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import Switch from "@/components/Switch";
import {
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaShieldAlt,
  FaSortAmountDown,
  FaSyncAlt,
  FaTrophy,
  FaStar,
} from "react-icons/fa";
import { GiSwordClash } from "react-icons/gi";
import {
  type LegendMember,
  useLegendLeaderboard,
} from "@/hook/useLegend1Leaderboard";
import Link from "next/link";

export type SortOption = "trophies" | "atk" | "def";

export default function LegendLeaderboard() {
  const [selectedId, setSelectedId] = useState<1 | 2 | 3>(1);
  const [sortBy, setSortBy] = useState<SortOption>("trophies");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTag, setExpandedTag] = useState<string | null>(null);

  const handleDivisionChange = (id: 1 | 2 | 3) => {
    setSelectedId(id);
    setExpandedTag(null);
    if (id === 1 && (sortBy === "atk" || sortBy === "def")) {
      setSortBy("trophies");
    }
  };

  const { members, total, loading, isFetching, error, refetch } =
    useLegendLeaderboard(1);

  const getAtkTrophies = (m: LegendMember) =>
    Number(
      m.stat?.attackTrophies ??
        m.stat?.attack?.trophies ??
        m.rankedHistory?.items?.[0]?.attackTrophies ??
        0,
    );

  const getDefTrophies = (m: LegendMember) =>
    Number(
      m.stat?.defenseTrophies ??
        m.stat?.defense?.trophies ??
        m.rankedHistory?.items?.[0]?.defenseTrophies ??
        0,
    );

  const processedMembers = useMemo(() => {
    let list = [...members];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.tag.toLowerCase().includes(query),
      );
    }

    list.sort((a, b) => {
      if (sortBy === "atk") {
        const atkA = getAtkTrophies(a);
        const atkB = getAtkTrophies(b);
        if (atkB !== atkA) return atkB - atkA;
        return (b.trophies ?? 0) - (a.trophies ?? 0);
      }
      if (sortBy === "def") {
        const defA = getDefTrophies(a);
        const defB = getDefTrophies(b);
        if (defB !== defA) return defB - defA;
        return (b.trophies ?? 0) - (a.trophies ?? 0);
      }
      return (b.trophies ?? 0) - (a.trophies ?? 0);
    });

    return list;
  }, [members, searchTerm, sortBy]);

  const toggleExpand = (tag: string) => {
    setExpandedTag((prev) => (prev === tag ? null : tag));
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Single Division Badge */}
          <div className="flex items-center bg-[#12244F] p-1.5 rounded-xl border border-[#2c4176] overflow-x-auto">
            <Switch total={total} />
          </div>
        </div>

        {/* Second Row: Sort Controls & Search Input */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Sort Controls */}
          <div className="flex items-center gap-1.5 bg-[#12244F] p-1.5 rounded-xl border border-[#2c4176] text-xs overflow-x-auto">
            <span className="px-2 text-zinc-400 flex items-center gap-1 font-medium whitespace-nowrap">
              <FaSortAmountDown className="w-3 h-3 text-blue-400" />
              <span>Urutan:</span>
            </span>

            <button
              type="button"
              onClick={() => setSortBy("trophies")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium cursor-pointer whitespace-nowrap ${
                sortBy === "trophies"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                  : "text-zinc-300 hover:text-white hover:bg-[#18316b]"
              }`}
            >
              <FaTrophy className="text-xs" />
              <span>Trofi Total</span>
            </button>

            <button
              type="button"
              onClick={() => setSortBy("atk")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium cursor-pointer whitespace-nowrap ${
                sortBy === "atk"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                  : "text-zinc-300 hover:text-white hover:bg-[#18316b]"
              }`}
              title="Urutkan Trofi Serangan Terbanyak ke Terkecil"
            >
              <GiSwordClash className="text-emerald-400 text-xs" />
              <span>Trofi Serangan</span>
            </button>

            <button
              type="button"
              onClick={() => setSortBy("def")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium cursor-pointer whitespace-nowrap ${
                sortBy === "def"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm"
                  : "text-zinc-300 hover:text-white hover:bg-[#18316b]"
              }`}
              title="Urutkan Trofi Pertahanan Terbanyak ke Terkecil"
            >
              <FaShieldAlt className="text-rose-400 text-xs" />
              <span>Trofi Pertahanan</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-sm">
          Terjadi kesalahan saat memuat data: {error}
        </div>
      )}

      {/* Leaderboard Table / Card List */}
      <div className="bg-[#12244F] rounded-xl border border-[#2c4176] shadow-lg overflow-hidden">
        {/* Table Header (Desktop) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-5 py-3.5 bg-[#0b1c46] border-b border-[#2c4176] text-xs font-semibold text-zinc-400 uppercase tracking-wider select-none">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-4">Player & Tag</div>
          <button
            type="button"
            onClick={() => setSortBy("trophies")}
            className={`col-span-2 flex items-center justify-end gap-1.5 hover:text-white transition cursor-pointer ${
              sortBy === "trophies" ? "text-amber-400 font-bold" : ""
            }`}
            title="Urutkan berdasarkan Total Trofi"
          >
            <span>Trofi (Trophies)</span>
            <FaSortAmountDown
              className={`w-3 h-3 ${
                sortBy === "trophies"
                  ? "opacity-100 text-amber-400"
                  : "opacity-30"
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => setSortBy("atk")}
            className={`col-span-2 flex items-center justify-center gap-1.5 hover:text-white transition cursor-pointer ${
              sortBy === "atk" ? "text-emerald-400 font-bold" : ""
            }`}
            title="Urutkan Trofi Serangan Terbanyak"
          >
            <GiSwordClash className="text-emerald-400" />
            <span>Serangan (Attacks)</span>
            <FaSortAmountDown
              className={`w-3 h-3 ${
                sortBy === "atk" ? "opacity-100 text-emerald-400" : "opacity-30"
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => setSortBy("def")}
            className={`col-span-2 flex items-center justify-center gap-1.5 hover:text-white transition cursor-pointer ${
              sortBy === "def" ? "text-rose-400 font-bold" : ""
            }`}
            title="Urutkan Trofi Pertahanan Terbanyak"
          >
            <FaShieldAlt className="text-rose-400" />
            <span>Pertahanan (Defenses)</span>
            <FaSortAmountDown
              className={`w-3 h-3 ${
                sortBy === "def" ? "opacity-100 text-rose-400" : "opacity-30"
              }`}
            />
          </button>
          <div className="col-span-1 text-center">Detail</div>
        </div>

        {/* Member Items */}
        <div className="divide-y divide-[#1e3466]">
          {loading ? (
            <div className="p-12 text-center">
              <FaSyncAlt className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-zinc-400">
                Memuat data Legend League I...
              </p>
            </div>
          ) : processedMembers.length > 0 ? (
            processedMembers.map((member, index) => (
              <MemberRow
                key={member.tag}
                rank={index + 1}
                member={member}
                sortBy={sortBy}
                isExpanded={expandedTag === member.tag}
                onToggle={() => toggleExpand(member.tag)}
              />
            ))
          ) : (
            <div className="p-12 text-center text-sm text-zinc-400">
              {searchTerm ? (
                <>
                  Tidak ada pemain yang cocok dengan kata kunci &quot;
                  {searchTerm}&quot;
                </>
              ) : (
                <>Belum ada data anggota untuk Legend League I</>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MemberRowProps {
  rank: number;
  member: LegendMember;
  isExpanded: boolean;
  sortBy: SortOption;
  onToggle: () => void;
}

function MemberRow({
  rank,
  member,
  isExpanded,
  sortBy,
  onToggle,
}: MemberRowProps) {
  const latestDay = member.rankedHistory?.items?.[0];

  const statObj =
    member.stat && !Array.isArray(member.stat) ? member.stat : null;

  const atkTrophies =
    statObj?.attackTrophies ??
    statObj?.attack?.trophies ??
    latestDay?.attackTrophies ??
    0;
  const atkCount = statObj?.attacks ?? latestDay?.attacks ?? 0;
  const avgAtkStars = statObj?.avgAttackStars ?? statObj?.attack?.stars;
  const avgAtkDest =
    statObj?.avgAttackDestruction ?? statObj?.attack?.destruction;

  const defTrophies =
    statObj?.defenseTrophies ??
    statObj?.defense?.trophies ??
    latestDay?.defenseTrophies ??
    0;
  const defCount = statObj?.defenses ?? latestDay?.defenses ?? 0;
  const avgDefStars = statObj?.avgDefenseStars ?? statObj?.defense?.stars;
  const avgDefDest =
    statObj?.avgDefenseDestruction ?? statObj?.defense?.destruction;

  const getRankBadge = (pos: number) => {
    if (pos === 1) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-slate-900 font-extrabold text-xs shadow-md shadow-amber-500/20 border border-amber-200">
          1
        </span>
      );
    }
    if (pos === 2) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 font-extrabold text-xs shadow-md border border-slate-100">
          2
        </span>
      );
    }
    if (pos === 3) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 font-extrabold text-xs shadow-md border border-amber-500">
          3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#071A45] text-zinc-300 font-bold text-xs border border-[#2c4176]">
        {pos}
      </span>
    );
  };

  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggleExpand = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  return (
    <div
      className={`transition-colors ${
        isExpanded ? "bg-[#18316b]/40" : "hover:bg-[#18316b]/20"
      }`}
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
                  alt={member.leagueTier.name || "League Icon"}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-sm sm:text-base text-zinc-100 truncate">
                {member.name || "Tanpa Nama"}
              </p>
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
        <div
          className={`hidden lg:flex lg:col-span-2 items-center justify-end gap-1.5 font-bold text-sm py-1 px-2 rounded transition ${
            sortBy === "trophies"
              ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
              : "text-amber-400"
          }`}
        >
          <FaTrophy className="text-xs" />
          <span>{member.trophies?.toLocaleString() ?? 0}</span>
        </div>

        {/* Attack Stats */}
        <div
          className={`lg:col-span-2 flex items-center justify-between lg:justify-center gap-2 text-xs py-1 px-2.5 rounded transition ${
            sortBy === "atk"
              ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
              : "bg-[#071A45]/60 border border-[#2c4176]/50 lg:border-none lg:bg-transparent"
          }`}
        >
          <span className="lg:hidden text-zinc-400 flex items-center gap-1">
            <GiSwordClash className="text-emerald-400" /> Serangan
          </span>
          <div className="text-right lg:text-center">
            <div className="flex items-center gap-1.5 justify-end lg:justify-center">
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                <FaTrophy className="text-xs" />+{member.totalattackTrophies}
              </span>
              <span className="font-semibold text-zinc-200">
                {atkCount} atk
              </span>
            </div>
          </div>
        </div>

        {/* Defense Stats */}
        <div
          className={`lg:col-span-2 flex items-center justify-between lg:justify-center gap-2 text-xs py-1 px-2.5 rounded transition ${
            sortBy === "def"
              ? "bg-rose-500/15 border border-rose-500/40 text-rose-300"
              : "bg-[#071A45]/60 border border-[#2c4176]/50 lg:border-none lg:bg-transparent"
          }`}
        >
          <span className="lg:hidden text-zinc-400 flex items-center gap-1">
            <FaShieldAlt className="text-rose-400" /> Bertahan
          </span>
          <div className="text-right lg:text-center">
            <div className="flex items-center gap-1.5 justify-end lg:justify-center">
              <span className="flex items-center gap-1 text-rose-400 font-bold text-sm">
                <FaTrophy className="text-xs" />
                {member.totaldefenseTrophies}
              </span>
              <span className="font-semibold text-zinc-200">
                {defCount} def
              </span>
              {avgDefStars !== undefined && (
                <span className="text-rose-400 font-medium">
                  ({Number(avgDefStars).toFixed(2)} ⭐ avg)
                </span>
              )}
            </div>
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
        <div className="px-4 sm:px-6 pb-4 pt-1 bg-[#091a45] border-t border-[#1e3466] text-xs w-full">
          {member.error ? (
            <p className="pt-3 text-rose-400">{member.error}</p>
          ) : (
            <div className="w-full cursor-pointer py-3.5">
              {/* Mobile top bar: Rank & Player info */}
              <div className="divide-y divide-[#1e3466]/60">
                {member.rankedHistory?.items &&
                member.rankedHistory.items.length > 0 ? (
                  member.rankedHistory.items.map((item) => {
                    const netTrophies = item.trophies ?? 0;
                    const rowKey = `${member.tag}-${item.day}`;
                    const isDayExpanded = expandedKey === rowKey;

                    const dayDetail = member?.rankday?.find(
                      (r: any) => r.day === item.day,
                    );
                    const rawLog = dayDetail?.battlelog;

                    const attacks = rawLog?.attacks ?? [];
                    const defenses = rawLog?.defenses ?? [];

                    const battles = [...attacks, ...defenses].sort((a, b) =>
                      (b.time ?? "").localeCompare(a.time ?? ""),
                    );

                    return (
                      <div key={item.day} className="transition-colors">
                        {/* Baris Utama (Klik untuk Expand/Collapse) */}
                        <div
                          onClick={() => toggleExpand(rowKey)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleExpand(rowKey);
                            }
                          }}
                          className={`py-2.5 ps-5 pe-3 grid grid-cols-3 lg:grid-cols-12 gap-3 lg:items-center cursor-pointer select-none transition ${
                            isDayExpanded
                              ? "bg-[#18316b]/35"
                              : "hover:bg-[#18316b]/20"
                          }`}
                        >
                          {/* Tanggal & Mobile Net Trophies */}
                          <div className="flex items-center justify-between col-span-2 lg:col-span-5 w-full">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-200 font-mono">
                              <span>{item.day}</span>
                            </div>

                            {/* Mobile Right: Net Trophies hari itu */}
                            <div className="lg:hidden flex items-center gap-1">
                              <span
                                className={`font-bold text-sm flex items-center gap-1 ${
                                  netTrophies >= 0
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }`}
                              >
                                <FaTrophy className="text-xs" />
                                {netTrophies > 0
                                  ? `+${netTrophies}`
                                  : netTrophies}
                              </span>
                            </div>
                          </div>

                          {/* Net Trophies (Desktop) */}
                          <div
                            className={`hidden lg:flex lg:col-span-2 items-center justify-end gap-1.5 font-bold text-sm py-1 px-2 rounded ${
                              netTrophies >= 0
                                ? "text-emerald-400"
                                : "text-rose-400"
                            }`}
                          >
                            <FaTrophy className="text-xs" />
                            <span>
                              {netTrophies > 0
                                ? `+${netTrophies}`
                                : netTrophies}
                            </span>
                          </div>

                          <div className="col-span-5 border-s border-[#2c4176]/50 lg:border-none  p-2 grid grid-cols-5">
                            {/* Attack Stats Harian */}
                            <div className="col-span-2 flex items-center justify-between lg:justify-center gap-2 text-xs rounded ">
                              <div className="flex items-center gap-1.5 justify-end lg:justify-center">
                                <span className="text-zinc-400 flex items-center gap-1 lg:hidden">
                                  <GiSwordClash className="text-emerald-400" />
                                </span>
                                <span className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                                  <FaTrophy className="text-xs" />+
                                  {item.attackTrophies ?? 0}
                                </span>
                                <span className="font-semibold text-zinc-200 hidden lg:block">
                                  {item.attacks ?? 0}/8 atk
                                </span>
                              </div>
                            </div>

                            {/* Defense Stats Harian */}
                            <div className="col-span-2 flex items-center justify-between lg:justify-center gap-2 text-xs rounded ">
                              <div className="flex items-center gap-1.5 justify-end lg:justify-center">
                                <span className="text-zinc-400 flex items-center gap-1 lg:hidden">
                                  <FaShieldAlt className="text-rose-400" />
                                </span>
                                <span className="flex items-center gap-1 text-rose-400 font-bold text-sm">
                                  <FaTrophy className="text-xs" />
                                  {item.defenseTrophies ?? 0}
                                </span>
                                <span className="font-semibold text-zinc-200 hidden lg:block">
                                  {item.defenses ?? 0}/8 def
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-center items-center">
                              <FaChevronDown
                                className={`text-[10px] text-zinc-400 transition-transform duration-200 ${
                                  isDayExpanded ? "rotate-180 text-sky-400" : ""
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Konten Expanded: Detail Battlelog */}
                        {isDayExpanded && (
                          <div className="bg-[#061436]/80 border-t border-[#1e3466]/50 px-5 py-3.5">
                            {attacks.length > 0 || defenses.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between pb-1.5 border-b border-[#1e3466]/70">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                      <GiSwordClash className="text-sm" />
                                      Attack ({attacks.length})
                                    </span>
                                  </div>

                                  {attacks.length > 0 ? (
                                    <div className="space-y-1.5">
                                      {attacks.map((battle, idx) => {
                                        const formattedTime = battle.time
                                          ? new Date(
                                              battle.time,
                                            ).toLocaleTimeString("id-ID", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : null;
                                        const trophies = battle.trophies ?? 0;

                                        return (
                                          <div
                                            key={`atk-${battle.time ?? idx}-${idx}`}
                                            className={`flex items-center justify-between px-3 py-2 rounded ${battle.stars === 3 ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300" : "bg-[#071A45] text-zinc-300"} text-xs`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                                                <GiSwordClash className="text-sm" />
                                                Attack
                                              </span>
                                              {formattedTime && (
                                                <span className="text-[11px] text-zinc-400 font-mono">
                                                  {formattedTime}
                                                </span>
                                              )}
                                            </div>

                                            <div className="flex items-center gap-3 text-zinc-200 font-mono">
                                              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                                {battle.stars ?? 0}
                                                <FaStar className="text-[11px]" />
                                              </span>
                                              <span>
                                                {battle.destruction ?? 0}%
                                              </span>
                                            </div>

                                            <div className="font-bold flex items-center gap-1 text-emerald-400">
                                              <FaTrophy className="text-[10px]" />
                                              <span>
                                                {trophies > 0
                                                  ? `+${trophies}`
                                                  : trophies}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-zinc-500 text-xs py-3 text-center bg-[#0a1d4a]/40 rounded border border-[#1e3466]/30">
                                      Belum ada data serangan.
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center justify-between pb-1.5 border-b border-[#1e3466]/70">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
                                      <FaShieldAlt className="text-xs" />
                                      Defense ({defenses.length})
                                    </span>
                                  </div>

                                  {defenses.length > 0 ? (
                                    <div className="space-y-1.5">
                                      {defenses.map((battle, idx) => {
                                        const formattedTime = battle.time
                                          ? new Date(
                                              battle.time,
                                            ).toLocaleTimeString("id-ID", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : null;
                                        const trophies = battle.trophies ?? 0;

                                        return (
                                          <div
                                            key={`def-${battle.time ?? idx}-${idx}`}
                                            className={`flex items-center justify-between px-3 py-2 rounded  ${battle.stars === 3 ? "bg-rose-500/15 border border-rose-500/40 text-rose-300" : "bg-[#071A45] text-zinc-300"} text-xs`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="flex items-center gap-1 text-rose-400 font-semibold">
                                                <FaShieldAlt className="text-xs" />
                                                Defense
                                              </span>
                                              {formattedTime && (
                                                <span className="text-[11px] text-zinc-400 font-mono">
                                                  {formattedTime}
                                                </span>
                                              )}
                                            </div>

                                            <div className="flex items-center gap-3 text-zinc-200 font-mono">
                                              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                                {battle.stars ?? 0}
                                                <FaStar className="text-[11px]" />
                                              </span>
                                              <span>
                                                {battle.destruction ?? 0}%
                                              </span>
                                            </div>

                                            <div className="font-bold flex items-center gap-1 text-rose-400">
                                              <FaTrophy className="text-[10px]" />
                                              <span>
                                                {trophies > 0
                                                  ? `+${trophies}`
                                                  : trophies}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-zinc-500 text-xs py-3 text-center bg-[#0a1d4a]/40 rounded border border-[#1e3466]/30">
                                      Belum ada data pertahanan.
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="text-center text-zinc-500 text-xs py-2">
                                Detail battlelog tidak tersedia untuk tanggal
                                ini.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="py-3 text-center text-zinc-500 text-xs">
                    Belum ada riwayat harian Legend League.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
