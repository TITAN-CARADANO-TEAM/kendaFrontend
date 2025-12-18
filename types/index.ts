/**
 * KENDA App - Types centralisés
 * Single Source of Truth pour tous les types de données
 * Ces types correspondent aux tables Supabase
 */

// ============================================
// USER TYPES
// ============================================

export type UserRole = 'PASSENGER' | 'DRIVER' | 'POLICE' | 'ADMIN';

export interface User {
    id: string;
    email: string | null;
    phone: string | null;
    full_name: string;
    avatar_url: string | null;
    role: UserRole;
    city: string | null;
    is_verified: boolean;
    wallet_address: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserStats {
    total_rides: number;
    average_rating: number;
    total_km: number;
}

// ============================================
// DRIVER TYPES
// ============================================

export type VehicleType = 'MOTO' | 'TAXI';

export type DriverStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type DocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export type DocumentType =
    | 'DRIVING_LICENSE_FRONT'
    | 'DRIVING_LICENSE_BACK'
    | 'VEHICLE_REGISTRATION'
    | 'INSURANCE'
    | 'ID_PHOTO'
    | 'SELFIE'
    | 'CRIMINAL_RECORD';

export interface DriverProfile {
    id: string;
    user_id: string;

    // Vehicle info
    vehicle_type: VehicleType;
    vehicle_brand: string;
    vehicle_model: string;
    vehicle_color: string;
    license_plate: string;
    vehicle_year: number | null;
    vehicle_photo_url: string | null;

    // Status
    status: DriverStatus;
    is_online: boolean;

    // Current location
    current_latitude: number | null;
    current_longitude: number | null;
    last_location_update: string | null;

    // Stats
    total_rides: number;
    total_earnings: number;
    average_rating: number;

    // Preferences
    accept_long_distance: boolean;
    accept_cash_payment: boolean;
    accept_crypto_payment: boolean;

    // Blockchain verification
    is_verified_on_chain: boolean;
    verification_tx_hash: string | null;

    created_at: string;
    updated_at: string;
}

export interface DriverDocument {
    id: string;
    driver_profile_id: string;
    document_type: DocumentType;
    file_url: string;
    status: DocumentStatus;
    expiry_date: string | null;
    verified_at: string | null;
    verified_by: string | null;
    created_at: string;
}

export interface DriverLocation {
    driver_id: string;
    latitude: number;
    longitude: number;
    heading?: number;
    vehicle_type: VehicleType;
    driver_name?: string;
    rating?: number;
}

export interface DriverStats {
    today_earnings: number;
    week_earnings: number;
    month_earnings: number;
    total_earnings: number;
    today_rides: number;
    total_rides: number;
    average_rating: number;
    completion_rate: number;
}

// ============================================
// RIDE TYPES
// ============================================

export type RideStatus =
    | 'SEARCHING'
    | 'ACCEPTED'
    | 'DRIVER_ASSIGNED'
    | 'DRIVER_ARRIVED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'WALLET' | 'CRYPTO';

export interface Ride {
    id: string;

    // Participants
    passenger_id: string;
    driver_id: string | null;

    // Locations
    pickup_lat: number;
    pickup_lng: number;
    pickup_address: string | null;
    dest_lat: number;
    dest_lng: number;
    dest_address: string | null;

    // Trip details
    distance_km: number | null;
    duration_minutes: number | null;
    route_polyline: string | null;

    // Pricing
    price: number;
    final_price: number | null;
    currency: string;
    payment_method: PaymentMethod;
    vehicle_type: VehicleType;

    // Status
    status: RideStatus;
    cancellation_reason: string | null;
    cancelled_by: string | null;

    // Timestamps
    requested_at: string;
    accepted_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;

    // Scheduling
    scheduled_for: string | null;
    is_scheduled: boolean;

    created_at: string;

    // Joined data (optional, for display)
    driver?: Partial<User>;
    passenger?: Partial<User>;
    driver_profile?: Partial<DriverProfile>;
    rating?: RideRating;
}

export interface RideRequest {
    pickup_lat: number;
    pickup_lng: number;
    pickup_address?: string;
    dest_lat: number;
    dest_lng: number;
    dest_address?: string;
    vehicle_type?: VehicleType;
    payment_method?: PaymentMethod;
    scheduled_for?: string;
}

export interface RideEstimate {
    distance_km: number;
    duration_minutes: number;
    estimated_price: number;
    currency: string;
}

export interface RideRating {
    id: string;
    ride_id: string;
    rated_by: string;
    rated_user: string;
    rating: number;
    comment: string | null;
    created_at: string;
}

// ============================================
// WALLET TYPES
// ============================================

export interface Wallet {
    id: string;
    user_id: string;
    balance_fc: number;
    balance_ada: number;
    cardano_address: string | null;
    is_connected: boolean;
    created_at: string;
    updated_at: string;
}

export type TransactionType =
    | 'RIDE_PAYMENT'
    | 'RIDE_EARNING'
    | 'TOP_UP'
    | 'WITHDRAWAL'
    | 'BONUS'
    | 'REFUND';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Transaction {
    id: string;
    wallet_id: string;
    type: TransactionType;
    amount: number;
    currency: string;
    status: TransactionStatus;
    reference_id: string | null;
    description: string | null;
    tx_hash: string | null;
    created_at: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'TRANSPORT' | 'PAYMENT' | 'SYSTEM' | 'PROMO';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    is_read: boolean;
    data: Record<string, unknown> | null;
    created_at: string;
}

// ============================================
// POLICE TYPES (Pour l'extension Police)
// ============================================

export type FineStatus = 'PENDING' | 'PAID' | 'CONTESTED' | 'CANCELLED';

export type InfractionType =
    | 'SPEEDING'
    | 'RED_LIGHT'
    | 'ILLEGAL_PARKING'
    | 'NO_LICENSE'
    | 'NO_INSURANCE'
    | 'DANGEROUS_DRIVING'
    | 'OTHER';

export interface Fine {
    id: string;
    officer_id: string;
    driver_id: string | null;
    license_plate: string;
    infraction_type: InfractionType;
    description: string | null;
    amount: number;
    currency: string;
    status: FineStatus;
    location_latitude: number | null;
    location_longitude: number | null;
    location_address: string | null;
    photo_urls: string[];
    paid_at: string | null;
    created_at: string;

    // Joined data
    officer?: Partial<User>;
    driver?: Partial<User>;
}

// ============================================
// CITY TYPES
// ============================================

export interface City {
    id: string;
    name: string;
    country: string;
    is_active: boolean;
    base_price: number;
    price_per_km: number;
    created_at: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
}

// ============================================
// FORM DATA TYPES
// ============================================

export interface DriverApplicationData {
    vehicle_type: VehicleType;
    vehicle_brand: string;
    vehicle_model: string;
    license_plate: string;
    vehicle_color: string;
    city: string;
    documents: {
        driving_license_front: File | null;
        driving_license_back: File | null;
        vehicle_registration: File | null;
        insurance: File | null;
        selfie: File | null;
    };
}

export interface LoginData {
    email_or_phone: string;
    password: string;
}

export interface RegisterData {
    full_name: string;
    email?: string;
    phone?: string;
    password: string;
    role: UserRole;
    city?: string;
}
