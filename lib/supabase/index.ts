/**
 * Supabase - Point d'entrée centralisé
 * 
 * USAGE:
 * 
 * Client Components ("use client"):
 *   import { createClient } from '@/lib/supabase/client';
 *   const supabase = createClient();
 * 
 * Server Components / Server Actions:
 *   import { createClient } from '@/lib/supabase/server';
 *   const supabase = await createClient();
 * 
 * Middleware:
 *   import { updateSession } from '@/lib/supabase/middleware';
 *   return await updateSession(request);
 */

// Réexporte les clients pour faciliter les imports
export { createClient as createBrowserClient, getSupabaseClient } from './client';
export { createClient as createServerClient, getServerUser, getServerSession, getServerUserProfile } from './server';
export { updateSession } from './middleware';
