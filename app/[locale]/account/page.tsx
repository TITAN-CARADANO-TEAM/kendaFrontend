"use client";

import { UserProfileScreen } from "@/components/profile/UserProfileScreen";
import { useAuth } from "@/hooks/useAuth";

export default function AccountPage() {
    const { user, isLoading } = useAuth();

    // Map Supabase User to expected User type
    // We need to fetch the full user profile from the 'users' table separately to get is_verified etc.
    // modifying UserProfileScreen to accept the partial user for now or basic display

    // For now, construct a minimal user object from Supabase auth.User
    const displayUser = user ? {
        id: user.id,
        full_name: user.user_metadata.full_name,
        email: user.email,
        phone: user.phone || user.user_metadata.phone,
        avatar_url: user.user_metadata.avatar_url,
        role: user.user_metadata.role || 'PASSENGER',
        is_verified: false, // verification status is in the 'users' table, not auth.user session mostly
        created_at: user.created_at,
        updated_at: user.updated_at,
    } : undefined;

    return <UserProfileScreen user={displayUser as any} isLoading={isLoading} />;
}
