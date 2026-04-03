import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-server';
import ProfileHeader from '@/components/social/ProfileHeader';
import ProfileTabs from '@/components/social/ProfileTabs';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { userId } = await params;
  const { data } = await supabaseAdmin
    .from('public_user_profiles')
    .select('username, display_name, bio')
    .eq('id', userId)
    .single();
  if (!data) return { title: 'ユーザーが見つかりません' };
  return {
    title: `${data.display_name ?? data.username} — 神戸立ち飲みマップ`,
    description: data.bio ?? `${data.username}のプロフィール`,
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { userId } = await params;

  const { data: profile, error } = await supabaseAdmin
    .from('public_user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) notFound();

  // Fetch public favorites
  let favorites = null;
  if (profile.favorites_public) {
    const { data } = await supabaseAdmin
      .from('user_favorites')
      .select('restaurant_id, created_at, restaurant:restaurants(id, name, area, tachinomi_type)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    favorites = data ?? [];
  }

  // Fetch public visits
  let visits = null;
  if (profile.visits_public) {
    const { data } = await supabaseAdmin
      .from('user_visits')
      .select('id, visited_at, note, restaurant:restaurants(id, name, area, tachinomi_type)')
      .eq('user_id', userId)
      .order('visited_at', { ascending: false })
      .limit(20);
    visits = data ?? [];
  }

  return (
    <div className="min-h-screen bg-harbor-950 pb-24">
      {/* 戻るヘッダー */}
      <div className="sticky top-0 z-10 bg-harbor-950/95 backdrop-blur-sm border-b border-harbor-800 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-harbor-400 hover:text-harbor-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-harbor-100 font-semibold text-sm">
          {profile.display_name ?? profile.username}
        </span>
      </div>

      <ProfileHeader profile={profile} followStatus={null} />
      <div className="border-t border-harbor-800" />
      <ProfileTabs profile={profile} favorites={favorites} visits={visits} isOwn={false} />
      <BottomNav />
    </div>
  );
}
