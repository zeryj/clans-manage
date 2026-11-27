"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "./sidebar";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#2c4176] bg-[#12244F] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand / Logo */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-white"
            >
              clans manage
            </Link>
            <Link
              href={"/leagues/legends/2"}
              className="md:block rounded-lg hover:bg-[#18316b] transition-colors font-medium text-white hidden"
            >
              Leagues Leaderboard
            </Link>
          </div>

          {/* Menu Hamburger (Mobile) */}
          <button
            type="button"
            aria-label="Toggle menu"
            className="flex flex-col items-center gap-1 md:hidden cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="w-[20px] block bg-white h-[2px]"></span>
            <span className="w-[20px] block bg-white h-[2px]"></span>
            <span className="w-[20px] block bg-white h-[2px]"></span>
          </button>
        </div>
      </header>

      {/* Sidebar Mobile (Overlay) */}
      <Sidebar
        isOpen={isMenuOpen}
        onToggle={() => setIsMenuOpen(!isMenuOpen)}
      />
    </>
  );
}
