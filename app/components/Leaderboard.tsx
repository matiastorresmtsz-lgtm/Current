import { getProfiles, Profile } from '../lib/supabase-server';

function displayName(profile: Profile) {
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  return fullName || profile.username;
}

export default async function Leaderboard() {
  let profiles: Profile[] = [];
  let errorMessage = '';

  try {
    profiles = await getProfiles();
  } catch (error) {
    console.error('Failed to load profiles leaderboard:', error);
    errorMessage = 'The leaderboard is temporarily unavailable.';
  }

  return (
    <section aria-labelledby="leaderboard-title" className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Community</p>
        <h1 id="leaderboard-title" className="mt-2 text-2xl font-semibold text-white">Leaderboard</h1>
        <p className="mt-1 text-sm text-gray-400">Ranked by community score.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#2E2E2E] bg-[#212121]">
        {errorMessage ? (
          <p role="alert" className="p-6 text-sm text-gray-400">{errorMessage}</p>
        ) : profiles.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">No profiles have joined the leaderboard yet.</p>
        ) : (
          <ol>
            {profiles.map((profile, index) => (
              <li key={profile.clerk_user_id} className="flex items-center gap-4 border-b border-[#2E2E2E] px-5 py-4 last:border-b-0">
                <span className="w-8 text-sm font-semibold tabular-nums text-gray-500">{index + 1}</span>
                {profile.image_url ? (
                  <img src={profile.image_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A2A2A] text-sm font-semibold text-gray-300">
                    {displayName(profile).charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{displayName(profile)}</span>
                <span className="text-sm font-semibold tabular-nums text-[#17C99E]">{profile.score.toLocaleString()}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
