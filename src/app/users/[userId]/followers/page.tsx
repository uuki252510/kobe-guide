import { supabaseAdmin } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import UserCard from '@/components/social/UserCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const PAPER = '#F3ECDD';
const INK   = '#262220';
const MUTE  = '#857E78';

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
    <div className="min-h-screen max-w-lg mx-auto pb-24" style={{ background: PAPER }}>
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{
          background: PAPER,
          borderBottom: `1px solid ${INK}`,
        }}
      >
        <Link
          href={`/users/${userId}`}
          className="flex items-center justify-center"
          style={{
            width: 32, height: 32,
            border: `1px solid ${INK}`,
            color: INK,
            borderRadius: 0,
          }}
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1
            style={{
              color: INK, fontWeight: 700, fontSize: 14,
              letterSpacing: '-0.01em', lineHeight: 1.3,
            }}
          >
            {profile.display_name ?? profile.username}
          </h1>
          <p
            style={{
              color: MUTE, fontSize: 10, marginTop: 2,
              letterSpacing: '0.12em',
            }}
          >
            フォロワー {followers.length}
          </p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2">
        {followers.length === 0 ? (
          <p className="text-center py-12" style={{ color: MUTE, fontSize: 13 }}>
            まだフォロワーがいない
          </p>
        ) : (
          followers.map(({ id, profile: p }) =>
            p ? <UserCard key={id} profile={p} /> : null,
          )
        )}
      </div>
    </div>
  );
}
