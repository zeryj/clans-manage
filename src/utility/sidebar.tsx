"use client";

import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <div
      className={`fixed inset-0 h-fit z-40 bg-[#12244F] border-[#2c4176] border-b-2 transition-opacity duration-300 ${isOpen ? "block" : "hidden"} p-3`}
    >
      <div className="w-full  mx-auto pt-20 space-y-6 p-3  border-[#2c4176] border-b-2">
        <Link
          href={"/leagues/legends/2"}
          className="block rounded-lg hover:bg-[#18316b] transition-colors font-medium text-white"
          onClick={onToggle}
        >
          Leagues Leaderboard
        </Link>
      </div>
      <div className="w-full mx-auto space-y-6 p-3 mb-6 border-[#2c4176] border-b-2">
        <Link
          href={"/"}
          className="block rounded-lg hover:bg-[#18316b] transition-colors font-medium text-white"
          onClick={onToggle}
        >
          Clans List
        </Link>
      </div>
    </div>
  );
}
