import { supabaseAdmin } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import UserCard from '@/components/social/UserCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function FollowersPage({ params }: Props) {
  const { userId } = await params;

  const { data: profile } = await supabaseAdmin
    .from('public_user_profiles')
    .select('id, username, display_name')
    .eq('id', userId)
    .single();

  if (!profile) notFound();

  const { data } = await supabaseAdmin
    .from('follows')
    .select(`
      id, created_at,
      profile:user_profiles!follows_follower_id_fkey(
        id, username, display_name, avatar_url, bio, area_preference,
        favorites_public, visits_public, created_at, updated_at
      )
    `)
    .eq('following_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  const followers = (data ?? []).map((row) => ({
    ...row,
    profile: Array.isArray(row.profile) ? row.profile[0] : row.profile,
  }));

  return (
    <div className="min-h-screen bg-harbor-950 max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-harbor-950/95 backdrop-blur-sm border-b border-harbor-800 px-4 py-3 flex items-center gap-3">
        <Link href={`/users/${userId}`} className="text-harbor-400 hover:text-harbor-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-harbor-100 font-semibold text-sm">
            {profile.display_name ?? profile.username}
          </h1>
          <p className="text-harbor-500 text-xs">フォロワー {followers.length}人</p>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {followers.length === 0 ? (
          <p className="text-center text-harbor-500 text-sm py-12">まだフォロワーがいません</p>
        ) : (
          followers.map(({ id, profile: p }) =>
            p ? <UserCard key={id} profile={p} /> : null,
          )
        )}
      </div>
    </div>
  );
}
