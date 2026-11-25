import LegendLeaderboard from "@/containers/LegendLeaderboard";

export const metadata = {
  title: "Legend League Division 2 Leaderboard - Clans Manage",
  description:
    "Leaderboard pemain divisi Legend 2 beserta statistik serangan dan pertahanan.",
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