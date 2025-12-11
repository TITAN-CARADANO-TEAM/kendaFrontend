'use client';

/**
 * Composant de test pour vérifier la connexion Supabase
 * 
 * USAGE: Importe ce composant dans n'importe quelle page pour tester la connexion
 * 
 * À SUPPRIMER en production !
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ConnectionStatus {
    isConnected: boolean;
    isLoading: boolean;
    session: unknown | null;
    user: unknown | null;
    error: string | null;
    env: {
        hasUrl: boolean;
        hasAnonKey: boolean;
    };
}

// Helper function to safely extract email from user object
function getUserEmail(user: unknown): string {
    if (user && typeof user === 'object' && 'email' in user) {
        return (user as { email?: string }).email || 'Anonymous';
    }
    return 'Anonymous';
}

export function SupabaseConnectionTest() {
    const [status, setStatus] = useState<ConnectionStatus>({
        isConnected: false,
        isLoading: true,
        session: null,
        user: null,
        error: null,
        env: {
            hasUrl: false,
            hasAnonKey: false,
        },
    });

    useEffect(() => {
        async function testConnection() {
            // Vérification des variables d'environnement
            const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
            const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            if (!hasUrl || !hasAnonKey) {
                setStatus({
                    isConnected: false,
                    isLoading: false,
                    session: null,
                    user: null,
                    error: 'Variables d\'environnement manquantes',
                    env: { hasUrl, hasAnonKey },
                });
                console.error('❌ Supabase: Variables d\'environnement manquantes');
                console.log('   NEXT_PUBLIC_SUPABASE_URL:', hasUrl ? '✅ Définie' : '❌ Manquante');
                console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', hasAnonKey ? '✅ Définie' : '❌ Manquante');
                return;
            }

            try {
                const supabase = createClient();

                // Test de la connexion
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    throw sessionError;
                }

                const { data: { user }, error: userError } = await supabase.auth.getUser();

                console.log('✅ Supabase: Connexion réussie !');
                console.log('   Session:', session ? 'Active' : 'Aucune session');
                console.log('   User:', user ? user.email || user.id : 'Non connecté');

                setStatus({
                    isConnected: true,
                    isLoading: false,
                    session,
                    user,
                    error: null,
                    env: { hasUrl, hasAnonKey },
                });

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
                console.error('❌ Supabase: Erreur de connexion', error);

                setStatus({
                    isConnected: false,
                    isLoading: false,
                    session: null,
                    user: null,
                    error: errorMessage,
                    env: { hasUrl, hasAnonKey },
                });
            }
        }

        testConnection();
    }, []);

    // Ne rien afficher en production
    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className={`
                p-4 rounded-lg shadow-lg text-sm font-mono
                ${status.isLoading ? 'bg-yellow-900/90 text-yellow-100' : ''}
                ${status.isConnected ? 'bg-green-900/90 text-green-100' : ''}
                ${!status.isLoading && !status.isConnected ? 'bg-red-900/90 text-red-100' : ''}
            `}>
                <div className="font-bold mb-2 flex items-center gap-2">
                    {status.isLoading ? '⏳' : status.isConnected ? '✅' : '❌'}
                    Supabase Test
                </div>

                <div className="space-y-1 text-xs">
                    <div>URL: {status.env.hasUrl ? '✅' : '❌'}</div>
                    <div>ANON_KEY: {status.env.hasAnonKey ? '✅' : '❌'}</div>
                    <div>Status: {status.isLoading ? 'Loading...' : status.isConnected ? 'Connected' : 'Failed'}</div>
                    {status.user !== null ? (
                        <div>User: {getUserEmail(status.user)}</div>
                    ) : null}
                    {status.error && (
                        <div className="text-red-300 mt-2">Error: {status.error}</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SupabaseConnectionTest;
