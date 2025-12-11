/**
 * Notification Service
 * Gère toutes les opérations liées aux notifications
 */

import type {
    Notification,
    ApiResponse,
    PaginatedResponse
} from '@/types';

// TODO: Import Supabase client when ready
// import { supabase } from '@/lib/supabase';

/**
 * Obtient les notifications de l'utilisateur
 */
export async function getNotifications(
    userId: string,
    options?: { page?: number; limit?: number; unreadOnly?: boolean }
): Promise<PaginatedResponse<Notification>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;

    // TODO: Connect to Supabase
    // let query = supabase
    //     .from('notifications')
    //     .select('*', { count: 'exact' })
    //     .eq('user_id', userId)
    //     .order('created_at', { ascending: false });
    //
    // if (options?.unreadOnly) {
    //     query = query.eq('is_read', false);
    // }
    //
    // const { data, error, count } = await query
    //     .range((page - 1) * limit, page * limit - 1);

    console.warn('[notificationService] getNotifications: Not connected to backend');

    return {
        data: [],
        total: 0,
        page,
        limit,
        has_more: false
    };
}

/**
 * Compte les notifications non lues
 */
export async function getUnreadCount(userId: string): Promise<ApiResponse<number>> {
    // TODO: Connect to Supabase
    // const { count, error } = await supabase
    //     .from('notifications')
    //     .select('*', { count: 'exact', head: true })
    //     .eq('user_id', userId)
    //     .eq('is_read', false);

    console.warn('[notificationService] getUnreadCount: Not connected to backend');

    return {
        data: 0,
        error: null,
        success: true
    };
}

/**
 * Marque une notification comme lue
 */
export async function markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase
    //     .from('notifications')
    //     .update({ is_read: true })
    //     .eq('id', notificationId)
    //     .select()
    //     .single();

    console.warn('[notificationService] markAsRead: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Marque toutes les notifications comme lues
 */
export async function markAllAsRead(userId: string): Promise<ApiResponse<null>> {
    // TODO: Connect to Supabase
    // const { error } = await supabase
    //     .from('notifications')
    //     .update({ is_read: true })
    //     .eq('user_id', userId)
    //     .eq('is_read', false);

    console.warn('[notificationService] markAllAsRead: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Souscrit aux nouvelles notifications
 */
export function subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
): () => void {
    // TODO: Connect to Supabase Realtime
    // const subscription = supabase
    //     .channel(`notifications:${userId}`)
    //     .on('postgres_changes', {
    //         event: 'INSERT',
    //         schema: 'public',
    //         table: 'notifications',
    //         filter: `user_id=eq.${userId}`
    //     }, (payload) => callback(payload.new as Notification))
    //     .subscribe();
    //
    // return () => subscription.unsubscribe();

    console.warn('[notificationService] subscribeToNotifications: Not connected to backend');

    return () => { };
}
