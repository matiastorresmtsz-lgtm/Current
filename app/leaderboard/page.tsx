import Leaderboard from '../components/Leaderboard';

export const dynamic = 'force-dynamic';

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-[#161616] px-4 py-12 text-gray-100 sm:px-6">
      <Leaderboard />
    </main>
  );
}
