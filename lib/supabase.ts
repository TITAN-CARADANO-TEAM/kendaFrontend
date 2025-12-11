/**
 * Supabase Client Configuration (LEGACY)
 * 
 * ⚠️  CE FICHIER EST DÉPRÉCIÉ !
 * 
 * Utilise plutôt la nouvelle structure dans `lib/supabase/`:
 * 
 * Client Components:
 *   import { createClient } from '@/lib/supabase/client';
 * 
 * Server Components:
 *   import { createClient } from '@/lib/supabase/server';
 * 
 * Ce fichier est maintenu pour la rétrocompatibilité.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * @deprecated Use `createClient` from '@/lib/supabase/client' instead
 */
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    })
    : null;

/**
 * @deprecated Use the new client structure
 */
export const isSupabaseConfigured = (): boolean => {
    return supabase !== null;
};

/**
 * @deprecated Use `getServerUser` from '@/lib/supabase/server' instead
 */
export const getAuthUser = async () => {
    if (!supabase) {
        console.warn('Supabase not configured. Please check your .env.local file.');
        return null;
    }
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

/**
 * @deprecated Use the new client's auth.signOut() instead
 */
export const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
};

// Re-export Database type for convenience
export type { Database };

// Re-export the new client functions for easier migration
export {
    createClient as createBrowserClient,
    getSupabaseClient
} from './supabase/client';

export {
    createClient as createServerClient,
    getServerUser,
    getServerSession,
    getServerUserProfile
} from './supabase/server';
