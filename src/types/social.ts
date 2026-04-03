// ============================================================
// Social layer types — Follow / Follower / Block / Feed
// ============================================================

export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  area_preference: string | null;
  favorites_public: boolean;
  visits_public: boolean;
  created_at: string;
  updated_at: string;
  // aggregates (from public_user_profiles view)
  following_count?: number;
  follower_count?: number;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowWithProfile extends Follow {
  profile: UserProfile;
}

export interface Block {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  restaurant_id: string;
  created_at: string;
}

export interface UserVisit {
  id: string;
  user_id: string;
  restaurant_id: string;
  visited_at: string;
  note: string | null;
  created_at: string;
}

export type ActivityType = 'visit' | 'favorite' | 'follow';

export interface FeedActivity {
  id: string;
  activity_type: ActivityType;
  created_at: string;
  // actor
  user_id: string;
  actor_username: string;
  actor_display_name: string | null;
  actor_avatar_url: string | null;
  // restaurant (nullable)
  restaurant_id: string | null;
  restaurant_name: string | null;
  restaurant_area: string | null;
  restaurant_tachinomi_type: string | null;
  // target user (follow activity)
  target_user_id: string | null;
  target_username: string | null;
  target_display_name: string | null;
  target_avatar_url: string | null;
}

// --- API response shapes ---

export interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
  isMutual: boolean;
  isBlocked: boolean;
}

export interface ProfilePageData {
  profile: UserProfile;
  followStatus: FollowStatus | null; // null when viewing own profile
}

// --- Request bodies ---

export interface FollowRequest {
  followingId: string;
}

export interface BlockRequest {
  blockedId: string;
}

export interface UpdateProfileRequest {
  display_name?: string;
  bio?: string;
  area_preference?: string;
  favorites_public?: boolean;
  visits_public?: boolean;
}
