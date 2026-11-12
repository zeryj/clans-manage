import LegendLeaderboard from "@/containers/LegendLeaderboard";

export const metadata = {
  title: "Legend League Leaderboard - Clans Manage",
  description:
    "Leaderboard pemain divisi Legend 1, 2, dan 3 beserta statistik serangan dan pertahanan.",
};

export default function LegendMembersPage() {
  return (
    <main className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <LegendLeaderboard />
      </div>
    </main>
  );
}
