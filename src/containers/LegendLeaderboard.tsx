"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaShieldAlt,
  FaSortAmountDown,
  FaStar,
  FaSyncAlt,
  FaTrophy,
} from "react-icons/fa";
import { GiSwordClash } from "react-icons/gi";
import {
  type LegendMember,
  useLegendLeaderboard,
} from "@/hook/useLegendLeaderboard";
import Switch from "@/components/Switch";
import { usePathname } from "next/navigation";


export type SortOption = "trophies" | "atk" | "def";


export default function LegendLeaderboard() {
  const pathname = usePathname();

  
  const selectedId: 1 | 2 | 3 = pathname?.startsWith("/leagues/legends/1")
    ? 1
    : pathname?.startsWith("/leagues/legends/3")
      ? 3
      : 2;


  const [sortBy, setSortBy] = useState<SortOption>("trophies");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTag, setExpandedTag] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId === 1 && sortBy !== "trophies") {
      setSortBy("trophies");
    }
  }, [selectedId, sortBy]);

  
  const { members, total, loading, isFetching, error, refetch } =
    useLegendLeaderboard(selectedId);

  
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
        const atkA = a.ThropyAtk ?? 0;
        const atkB = b.ThropyAtk ?? 0;
        if (atkB !== atkA) return atkB - atkA;
        return (b.trophies ?? 0) - (a.trophies ?? 0);
      }
      if (sortBy === "def") {
        const defA = a.ThropyDef ?? 0;
        const defB = b.ThropyDef ?? 0;
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

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white">
      {/* Controls Bar: Division Tabs, Refresh Button, Sort Controls & Search */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Division Filter Tabs */}
          <div className="flex items-center bg-[#12244F] p-1.5 rounded-xl border border-[#2c4176] overflow-x-auto">
            <Switch total={total}/>
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
              disabled={selectedId === 1}
              onClick={() => setSortBy("atk")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                selectedId === 1
                  ? "opacity-40 cursor-not-allowed text-zinc-500"
                  : sortBy === "atk"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm cursor-pointer"
                    : "text-zinc-300 hover:text-white hover:bg-[#18316b] cursor-pointer"
              }`}
              title={
                selectedId === 1
                  ? "Hanya tersedia di Divisi 2 & 3"
                  : "Urutkan Trofi Serangan Terbanyak ke Terkecil"
              }
            >
              <GiSwordClash className="text-emerald-400 text-xs" />
              <span>Trofi Serangan</span>
            </button>

            <button
              type="button"
              disabled={selectedId === 1}
              onClick={() => setSortBy("def")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                selectedId === 1
                  ? "opacity-40 cursor-not-allowed text-zinc-500"
                  : sortBy === "def"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm cursor-pointer"
                    : "text-zinc-300 hover:text-white hover:bg-[#18316b] cursor-pointer"
              }`}
              title={
                selectedId === 1
                  ? "Hanya tersedia di Divisi 2 & 3"
                  : "Urutkan Trofi Pertahanan Terbanyak ke Terkecil"
              }
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
              className={`w-3 h-3 ${sortBy === "trophies" ? "opacity-100 text-amber-400" : "opacity-30"}`}
            />
          </button>
          <button
            type="button"
            disabled={selectedId === 1}
            onClick={() => setSortBy("atk")}
            className={`col-span-2 flex items-center justify-center gap-1.5 hover:text-white transition ${
              selectedId === 1
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer"
            } ${sortBy === "atk" ? "text-emerald-400 font-bold" : ""}`}
            title={
              selectedId === 1
                ? "Hanya tersedia di Divisi 2 & 3"
                : "Urutkan Trofi Serangan Terbanyak"
            }
          >
            <GiSwordClash className="text-emerald-400" />
            <span>Serangan (Attacks)</span>
            <FaSortAmountDown
              className={`w-3 h-3 ${sortBy === "atk" ? "opacity-100 text-emerald-400" : "opacity-30"}`}
            />
          </button>
          <button
            type="button"
            disabled={selectedId === 1}
            onClick={() => setSortBy("def")}
            className={`col-span-2 flex items-center justify-center gap-1.5 hover:text-white transition ${
              selectedId === 1
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer"
            } ${sortBy === "def" ? "text-rose-400 font-bold" : ""}`}
            title={
              selectedId === 1
                ? "Hanya tersedia di Divisi 2 & 3"
                : "Urutkan Trofi Pertahanan Terbanyak"
            }
          >
            <FaShieldAlt className="text-rose-400" />
            <span>Pertahanan (Defenses)</span>
            <FaSortAmountDown
              className={`w-3 h-3 ${sortBy === "def" ? "opacity-100 text-rose-400" : "opacity-30"}`}
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
                Memuat data Legend League{" "}
                {selectedId === 1 ? "I" : selectedId === 2 ? "II" : "III"}...
              </p>
            </div>
          ) : processedMembers.length > 0 ? (
            processedMembers.map((member, index) => (
              <MemberRow
                key={member.tag}
                rank={index + 1}
                divisionId={selectedId}
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
                <>
                  Belum ada data anggota untuk Legend League{" "}
                  {selectedId === 1 ? "I" : selectedId === 2 ? "II" : "III"}
                </>
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
  divisionId: 1 | 2 | 3;
  member: LegendMember;
  isExpanded: boolean;
  sortBy: SortOption;
  onToggle: () => void;
}

function MemberRow({
  rank,
  divisionId,
  member,
  isExpanded,
  sortBy,
  onToggle,
}: MemberRowProps) {
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

        {/* Attack Stats*/}
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
            {divisionId === 2 && member.rankedAtk ? (
              <>
                <div className="flex items-center gap-1.5 justify-end lg:justify-center">
                  <span className="flex gap-2 text-amber-400 font-bold text-sm">
                    <FaTrophy className="text-xs" />
                    {member.ThropyAtk ?? 0}
                  </span>
                  <span className="font-semibold text-zinc-200">
                    {member.rankedAtk.length} / 30
                  </span>
                  <span className="text-amber-400 font-medium">
                    ({member.AvgStarAtk ?? 0} ⭐ avg)
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 font-mono">
                  {member.AvgDestructionAtk ?? 0}% avg dest
                </div>
              </>
            ) : divisionId === 3 && member.rankedAtk ? (
              <>
                <div className="flex items-center gap-1.5 justify-end lg:justify-center">
                  <span className="flex gap-2 text-amber-400 font-bold text-sm">
                    <FaTrophy className="text-xs" />
                    {member.ThropyAtk ?? 0}
                  </span>
                  <span className="font-semibold text-zinc-200">
                    {member.rankedAtk.length} / 24
                  </span>
                  <span className="text-amber-400 font-medium">
                    ({member.AvgStarAtk ?? 0} ⭐ avg)
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 font-mono">
                  {member.AvgDestructionAtk ?? 0}% avg dest
                </div>
              </>
            ) : (
              <span className="text-zinc-500">Season History</span>
            )}
          </div>
        </div>

        {/* Defense Stats*/}
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
            {divisionId === 2 && member.rankedDef ? (
              <>
                <div className="flex items-center gap-1.5 justify-end lg:justify-center">
                  <span className="flex gap-2 text-amber-400 font-bold text-sm">
                    <FaTrophy className="text-xs" />
                    {member.ThropyDef ?? 0}
                  </span>
                  <span className="font-semibold text-zinc-200">
                    {member.rankedDef.length} / 30
                  </span>
                  <span className="text-rose-400 font-medium">
                    ({member.AvgStarDef ?? 0} ⭐ avg)
                  </span>
                </div>
                <div className="text-[11px] text-rose-400 font-mono">
                  {member.AvgDestructionDef ?? 0}% avg dest
                </div>
              </>
            ) : divisionId === 3 && member.rankedDef ? (
              <>
                <div className="flex items-center gap-1.5 justify-end lg:justify-center">
                  <span className="flex gap-2 text-amber-400 font-bold text-sm">
                    <FaTrophy className="text-xs" />
                    {member.ThropyDef ?? 0}
                  </span>
                  <span className="font-semibold text-zinc-200">
                    {member.rankedDef.length} / 24
                  </span>
                  <span className="text-rose-400 font-medium">
                    ({member.AvgStarDef ?? 0} ⭐ avg)
                  </span>
                </div>
                <div className="text-[11px] text-rose-400 font-mono">
                  {member.AvgDestructionDef ?? 0}% avg dest
                </div>
              </>
            ) : (
              <span>data tidak ditemukan</span>
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
          {member.error ? (
            <p className="pt-3 text-rose-400">{member.error}</p>
          ) : divisionId === 2 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              {/* Offense Log Card */}
              <div className="p-3 rounded-lg bg-[#12244F] border border-[#2c4176]">
                <div className="flex items-center justify-between font-semibold text-emerald-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <GiSwordClash className="w-4 h-4" />
                    Riwayat Serangan ({member.rankedAtk?.length ?? 0})
                  </span>
                  <span className="font-mono text-[11px]">
                    Avg: {member.AvgStarAtk}⭐ / {member.AvgDestructionAtk}%
                  </span>
                </div>
                {member.rankedAtk && member.rankedAtk.length > 0 ? (
                  <div className="space-y-1.5 h-fit overflow-y-auto pr-1 grid grid-cols-4 md:grid-cols-6 gap-2">
                    {member.rankedAtk.map((atk: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex justify-center items-center py-1 px-2 rounded ${atk.stars === 3 ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300" : "bg-[#071A45] text-zinc-300"} `}
                      >
                        {/* <div className="flex gap-2">
                          <span className="truncate max-w-[60%]">
                            {`#${idx + 1}`}
                          </span>
                          <span className="truncate">{atk.opponentName}</span>
                        </div> */}
                        <span className="flex flex-col font-mono text-amber-300 flex items-center gap-1">
                          <span>
                            {atk.stars == 3 ? (
                              <div>
                                <FaStar className="inline w-3 h-3" />
                                <FaStar className="inline w-3 h-3" />
                                <FaStar className="inline w-3 h-3" />
                              </div>
                            ) : atk.stars == 2 ? (
                              <div>
                                <FaStar className="inline w-3 h-3" />
                                <FaStar className="inline w-3 h-3" />
                              </div>
                            ) : (
                              <FaStar className="inline w-3 h-3" />
                            )}
                          </span>{" "}
                          ({atk.destructionPercentage ?? 0}%)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500">Belum ada log serangan.</p>
                )}
              </div>

              {/* Defense Log Card */}
              <div className="p-3 rounded-lg bg-[#12244F] border border-[#2c4176]">
                <div className="flex items-center justify-between font-semibold text-rose-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <FaShieldAlt className="w-4 h-4" />
                    Riwayat Bertahan ({member.rankedDef?.length ?? 0})
                  </span>

                  <span className="font-mono text-[11px]">
                    Avg: {member.AvgStarDef}⭐ / {member.AvgDestructionDef}%
                  </span>
                </div>
                {member.rankedDef && member.rankedDef.length > 0 ? (
                  <div className="space-y-1.5 h-fit overflow-y-auto pr-1 grid grid-cols-4 md:grid-cols-6 gap-2">
                    {member.rankedDef.map((def: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex justify-center items-center py-1 px-2 rounded ${def.stars === 3 ? "bg-rose-500/15 border border-rose-500/40 text-rose-300" : "bg-[#071A45] text-zinc-300"}`}
                      >
                        {/* <div className="flex gap-2">
                          <span className="truncate max-w-[60%]">
                            {`#${idx + 1}`}
                          </span>
                          <span className="truncate">{atk.opponentName}</span>
                        </div> */}
                        <span className="flex flex-col font-mono text-amber-300 flex items-center gap-1">
                          <span>
                            {def.stars == 3 ? (
                              <div>
                                <FaStar className="inline w-3 h-3" />
                                <FaStar className="inline w-3 h-3" />
                                <FaStar className="inline w-3 h-3" />
                              </div>
                            ) : def.stars == 2 ? (
                              <div>
                                <FaStar className="inline w-3 h-3" />
                                <FaStar className="inline w-3 h-3" />
                              </div>
                            ) : (
                              <FaStar className="inline w-3 h-3" />
                            )}
                          </span>{" "}
                          ({def.destructionPercentage ?? 0}%)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500">Belum ada log pertahanan.</p>
                )}
              </div>
            </div>
          ) : divisionId === 3 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              {/* Offense Log Card */}
              <div className="p-3 rounded-lg bg-[#12244F] border border-[#2c4176]">
                <div className="flex items-center justify-between font-semibold text-emerald-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <GiSwordClash className="w-4 h-4" />
                    Riwayat Serangan ({member.rankedAtk?.length ?? 0})
                  </span>
                  <span className="font-mono text-[11px]">
                    Avg: {member.AvgStarAtk}⭐ / {member.AvgDestructionAtk}%
                  </span>
                </div>
                {member.rankedAtk && member.rankedAtk.length > 0 ? (
                  <div className="space-y-1.5 h-fit overflow-y-auto pr-1 grid grid-cols-5 md:grid-cols-6 gap-2">
                    {member.rankedAtk.map((atk: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex justify-center items-center py-1 px-2 rounded ${atk.stars === 3 ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300" : "bg-[#071A45] text-zinc-300"} text-zinc-300`}
                      >
                        {/* <div className="flex gap-2">
                          <span className="truncate max-w-[60%]">
                            {`#${idx + 1}`}
                          </span>
                          <span className="truncate">{atk.opponentName}</span>
                        </div> */}
                        <span className="flex flex-col font-mono text-amber-300 flex items-center gap-1">
                          <span>
                            {atk.stars == 3 ? (
                              <div>
                                <FaStar className="inline w-3 h-3" />
                                <FaStar className="inline w-3 h-3" />
                                <FaStar className="inline w-3 h-3" />
                              </div>
                            ) : atk.stars == 2 ? (
                              <div>
                                <FaStar className="inline w-3 h-3" />
                                <FaStar className="inline w-3 h-3" />
                              </div>
                            ) : (
                              <FaStar className="inline w-3 h-3" />
                            )}
                          </span>{" "}
                          ({atk.destructionPercentage ?? 0}%)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500">Belum ada log serangan.</p>
                )}
              </div>

              {/* Defense Log Card */}
              <div className="p-3 rounded-lg bg-[#12244F] border border-[#2c4176]">
                <div className="flex items-center justify-between font-semibold text-rose-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <FaShieldAlt className="w-4 h-4" />
                    Riwayat Bertahan ({member.rankedDef?.length ?? 0})
                  </span>
                  <span className="font-mono text-[11px]">
                    Avg: {member.AvgStarDef}⭐ / {member.AvgDestructionDef}%
                  </span>
                </div>
                {member.rankedDef && member.rankedDef.length > 0 ? (
                  <div className="space-y-1.5 h-fit overflow-y-auto pr-1 grid grid-cols-5 md:grid-cols-6 gap-2">
                    {member.rankedDef.map((def: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex justify-center items-center py-1 px-2 rounded ${def.stars === 3 ? "bg-rose-500/15 border border-rose-500/40 text-rose-300" : "bg-[#071A45] text-zinc-300"} text-zinc-300`}
                      >
                        {/* <div className="flex gap-2">
                          <span className="truncate max-w-[60%]">
                            {`#${idx + 1}`}
                          </span>
                          <span className="truncate">{atk.opponentName}</span>
                        </div> */}
                        <span className="flex flex-col font-mono text-amber-300 flex items-center gap-1">
                          <span>
                            {def.stars == 3 ? (
                              <div>
                                <FaStar className="inline w-3 h-3" />
                                <FaStar className="inline w-3 h-3" />
                                <FaStar className="inline w-3 h-3" />
                              </div>
                            ) : def.stars == 2 ? (
                              <div>
                                <FaStar className="inline w-3 h-3" />
                                <FaStar className="inline w-3 h-3" />
                              </div>
                            ) : (
                              <FaStar className="inline w-3 h-3" />
                            )}
                          </span>{" "}
                          ({def.destructionPercentage ?? 0}%)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500">Belum ada log pertahanan.</p>
                )}
              </div>
            </div>
          ) : (
           
            <div className="flex flex-col gap-4 pt-3">
              {/* 1. Ringkasan Season Stats (jika ada) */}
              {member.stat && !Array.isArray(member.stat) && (
                <div className="p-3 rounded-lg bg-[#12244F] border border-[#2c4176] flex flex-wrap gap-4 text-xs">
                  <div>
                    <span className="text-zinc-400">Avg Attack: </span>
                    <span className="font-bold text-emerald-400">
                      {member.stat.attack?.stars ?? 0}⭐ ({member.stat.attack?.destruction ?? 0}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Avg Defense: </span>
                    <span className="font-bold text-rose-400">
                      {member.stat.defense?.stars ?? 0}⭐ (
                      {member.stat.defense?.destruction ?? 0}%)
                    </span>
                  </div>
                </div>
              )}

              {/* 2. Riwayat Harian (Maksimal 7 Hari Terakhir) */}
              <div className="p-3 rounded-lg bg-[#12244F] border border-[#2c4176]">
                <div className="font-semibold text-blue-300 mb-2.5 flex items-center justify-between">
                  <span>Riwayat Harian Legend League (7 Hari Terakhir)</span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {member.rankedHistory?.items?.length ?? 0} hari tercatat
                  </span>
                </div>

                {member.rankedHistory?.items &&
                member.rankedHistory.items.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {member.rankedHistory.items.map((item) => {
                      
                      const dayLog = member.rankday?.find(
                        (r) => r.day === item.day,
                      );
                      const battles = Array.isArray(dayLog?.battlelog)
                        ? dayLog.battlelog
                        : (dayLog?.battlelog?.items ?? []);

                      return (
                        <div
                          key={item.day}
                          className="p-2.5 rounded-lg bg-[#071A45] border border-[#2c4176]/80 flex flex-col gap-2"
                        >
                          {/* Header Tanggal & Net Trofi */}
                          <div className="flex items-center justify-between border-b border-[#1e3466] pb-1.5">
                            <span className="font-mono font-semibold text-zinc-200">
                              {item.day}
                            </span>
                            <span
                              className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                                item.trophies >= 0
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : "bg-rose-500/15 text-rose-400"
                              }`}
                            >
                              {item.trophies > 0
                                ? `+${item.trophies}`
                                : item.trophies}{" "}
                              🏆
                            </span>
                          </div>

                          {/* Stat Serangan & Pertahanan Hari Itu */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-emerald-400 flex items-center gap-1">
                              <GiSwordClash /> +{item.attackTrophies} (
                              {item.attacks}/8)
                            </span>
                            <span className="text-rose-400 flex items-center gap-1">
                              <FaShieldAlt /> {item.defenseTrophies} (
                              {item.defenses}/8)
                            </span>
                          </div>

                          {/* Preview Battlelog Hari Itu (dari rankday) */}
                          {Array.isArray(battles) && battles.length > 0 && (
                            <div className="pt-1 border-t border-[#1e3466]/60 flex flex-wrap gap-1">
                              {battles.map((b: any, idx: number) => (
                                <span
                                  key={idx}
                                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                    b.type === "attack" || b.trophies > 0
                                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                                      : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                                  }`}
                                >
                                  {b.stars ?? 0}⭐{" "}
                                  {b.destruction ??
                                    b.destructionPercentage ??
                                    0}
                                  %
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-zinc-500">
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
