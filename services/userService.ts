/**
 * User Service
 * Gère toutes les opérations liées aux utilisateurs
 */

import type {
    User,
    UserStats,
    ApiResponse,
    RegisterData,
    LoginData
} from '@/types';

// TODO: Import Supabase client when ready
// import { supabase } from '@/lib/supabase';

/**
 * Obtient le profil de l'utilisateur connecté
 */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
    // TODO: Connect to Supabase
    // const { data: { user: authUser } } = await supabase.auth.getUser();
    // if (!authUser) return { data: null, error: 'Not authenticated', success: false };
    //
    // const { data, error } = await supabase
    //     .from('users')
    //     .select('*')
    //     .eq('id', authUser.id)
    //     .single();

    console.warn('[userService] getCurrentUser: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Obtient le profil d'un utilisateur par ID
 */
export async function getUserProfile(userId: string): Promise<ApiResponse<User>> {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase
    //     .from('users')
    //     .select('*')
    //     .eq('id', userId)
    //     .single();

    console.warn('[userService] getUserProfile: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Met à jour le profil utilisateur
 */
export async function updateProfile(
    userId: string,
    data: Partial<User>
): Promise<ApiResponse<User>> {
    // TODO: Connect to Supabase
    // const { data: updated, error } = await supabase
    //     .from('users')
    //     .update({
    //         ...data,
    //         updated_at: new Date().toISOString()
    //     })
    //     .eq('id', userId)
    //     .select()
    //     .single();

    console.warn('[userService] updateProfile: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Upload l'avatar de l'utilisateur
 */
export async function uploadAvatar(
    userId: string,
    file: File
): Promise<ApiResponse<string>> {
    // TODO: Connect to Supabase Storage
    // const fileExt = file.name.split('.').pop();
    // const filePath = `${userId}/avatar.${fileExt}`;
    //
    // const { error: uploadError } = await supabase.storage
    //     .from('avatars')
    //     .upload(filePath, file, { upsert: true });
    //
    // if (uploadError) return { data: null, error: uploadError.message, success: false };
    //
    // const { data: { publicUrl } } = supabase.storage
    //     .from('avatars')
    //     .getPublicUrl(filePath);
    //
    // await updateProfile(userId, { avatar_url: publicUrl });

    console.warn('[userService] uploadAvatar: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Obtient les statistiques d'un utilisateur
 */
export async function getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
    // TODO: Connect to Supabase
    // const { data: rides, error } = await supabase
    //     .from('rides')
    //     .select('distance_km, ride_ratings(rating)')
    //     .or(`passenger_id.eq.${userId},driver_id.eq.${userId}`)
    //     .eq('status', 'COMPLETED');
    //
    // Calculate stats from rides...

    console.warn('[userService] getUserStats: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Inscription d'un nouvel utilisateur
 */
export async function register(data: RegisterData): Promise<ApiResponse<User>> {
    // TODO: Connect to Supabase Auth
    // const { data: authData, error: authError } = await supabase.auth.signUp({
    //     email: data.email,
    //     password: data.password,
    // });
    //
    // if (authError) return { data: null, error: authError.message, success: false };
    //
    // const { data: user, error } = await supabase
    //     .from('users')
    //     .insert({
    //         id: authData.user?.id,
    //         full_name: data.full_name,
    //         email: data.email,
    //         phone: data.phone,
    //         role: data.role,
    //         city: data.city
    //     })
    //     .select()
    //     .single();

    console.warn('[userService] register: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Connexion d'un utilisateur
 */
export async function login(data: LoginData): Promise<ApiResponse<User>> {
    // TODO: Connect to Supabase Auth
    // const isEmail = data.email_or_phone.includes('@');
    // 
    // const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    //     email: isEmail ? data.email_or_phone : undefined,
    //     phone: !isEmail ? data.email_or_phone : undefined,
    //     password: data.password,
    // });
    //
    // if (authError) return { data: null, error: authError.message, success: false };
    //
    // return getCurrentUser();

    console.warn('[userService] login: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Déconnexion
 */
export async function logout(): Promise<ApiResponse<null>> {
    // TODO: Connect to Supabase Auth
    // const { error } = await supabase.auth.signOut();

    console.warn('[userService] logout: Not connected to backend');

    return {
        data: null,
        error: null,
        success: true
    };
}
