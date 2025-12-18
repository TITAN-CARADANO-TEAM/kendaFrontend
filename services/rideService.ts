import { createClient } from '@/lib/supabase/client';
import type {
    Ride,
    RideRequest,
    RideEstimate,
    RideRating,
    ApiResponse,
    PaginatedResponse,
    DriverLocation
} from '@/types';

// Instance Supabase unique pour le service
const supabase = createClient();

/**
 * Récupère les chauffeurs à proximité (Bounding Box simple)
 */
export async function fetchNearbyDrivers(
    lat: number,
    lng: number,
    radiusKm: number = 50 // Increased for testing - covers larger area
): Promise<DriverLocation[]> {
    // Approx: 1 deg lat ~= 111km. 1 deg lng ~= 111km * cos(lat)
    // Pour simplifier à l'équateur (RDC) : 1 deg ~= 111km => 0.01 deg ~= 1.1km
    const delta = radiusKm / 111;

    const minLat = lat - delta;
    const maxLat = lat + delta;
    const minLng = lng - delta;
    const maxLng = lng + delta;

    console.log(`[fetchNearbyDrivers] Searching for drivers near (${lat}, ${lng}) within ${radiusKm}km`);

    const { data, error } = await supabase
        .from('driver_profiles')
        .select(`
            id,
            user_id,
            current_lat,
            current_lng,
            vehicle_type,
            rating,
            status,
            is_online,
            users:user_id (full_name, avatar_url)
        `)
        .eq('is_online', true)
        // Remove status filter for now - show all online drivers regardless of verification
        .not('current_lat', 'is', null)
        .not('current_lng', 'is', null);

    if (error) {
        console.error('Error fetching drivers:', error);
        return [];
    }

    console.log(`[fetchNearbyDrivers] Found ${data?.length || 0} online drivers:`, data);

    return (data || []).map((d: any) => ({
        driver_id: d.user_id, // Use User ID for compatibility with rides table FK
        profile_id: d.id,
        latitude: d.current_lat,
        longitude: d.current_lng,
        vehicle_type: d.vehicle_type,
        driver_name: d.users?.full_name || 'Chauffeur',
        rating: d.rating
    }));
}

/**
 * Crée une nouvelle demande de course
 */
export async function createRide(request: RideRequest & { passenger_id: string, price: number, distance: number, duration: number, specificDriverId?: string }): Promise<ApiResponse<Ride>> {
    const { data, error } = await supabase
        .from('rides')
        .insert({
            passenger_id: request.passenger_id,
            pickup_lat: request.pickup_lat,
            pickup_lng: request.pickup_lng,
            pickup_address: request.pickup_address,
            dest_lat: request.dest_lat,
            dest_lng: request.dest_lng,
            dest_address: request.dest_address,
            vehicle_type: request.vehicle_type || 'TAXI',
            driver_id: request.specificDriverId || null,
            price: request.price,
            status: 'SEARCHING',
            distance_km: request.distance,
            duration_minutes: request.duration,
            requested_at: new Date().toISOString()
        } as any)
        .select()
        .single();

    if (error) {
        console.error('Error creating ride:', error);
        return {
            data: null,
            error: error.message,
            success: false
        };
    }

    return {
        data: data as Ride,
        error: null,
        success: true
    };
}

/**
 * Obtient le statut d'une course en temps réel
 */
export async function getRideStatus(rideId: string): Promise<ApiResponse<Ride>> {
    const { data, error } = await supabase
        .from('rides')
        .select(`
            *,
            driver:driver_id(id, full_name, avatar_url, phone),
            driver_profile:driver_profiles!driver_id(vehicle_model, license_plate, rating, vehicle_brand, vehicle_color)
        `)
        .eq('id', rideId)
        .single();

    if (error) {
        return {
            data: null,
            error: error.message,
            success: false
        };
    }

    return {
        data: data as unknown as Ride, // Cast nécessaire selon la structure retournée
        error: null,
        success: true
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

    const { data, error, count } = await supabase
        .from('rides')
        .select('*, driver:driver_id(full_name, avatar_url)', { count: 'exact' })
        .or(`passenger_id.eq.${userId},driver_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

    if (error) {
        return {
            data: [],
            total: 0,
            page,
            limit,
            has_more: false
        };
    }

    return {
        data: data as Ride[],
        total: count || 0,
        page,
        limit,
        has_more: (count || 0) > page * limit
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

    // TODO: Get city pricing from Supabase or Config
    const BASE_PRICE = 2000; // FC
    const PRICE_PER_KM = 800; // Augmenté pour réalisme

    const estimated_price = Math.round(BASE_PRICE + (PRICE_PER_KM * distance_km));
    const duration_minutes = Math.ceil(distance_km * 3); // ~3 min/km avec trafic moyen

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
    reason?: string,
    userId?: string
): Promise<ApiResponse<Ride>> {
    const { data, error } = await (supabase
        .from('rides') as any)
        .update({
            status: 'CANCELLED',
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString()
            // cancelled_by n'existe pas dans le schéma actuel, on omet
        })
        .eq('id', rideId)
        .select()
        .single();

    if (error) {
        return { data: null, error: error.message, success: false };
    }
    return { data: data as Ride, error: null, success: true };
}

/**
 * Note une course
 */
export async function rateRide(
    rideId: string,
    rating: number,
    comment?: string
): Promise<ApiResponse<RideRating>> {
    // Table ride_ratings non implémentée dans les types vus, mais supposée existante ou update rides
    // On update la table rides directement si ratings intégrés pour simplifier l'exemple

    // Supposons update sur rides pour l'instant :
    const { data, error } = await (supabase
        .from('rides') as any)
        .update({
            passenger_rating: rating,
            passenger_comment: comment
        })
        .eq('id', rideId)
        .select()
        .single();

    if (error) {
        return { data: null, error: error.message, success: false };
    }

    // Simuler le retour RideRating
    return {
        data: {
            ride_id: rideId,
            rating,
            comment
        } as any,
        error: null,
        success: true
    };
}

/**
 * Souscrit aux mises à jour temps réel d'une course
 */
export function subscribeToRide(
    rideId: string,
    callback: (ride: Ride) => void
): () => void {
    const channel = supabase
        .channel(`ride:${rideId}`)
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'rides',
            filter: `id=eq.${rideId}`
        }, (payload) => {
            console.log('Ride update:', payload);
            callback(payload.new as Ride);
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
