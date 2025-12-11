/**
 * Driver Service
 * Gère toutes les opérations liées aux chauffeurs
 */

import type {
    DriverProfile,
    DriverDocument,
    DriverLocation,
    DriverStats,
    DriverApplicationData,
    ApiResponse,
    PaginatedResponse,
    Ride
} from '@/types';

// TODO: Import Supabase client when ready
// import { supabase } from '@/lib/supabase';

/**
 * Obtient le profil chauffeur de l'utilisateur connecté
 */
export async function getDriverProfile(userId: string): Promise<ApiResponse<DriverProfile>> {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase
    //     .from('driver_profiles')
    //     .select('*')
    //     .eq('user_id', userId)
    //     .single();

    console.warn('[driverService] getDriverProfile: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Soumet une candidature chauffeur
 */
export async function submitDriverApplication(
    userId: string,
    data: DriverApplicationData
): Promise<ApiResponse<DriverProfile>> {
    // TODO: Connect to Supabase
    // 1. Create driver profile
    // const { data: profile, error: profileError } = await supabase
    //     .from('driver_profiles')
    //     .insert({
    //         user_id: userId,
    //         vehicle_type: data.vehicle_type,
    //         vehicle_brand: data.vehicle_brand,
    //         vehicle_model: data.vehicle_model,
    //         license_plate: data.license_plate,
    //         vehicle_color: data.vehicle_color,
    //         status: 'PENDING'
    //     })
    //     .select()
    //     .single();
    //
    // 2. Upload documents to storage
    // 3. Create document records

    console.warn('[driverService] submitDriverApplication: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Met à jour le statut en ligne/hors ligne
 */
export async function updateOnlineStatus(
    driverProfileId: string,
    isOnline: boolean
): Promise<ApiResponse<DriverProfile>> {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase
    //     .from('driver_profiles')
    //     .update({ is_online: isOnline })
    //     .eq('id', driverProfileId)
    //     .select()
    //     .single();

    console.warn('[driverService] updateOnlineStatus: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Met à jour la position GPS du chauffeur
 */
export async function updateLocation(
    driverProfileId: string,
    latitude: number,
    longitude: number
): Promise<ApiResponse<null>> {
    // TODO: Connect to Supabase
    // const { error } = await supabase
    //     .from('driver_profiles')
    //     .update({
    //         current_latitude: latitude,
    //         current_longitude: longitude,
    //         last_location_update: new Date().toISOString()
    //     })
    //     .eq('id', driverProfileId);

    console.warn('[driverService] updateLocation: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Obtient les statistiques du chauffeur
 */
export async function getDriverStats(driverId: string): Promise<ApiResponse<DriverStats>> {
    // TODO: Connect to Supabase
    // const today = new Date().toISOString().split('T')[0];
    // const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    //
    // const { data: rides, error } = await supabase
    //     .from('rides')
    //     .select('final_price, completed_at')
    //     .eq('driver_id', driverId)
    //     .eq('status', 'COMPLETED');
    //
    // Calculate stats from rides...

    console.warn('[driverService] getDriverStats: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Obtient l'historique des courses du chauffeur
 */
export async function getDriverRideHistory(
    driverId: string,
    options?: { page?: number; limit?: number }
): Promise<PaginatedResponse<Ride>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;

    // TODO: Connect to Supabase
    // const { data, error, count } = await supabase
    //     .from('rides')
    //     .select('*, passenger:passenger_id(full_name, avatar_url)', { count: 'exact' })
    //     .eq('driver_id', driverId)
    //     .order('completed_at', { ascending: false })
    //     .range((page - 1) * limit, page * limit - 1);

    console.warn('[driverService] getDriverRideHistory: Not connected to backend');

    return {
        data: [],
        total: 0,
        page,
        limit,
        has_more: false
    };
}

/**
 * Obtient les documents du chauffeur
 */
export async function getDriverDocuments(
    driverProfileId: string
): Promise<ApiResponse<DriverDocument[]>> {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase
    //     .from('driver_documents')
    //     .select('*')
    //     .eq('driver_profile_id', driverProfileId)
    //     .order('created_at', { ascending: false });

    console.warn('[driverService] getDriverDocuments: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Upload un document
 */
export async function uploadDocument(
    driverProfileId: string,
    documentType: DriverDocument['document_type'],
    file: File
): Promise<ApiResponse<DriverDocument>> {
    // TODO: Connect to Supabase Storage
    // const filePath = `${driverProfileId}/${documentType}_${Date.now()}.${file.name.split('.').pop()}`;
    //
    // const { error: uploadError } = await supabase.storage
    //     .from('driver-documents')
    //     .upload(filePath, file);
    //
    // if (uploadError) return { data: null, error: uploadError.message, success: false };
    //
    // const { data: { publicUrl } } = supabase.storage
    //     .from('driver-documents')
    //     .getPublicUrl(filePath);
    //
    // const { data, error } = await supabase
    //     .from('driver_documents')
    //     .insert({
    //         driver_profile_id: driverProfileId,
    //         document_type: documentType,
    //         file_url: publicUrl,
    //         status: 'PENDING'
    //     })
    //     .select()
    //     .single();

    console.warn('[driverService] uploadDocument: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Met à jour les préférences du chauffeur
 */
export async function updatePreferences(
    driverProfileId: string,
    preferences: Partial<Pick<DriverProfile, 'accept_long_distance' | 'accept_cash_payment' | 'accept_crypto_payment'>>
): Promise<ApiResponse<DriverProfile>> {
    // TODO: Connect to Supabase
    // const { data, error } = await supabase
    //     .from('driver_profiles')
    //     .update(preferences)
    //     .eq('id', driverProfileId)
    //     .select()
    //     .single();

    console.warn('[driverService] updatePreferences: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Obtient les chauffeurs à proximité
 */
export async function getNearbyDrivers(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
): Promise<ApiResponse<DriverLocation[]>> {
    // TODO: Connect to Supabase with PostGIS
    // This requires a custom SQL function using ST_DWithin
    // const { data, error } = await supabase.rpc('get_nearby_drivers', {
    //     lat: latitude,
    //     lng: longitude,
    //     radius_km: radiusKm
    // });

    console.warn('[driverService] getNearbyDrivers: Not connected to backend');

    return {
        data: null,
        error: 'Backend not connected',
        success: false
    };
}

/**
 * Souscrit aux nouvelles demandes de course
 */
export function subscribeToRideRequests(
    city: string,
    callback: (ride: Ride) => void
): () => void {
    // TODO: Connect to Supabase Realtime
    // const subscription = supabase
    //     .channel(`ride_requests:${city}`)
    //     .on('postgres_changes', {
    //         event: 'INSERT',
    //         schema: 'public',
    //         table: 'rides',
    //         filter: `status=eq.SEARCHING`
    //     }, (payload) => callback(payload.new as Ride))
    //     .subscribe();
    //
    // return () => subscription.unsubscribe();

    console.warn('[driverService] subscribeToRideRequests: Not connected to backend');

    return () => { };
}
