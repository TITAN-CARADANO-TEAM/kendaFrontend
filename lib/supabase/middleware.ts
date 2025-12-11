/**
 * Supabase Middleware Client
 * À utiliser dans middleware.ts pour rafraîchir les sessions JWT
 * 
 * Ce client est conçu pour fonctionner avec le middleware Next.js.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';

/**
 * Met à jour la session Supabase dans le middleware
 * - Rafraîchit automatiquement les tokens expirés
 * - Préserve les cookies de session
 * 
 * @param request - La requête entrante Next.js
 * @returns NextResponse avec les cookies de session mis à jour
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Évite d'écrire de la logique entre createServerClient et
    // supabase.auth.getUser(). Une simple erreur pourrait rendre difficile
    // le débogage des problèmes de déconnexion aléatoire des utilisateurs.

    // Rafraîchit la session (renouvelle le token si nécessaire)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Vérification optionnelle de l'authentification pour les routes protégées
    // Décommente et adapte selon tes besoins :
    /*
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth')
    ) {
        // Redirige vers la page de login
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }
    */

    // IMPORTANT: Tu DOIS retourner l'objet supabaseResponse tel quel.
    // Si tu crées un nouveau NextResponse, assure-toi de:
    // 1. Passer la request: NextResponse.next({ request })
    // 2. Copier les cookies: supabaseResponse.cookies.getAll().forEach(...)
    // 3. Changer supabaseResponse pour qu'il corresponde au nouvel objet

    return supabaseResponse;
}
