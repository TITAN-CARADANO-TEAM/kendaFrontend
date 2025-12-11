/**
 * Supabase Browser Client
 * À utiliser UNIQUEMENT dans les Client Components ("use client")
 * 
 * Ce client utilise les cookies du navigateur pour gérer la session.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

/**
 * Crée un client Supabase pour le navigateur (Client Components)
 * La session est automatiquement persistée dans les cookies
 */
export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

/**
 * Instance singleton du client browser
 * Utilise cette instance pour éviter de recréer le client à chaque appel
 */
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
    if (!browserClient) {
        browserClient = createClient();
    }
    return browserClient;
}
