"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface SwitchProps {
  total: number;
}

export default function Switch({ total }: SwitchProps) {
  const pathname = usePathname();

  const isLegend1 = pathname?.startsWith("/leagues/legends/1");
  const isLegend2 = pathname?.startsWith("/leagues/legends/2");
  const isLegend3 = pathname?.startsWith("/leagues/legends/3");

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/leagues/legends/1"
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer whitespace-nowrap ${
          isLegend1
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
            : "text-zinc-300 hover:bg-[#18316b] hover:text-white"
        }`}
      >
        <span>legend 1</span>
        {isLegend1 && (
          <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-white/20 text-white">
            {total}
          </span>
        )}
      </Link>

      <Link
        href="/leagues/legends/2"
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer whitespace-nowrap ${
          isLegend2
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
            : "text-zinc-300 hover:bg-[#18316b] hover:text-white"
        }`}
      >
        <span>legend 2</span>
        {isLegend2 && (
          <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-white/20 text-white">
            {total}
          </span>
        )}
      </Link>

      <Link
        href="/leagues/legends/3"
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer whitespace-nowrap ${
          isLegend3
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
            : "text-zinc-300 hover:bg-[#18316b] hover:text-white"
        }`}
      >
        <span>legend 3</span>
        {isLegend3 && (
          <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-white/20 text-white">
            {total}
          </span>
        )}
      </Link>
    </div>
  );
}