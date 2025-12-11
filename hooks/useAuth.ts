import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: Error | null;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        isLoading: true,
        error: null,
    });

    const supabase = createClient();

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                setState(prev => ({
                    ...prev,
                    user: session?.user ?? null,
                    isLoading: false
                }));
            } catch (error) {
                console.error('Error getting session:', error);
                setState(prev => ({
                    ...prev,
                    error: error as Error,
                    isLoading: false
                }));
            }
        };

        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setState(prev => ({
                ...prev,
                user: session?.user ?? null,
                isLoading: false
            }));
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setState(prev => ({ ...prev, user: null }));
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return {
        ...state,
        signOut,
        isAuthenticated: !!state.user,
    };
}
