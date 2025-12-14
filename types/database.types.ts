/**
 * KENDA Database Types
 * Types TypeScript correspondant EXACTEMENT au schéma SQL Supabase
 * 
 * Généré manuellement depuis: supabase/schema.sql
 * @see supabase/schema.sql pour le schéma source
 */

// ============================================
// ENUM TYPES (correspondent aux types SQL)
// ============================================

export type UserRole = 'PASSENGER' | 'DRIVER' | 'POLICE_OFFICER' | 'ADMIN';

export type RideStatus =
    | 'SEARCHING'
    | 'ACCEPTED'
    | 'ARRIVED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';

export type FineStatus = 'UNPAID' | 'PAID' | 'DISPUTED';

export type VehicleType = 'MOTO' | 'TAXI';

export type DriverStatus = 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';

export type TransactionType =
    | 'DEPOSIT'
    | 'WITHDRAWAL'
    | 'PAYMENT'
    | 'REFUND'
    | 'FINE_PAYMENT'
    | 'RIDE_PAYMENT'
    | 'RIDE_EARNING';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type ReferenceType = 'RIDE' | 'FINE' | 'EXTERNAL';

export type Currency = 'FC' | 'ADA';

// ============================================
// TABLE ROW TYPES
// ============================================

/**
 * Table: public.users
 * Profils utilisateurs synchronisés avec Supabase Auth
 */
export interface UserRow {
    id: string;
    email: string | null;
    phone: string | null;
    full_name: string | null;
    avatar_url: string | null;
    role: UserRole;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Table: public.driver_profiles
 * Profils détaillés des chauffeurs avec leur position actuelle
 */
export interface DriverProfileRow {
    id: string;
    user_id: string;
    vehicle_type: VehicleType;
    license_plate: string;
    vehicle_brand: string | null;
    vehicle_model: string | null;
    vehicle_color: string | null;
    license_number: string | null;
    license_expiry: string | null;
    status: DriverStatus;
    rating: number;
    total_rides: number;
    current_lat: number | null;
    current_lng: number | null;
    is_online: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Table: public.rides
 * Historique complet des courses VTC
 */
export interface RideRow {
    id: string;
    passenger_id: string | null;
    driver_id: string | null;

    // Coordonnées de départ
    pickup_lat: number;
    pickup_lng: number;
    pickup_address: string | null;

    // Coordonnées de destination
    dest_lat: number;
    dest_lng: number;
    dest_address: string | null;

    // Informations financières
    price: number | null;
    currency: string;
    distance_km: number | null;
    duration_minutes: number | null;

    // Statut et type
    status: RideStatus;
    vehicle_type: VehicleType;

    // Timestamps des différentes étapes
    requested_at: string;
    accepted_at: string | null;
    arrived_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;

    // Évaluations
    passenger_rating: number | null;
    driver_rating: number | null;
    passenger_comment: string | null;
    driver_comment: string | null;

    created_at: string;
    updated_at: string;
}

/**
 * Table: public.fines
 * Registre des amendes émises par les agents de police
 */
export interface FineRow {
    id: string;
    officer_id: string;
    offender_id: string | null;

    // Détails de l'amende
    amount: number;
    currency: string;
    reason: string;
    description: string | null;
    infraction_code: string | null;

    // Localisation de l'infraction
    location_lat: number | null;
    location_lng: number | null;
    location_address: string | null;

    // Preuves
    proof_url: string | null;
    additional_photos: string[] | null;

    // Véhicule concerné
    vehicle_plate: string | null;
    vehicle_type: VehicleType | null;

    // Statut et paiement
    status: FineStatus;
    paid_at: string | null;
    payment_reference: string | null;
    dispute_reason: string | null;
    disputed_at: string | null;

    // Dates
    due_date: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Table: public.wallets
 * Portefeuilles numériques multi-devises des utilisateurs
 */
export interface WalletRow {
    id: string;
    user_id: string;
    balance_fc: number;
    balance_ada: number;
    cardano_address: string | null;
    cardano_stake_address: string | null;
    pin_hash: string | null;
    is_locked: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Table: public.wallet_transactions
 * Historique des transactions financières
 */
export interface WalletTransactionRow {
    id: string;
    wallet_id: string;
    type: TransactionType;
    amount: number;
    currency: Currency;
    reference_type: ReferenceType | null;
    reference_id: string | null;
    description: string | null;
    status: TransactionStatus;
    tx_hash: string | null;
    created_at: string;
}

/**
 * Table: public.driver_documents
 * Documents uploadés par les chauffeurs
 */
export interface DriverDocumentRow {
    id: string;
    driver_profile_id: string | null;
    document_type: string;
    file_url: string;
    file_path: string;
    status: string; // ou 'PENDING' | 'VERIFIED' | 'REJECTED' si on veut être strict, mais TEXT en DB pour l'instant
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
}

// ============================================
// INSERT TYPES (pour créer de nouveaux enregistrements)
// ============================================

export type UserInsert = Omit<UserRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string; // UUID optionnel (généré par auth.users)
};

export type DriverProfileInsert = Omit<DriverProfileRow, 'id' | 'created_at' | 'updated_at' | 'rating' | 'total_rides'>;

export type RideInsert = Omit<RideRow, 'id' | 'created_at' | 'updated_at' | 'requested_at'>;

export type FineInsert = Omit<FineRow, 'id' | 'created_at' | 'updated_at'>;

export type WalletInsert = Omit<WalletRow, 'id' | 'created_at' | 'updated_at'>;

export type WalletTransactionInsert = Omit<WalletTransactionRow, 'id' | 'created_at'>;

export type DriverDocumentInsert = Omit<DriverDocumentRow, 'id' | 'created_at' | 'updated_at'>;

// ============================================
// UPDATE TYPES (pour mettre à jour des enregistrements)
// ============================================

export type UserUpdate = Partial<Omit<UserRow, 'id' | 'created_at' | 'updated_at'>>;

export type DriverProfileUpdate = Partial<Omit<DriverProfileRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type RideUpdate = Partial<Omit<RideRow, 'id' | 'passenger_id' | 'created_at' | 'updated_at'>>;

export type FineUpdate = Partial<Omit<FineRow, 'id' | 'officer_id' | 'created_at' | 'updated_at'>>;

export type WalletUpdate = Partial<Omit<WalletRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type DriverDocumentUpdate = Partial<Omit<DriverDocumentRow, 'id' | 'driver_profile_id' | 'created_at' | 'updated_at'>>;

// ============================================
// DATABASE SCHEMA TYPE (pour le client Supabase)
// ============================================

export interface Database {
    public: {
        Tables: {
            users: {
                Row: UserRow;
                Insert: UserInsert;
                Update: UserUpdate;
                Relationships: [];
            };
            driver_profiles: {
                Row: DriverProfileRow;
                Insert: DriverProfileInsert;
                Update: DriverProfileUpdate;
                Relationships: [
                    {
                        foreignKeyName: 'driver_profiles_user_id_fkey';
                        columns: ['user_id'];
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    }
                ];
            };
            rides: {
                Row: RideRow;
                Insert: RideInsert;
                Update: RideUpdate;
                Relationships: [
                    {
                        foreignKeyName: 'rides_passenger_id_fkey';
                        columns: ['passenger_id'];
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'rides_driver_id_fkey';
                        columns: ['driver_id'];
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    }
                ];
            };
            fines: {
                Row: FineRow;
                Insert: FineInsert;
                Update: FineUpdate;
                Relationships: [
                    {
                        foreignKeyName: 'fines_officer_id_fkey';
                        columns: ['officer_id'];
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'fines_offender_id_fkey';
                        columns: ['offender_id'];
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    }
                ];
            };
            wallets: {
                Row: WalletRow;
                Insert: WalletInsert;
                Update: WalletUpdate;
                Relationships: [
                    {
                        foreignKeyName: 'wallets_user_id_fkey';
                        columns: ['user_id'];
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    }
                ];
            };
            wallet_transactions: {
                Row: WalletTransactionRow;
                Insert: WalletTransactionInsert;
                Update: Partial<WalletTransactionRow>;
                Relationships: [
                    {
                        foreignKeyName: 'wallet_transactions_wallet_id_fkey';
                        columns: ['wallet_id'];
                        referencedRelation: 'wallets';
                        referencedColumns: ['id'];
                    }
                ];
            };
            driver_documents: {
                Row: DriverDocumentRow;
                Insert: DriverDocumentInsert;
                Update: DriverDocumentUpdate;
                Relationships: [
                    {
                        foreignKeyName: 'driver_documents_driver_profile_id_fkey';
                        columns: ['driver_profile_id'];
                        referencedRelation: 'driver_profiles';
                        referencedColumns: ['id'];
                    }
                ];
            };
        };
        Views: {
            online_drivers: {
                Row: {
                    id: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    phone: string | null;
                    vehicle_type: VehicleType;
                    license_plate: string;
                    vehicle_brand: string | null;
                    vehicle_model: string | null;
                    vehicle_color: string | null;
                    rating: number;
                    total_rides: number;
                    current_lat: number | null;
                    current_lng: number | null;
                };
            };
            admin_stats: {
                Row: {
                    total_users: number;
                    total_passengers: number;
                    total_drivers: number;
                    total_officers: number;
                    total_rides: number;
                    completed_rides: number;
                    total_fines: number;
                    paid_fines: number;
                    total_fines_collected: number;
                };
            };
        };
        Functions: {
            // Ajoute ici les fonctions RPC si nécessaire
        };
        Enums: {
            user_role: UserRole;
            ride_status: RideStatus;
            fine_status: FineStatus;
            vehicle_type: VehicleType;
            driver_status: DriverStatus;
        };
    };
}

// ============================================
// HELPER TYPES (pour les requêtes avec jointures)
// ============================================

/**
 * Utilisateur avec son profil chauffeur (si applicable)
 */
export interface UserWithDriver extends UserRow {
    driver_profile?: DriverProfileRow;
}

/**
 * Course avec les informations du passager et du chauffeur
 */
export interface RideWithParticipants extends RideRow {
    passenger?: UserRow;
    driver?: UserRow;
    driver_profile?: DriverProfileRow;
}

/**
 * Amende avec les informations de l'officier et du contrevenant
 */
export interface FineWithParticipants extends FineRow {
    officer?: UserRow;
    offender?: UserRow;
}

/**
 * Wallet avec l'historique des transactions
 */
export interface WalletWithTransactions extends WalletRow {
    transactions?: WalletTransactionRow[];
}

// ============================================
// TYPE EXPORTS POUR COMMODITÉ
// ============================================

export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update'];

export type Views<T extends keyof Database['public']['Views']> =
    Database['public']['Views'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
    Database['public']['Enums'][T];
