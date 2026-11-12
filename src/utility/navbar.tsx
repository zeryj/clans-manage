import Link from "next/link";

export default function Navbar() {
  return (
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
        </div>

        {/* Search bar & Action */}
        <div className="flex items-center gap-4">
          
        </div>
      </div>
    </header>
  );
}
