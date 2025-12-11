/**
 * Supabase Server Client
 * À utiliser dans les Server Components, Server Actions et Route Handlers
 * 
 * Ce client gère automatiquement les cookies pour maintenir la session.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

/**
 * Crée un client Supabase pour le serveur (Server Components, Server Actions)
 * Gère automatiquement la lecture/écriture des cookies de session
 */
export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // La méthode `setAll` a été appelée depuis un Server Component.
                        // Cela peut être ignoré si vous avez un middleware qui rafraîchit
                        // les sessions utilisateur.
                    }
                },
            },
        }
    );
}

/**
 * Récupère l'utilisateur actuellement connecté
 * À utiliser dans les Server Components ou Server Actions
 */
export async function getServerUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        console.error('Error fetching user:', error.message);
        return null;
    }

    return user;
}

/**
 * Récupère la session actuelle
 * À utiliser dans les Server Components ou Server Actions
 */
export async function getServerSession() {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Error fetching session:', error.message);
        return null;
    }

    return session;
}

/**
 * Récupère le profil complet de l'utilisateur (depuis la table users)
 */
export async function getServerUserProfile() {
    const user = await getServerUser();
    if (!user) return null;

    const supabase = await createClient();
    const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error.message);
        return null;
    }

    return profile;
}
