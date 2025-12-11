/**
 * Ride Service
 * Gère toutes les opérations liées aux courses
 */

import type {
    Ride,
    RideRequest,
    RideEstimate,
    RideRating,
    ApiResponse,
    PaginatedResponse
} from '@/types';

// TODO: Import Supabase client when ready
// import { supabase } from '@/lib/supabase';

/**
 * Crée une nouvelle demande de course
 */
export async function createRide(request: RideRequest): Promise<ApiResponse<Ride>> {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase
    //     .from('rides')
    //     .insert({
    //         passenger_id: currentUser.id,
    //         pickup_latitude: request.pickup_latitude,
    //         pickup_longitude: request.pickup_longitude,
    //         destination_latitude: request.destination_latitude,
    //         destination_longitude: request.destination_longitude,
    //         status: 'SEARCHING',
    //         ...
    //     })
    //     .select()
    //     .single();

    console.warn('[rideService] createRide: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Obtient le statut d'une course en temps réel
 */
export async function getRideStatus(rideId: string): Promise<ApiResponse<Ride>> {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase
    //     .from('rides')
    //     .select(`
    //         *,
    //         driver:driver_id(id, full_name, avatar_url),
    //         driver_profile:driver_profiles!driver_id(vehicle_model, license_plate, average_rating)
    //     `)
    //     .eq('id', rideId)
    //     .single();

    console.warn('[rideService] getRideStatus: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Obtient l'historique des courses d'un utilisateur
 */
export async function getRideHistory(
    userId: string,
    options?: { page?: number; limit?: number }
): Promise<PaginatedResponse<Ride>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;

    // TODO: Connect to Supabase
    // const { data, error, count } = await supabase
    //     .from('rides')
    //     .select('*, driver:driver_id(full_name, avatar_url)', { count: 'exact' })
    //     .or(`passenger_id.eq.${userId},driver_id.eq.${userId}`)
    //     .order('created_at', { ascending: false })
    //     .range((page - 1) * limit, page * limit - 1);

    console.warn('[rideService] getRideHistory: Not connected to backend');

    return {
        data: [],
        total: 0,
        page,
        limit,
        has_more: false
    };
}

/**
 * Estime le prix d'une course
 */
export async function estimateRide(
    pickupLat: number,
    pickupLng: number,
    destLat: number,
    destLng: number
): Promise<ApiResponse<RideEstimate>> {
    // Calcul local de la distance (Haversine)
    const R = 6371; // Rayon de la Terre en km
    const dLat = (destLat - pickupLat) * Math.PI / 180;
    const dLon = (destLng - pickupLng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(pickupLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance_km = R * c;

    // TODO: Get city pricing from Supabase
    const BASE_PRICE = 2000;
    const PRICE_PER_KM = 500;

    const estimated_price = Math.round(BASE_PRICE + (PRICE_PER_KM * distance_km));
    const duration_minutes = Math.ceil(distance_km * 2); // ~2 min/km en ville

    return {
        data: {
            distance_km: Math.round(distance_km * 100) / 100,
            duration_minutes,
            estimated_price,
            currency: 'FC'
        },
        error: null,
        success: true
    };
}

/**
 * Annule une course
 */
export async function cancelRide(
    rideId: string,
    reason?: string
): Promise<ApiResponse<Ride>> {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase
    //     .from('rides')
    //     .update({
    //         status: 'CANCELLED',
    //         cancellation_reason: reason,
    //         cancelled_by: currentUser.id,
    //         cancelled_at: new Date().toISOString()
    //     })
    //     .eq('id', rideId)
    //     .select()
    //     .single();

    console.warn('[rideService] cancelRide: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Note une course
 */
export async function rateRide(
    rideId: string,
    rating: number,
    comment?: string
): Promise<ApiResponse<RideRating>> {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase
    //     .from('ride_ratings')
    //     .insert({
    //         ride_id: rideId,
    //         rated_by: currentUser.id,
    //         rated_user: driverId,
    //         rating,
    //         comment
    //     })
    //     .select()
    //     .single();

    console.warn('[rideService] rateRide: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Souscrit aux mises à jour temps réel d'une course
 */
export function subscribeToRide(
    rideId: string,
    callback: (ride: Ride) => void
): () => void {
    // TODO: Connect to Supabase Realtime
    // const subscription = supabase
    //     .channel(`ride:${rideId}`)
    //     .on('postgres_changes', {
    //         event: 'UPDATE',
    //         schema: 'public',
    //         table: 'rides',
    //         filter: `id=eq.${rideId}`
    //     }, (payload) => callback(payload.new as Ride))
    //     .subscribe();
    //
    // return () => subscription.unsubscribe();

    console.warn('[rideService] subscribeToRide: Not connected to backend');

    return () => { }; // Cleanup function
}
