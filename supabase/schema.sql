-- ============================================================
-- KENDA DATABASE SCHEMA
-- Application Hybride : VTC (Transport) + Police (Contraventions)
-- Version: 1.0.0
-- Date: 2025-12-11
-- ============================================================

-- ============================================================
-- 1. CONFIGURATION INITIALE - EXTENSIONS
-- ============================================================

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extension pour les données géospatiales (coordonnées GPS)
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- 2. TYPES ENUM - STANDARDISATION DES VALEURS
-- ============================================================

-- Rôles utilisateurs dans l'application
CREATE TYPE user_role AS ENUM (
  'PASSENGER',      -- Passager/Client
  'DRIVER',         -- Chauffeur
  'POLICE_OFFICER', -- Agent de police
  'ADMIN'           -- Administrateur
);

-- Statuts possibles d'une course
CREATE TYPE ride_status AS ENUM (
  'SEARCHING',    -- Recherche d'un chauffeur
  'ACCEPTED',     -- Course acceptée par un chauffeur
  'ARRIVED',      -- Chauffeur arrivé au point de pickup
  'IN_PROGRESS',  -- Course en cours
  'COMPLETED',    -- Course terminée
  'CANCELLED'     -- Course annulée
);

-- Statuts possibles d'une amende
CREATE TYPE fine_status AS ENUM (
  'UNPAID',   -- Non payée
  'PAID',     -- Payée
  'DISPUTED'  -- Contestée
);

-- Types de véhicules
CREATE TYPE vehicle_type AS ENUM (
  'MOTO',  -- Moto-taxi
  'TAXI'   -- Taxi voiture
);

-- Statuts de vérification du profil chauffeur
CREATE TYPE driver_status AS ENUM (
  'PENDING',   -- En attente de vérification
  'VERIFIED',  -- Vérifié et approuvé
  'SUSPENDED', -- Suspendu
  'REJECTED'   -- Rejeté
);

-- ============================================================
-- 3. TABLES PRINCIPALES
-- ============================================================

-- ------------------------------------------------------------
-- Table: users
-- Description: Table publique synchronisée avec Supabase Auth
-- Contient les informations de base de tous les utilisateurs
-- ------------------------------------------------------------
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'PASSENGER'::user_role NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_role ON public.users(role);

COMMENT ON TABLE public.users IS 'Profils utilisateurs synchronisés avec Supabase Auth';

-- ------------------------------------------------------------
-- Table: driver_profiles
-- Description: Informations spécifiques aux chauffeurs
-- Liée à la table users via user_id
-- ------------------------------------------------------------
CREATE TABLE public.driver_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_type vehicle_type NOT NULL,
  license_plate TEXT NOT NULL,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_color TEXT,
  license_number TEXT,
  license_expiry DATE,
  status driver_status DEFAULT 'PENDING'::driver_status NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 5.00,
  total_rides INTEGER DEFAULT 0,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  is_online BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index géospatial pour trouver les chauffeurs à proximité
CREATE INDEX idx_driver_profiles_location ON public.driver_profiles(current_lat, current_lng);
CREATE INDEX idx_driver_profiles_status ON public.driver_profiles(status);
CREATE INDEX idx_driver_profiles_online ON public.driver_profiles(is_online) WHERE is_online = TRUE;

COMMENT ON TABLE public.driver_profiles IS 'Profils détaillés des chauffeurs avec leur position actuelle';

-- ------------------------------------------------------------
-- Table: rides
-- Description: Historique de toutes les courses (Team Transport)
-- Relie passagers et chauffeurs
-- ------------------------------------------------------------
CREATE TABLE public.rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passenger_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Coordonnées de départ
  pickup_lat DOUBLE PRECISION NOT NULL,
  pickup_lng DOUBLE PRECISION NOT NULL,
  pickup_address TEXT,
  
  -- Coordonnées de destination
  dest_lat DOUBLE PRECISION NOT NULL,
  dest_lng DOUBLE PRECISION NOT NULL,
  dest_address TEXT,
  
  -- Informations financières
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'FC' NOT NULL, -- Franc Congolais par défaut
  distance_km DECIMAL(8, 2),
  duration_minutes INTEGER,
  
  -- Statut et timing
  status ride_status DEFAULT 'SEARCHING'::ride_status NOT NULL,
  vehicle_type vehicle_type DEFAULT 'TAXI'::vehicle_type NOT NULL,
  
  -- Timestamps des différentes étapes
  requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Évaluations
  passenger_rating INTEGER CHECK (passenger_rating >= 1 AND passenger_rating <= 5),
  driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
  passenger_comment TEXT,
  driver_comment TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_rides_passenger ON public.rides(passenger_id);
CREATE INDEX idx_rides_driver ON public.rides(driver_id);
CREATE INDEX idx_rides_status ON public.rides(status);
CREATE INDEX idx_rides_created ON public.rides(created_at DESC);

COMMENT ON TABLE public.rides IS 'Historique complet des courses VTC';

-- ------------------------------------------------------------
-- Table: fines
-- Description: Amendes émises par la police (Team Police)
-- Relie policiers et contrevenants
-- ------------------------------------------------------------
CREATE TABLE public.fines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Acteurs
  officer_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  offender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Détails de l'amende
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'FC' NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  infraction_code TEXT,
  
  -- Localisation de l'infraction
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_address TEXT,
  
  -- Preuves
  proof_url TEXT,
  additional_photos TEXT[], -- Array d'URLs de photos supplémentaires
  
  -- Véhicule concerné (si applicable)
  vehicle_plate TEXT,
  vehicle_type vehicle_type,
  
  -- Statut et paiement
  status fine_status DEFAULT 'UNPAID'::fine_status NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_reference TEXT,
  dispute_reason TEXT,
  disputed_at TIMESTAMPTZ,
  
  -- Dates limites
  due_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_fines_officer ON public.fines(officer_id);
CREATE INDEX idx_fines_offender ON public.fines(offender_id);
CREATE INDEX idx_fines_status ON public.fines(status);
CREATE INDEX idx_fines_created ON public.fines(created_at DESC);
CREATE INDEX idx_fines_vehicle_plate ON public.fines(vehicle_plate);

COMMENT ON TABLE public.fines IS 'Registre des amendes émises par les agents de police';

-- ------------------------------------------------------------
-- Table: wallets
-- Description: Portefeuille numérique des utilisateurs
-- Supporte FC (Franc Congolais) et ADA (Cardano)
-- ------------------------------------------------------------
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Soldes
  balance_fc DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
  balance_ada DECIMAL(15, 6) DEFAULT 0.000000 NOT NULL,
  
  -- Adresse Cardano (si connectée)
  cardano_address TEXT,
  cardano_stake_address TEXT,
  
  -- Sécurité
  pin_hash TEXT,
  is_locked BOOLEAN DEFAULT FALSE NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.wallets IS 'Portefeuilles numériques multi-devises des utilisateurs';

-- ------------------------------------------------------------
-- Table: wallet_transactions
-- Description: Historique des transactions du portefeuille
-- ------------------------------------------------------------
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  
  -- Type de transaction
  type TEXT NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND', 'FINE_PAYMENT', 'RIDE_PAYMENT', 'RIDE_EARNING')),
  
  -- Montants
  amount DECIMAL(15, 6) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('FC', 'ADA')),
  
  -- Référence à une entité liée
  reference_type TEXT CHECK (reference_type IN ('RIDE', 'FINE', 'EXTERNAL')),
  reference_id UUID,
  
  -- Détails
  description TEXT,
  status TEXT DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  
  -- Blockchain (pour ADA)
  tx_hash TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_wallet_transactions_wallet ON public.wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_created ON public.wallet_transactions(created_at DESC);

COMMENT ON TABLE public.wallet_transactions IS 'Historique des transactions financières';

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS) - SÉCURITÉ
-- ============================================================

-- Activation de RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- Policies pour: users
-- Lecture: Publique (pour voir nom chauffeur/client)
-- Écriture: Seulement son propre profil
-- ------------------------------------------------------------
CREATE POLICY "Users: Lecture publique"
  ON public.users
  FOR SELECT
  USING (true);

CREATE POLICY "Users: Modification de son propre profil"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users: Insertion via trigger seulement"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------
-- Policies pour: driver_profiles
-- Lecture: Publique (pour trouver un taxi)
-- Écriture: Seulement le propriétaire
-- ------------------------------------------------------------
CREATE POLICY "Drivers: Lecture publique"
  ON public.driver_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Drivers: Création par le propriétaire"
  ON public.driver_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Drivers: Modification par le propriétaire"
  ON public.driver_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Drivers: Suppression par le propriétaire"
  ON public.driver_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Policies pour: rides
-- Visible seulement par le passager et le chauffeur concernés
-- ------------------------------------------------------------
CREATE POLICY "Rides: Visible par passager ou chauffeur"
  ON public.rides
  FOR SELECT
  USING (
    auth.uid() = passenger_id 
    OR auth.uid() = driver_id
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN', 'POLICE_OFFICER')
    )
  );

CREATE POLICY "Rides: Création par passager authentifié"
  ON public.rides
  FOR INSERT
  WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Rides: Modification par passager ou chauffeur"
  ON public.rides
  FOR UPDATE
  USING (auth.uid() = passenger_id OR auth.uid() = driver_id)
  WITH CHECK (auth.uid() = passenger_id OR auth.uid() = driver_id);

-- Policy spéciale pour les chauffeurs: voir les rides en SEARCHING
CREATE POLICY "Rides: Chauffeurs voient les courses disponibles"
  ON public.rides
  FOR SELECT
  USING (
    status = 'SEARCHING'::ride_status
    AND EXISTS (
      SELECT 1 FROM public.driver_profiles dp
      JOIN public.users u ON dp.user_id = u.id
      WHERE dp.user_id = auth.uid()
      AND dp.status = 'VERIFIED'
      AND dp.is_online = TRUE
    )
  );

-- ------------------------------------------------------------
-- Policies pour: fines
-- Visible seulement par le policier (créateur) et le contrevenant
-- ------------------------------------------------------------
CREATE POLICY "Fines: Visible par officier ou contrevenant"
  ON public.fines
  FOR SELECT
  USING (
    auth.uid() = officer_id 
    OR auth.uid() = offender_id
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'ADMIN'
    )
  );

CREATE POLICY "Fines: Création par officier de police"
  ON public.fines
  FOR INSERT
  WITH CHECK (
    auth.uid() = officer_id
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'POLICE_OFFICER'
    )
  );

CREATE POLICY "Fines: Modification par officier créateur"
  ON public.fines
  FOR UPDATE
  USING (auth.uid() = officer_id)
  WITH CHECK (auth.uid() = officer_id);

-- Permettre au contrevenant de payer/contester
CREATE POLICY "Fines: Contrevenant peut mettre à jour le statut"
  ON public.fines
  FOR UPDATE
  USING (auth.uid() = offender_id)
  WITH CHECK (
    auth.uid() = offender_id
    -- Le contrevenant peut seulement changer le statut vers PAID ou DISPUTED
  );

-- ------------------------------------------------------------
-- Policies pour: wallets
-- Visible et modifiable seulement par le propriétaire
-- ------------------------------------------------------------
CREATE POLICY "Wallets: Visible par le propriétaire"
  ON public.wallets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Wallets: Création par le propriétaire"
  ON public.wallets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Wallets: Modification par le propriétaire"
  ON public.wallets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Policies pour: wallet_transactions
-- Visible seulement par le propriétaire du wallet
-- ------------------------------------------------------------
CREATE POLICY "Transactions: Visible par le propriétaire du wallet"
  ON public.wallet_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wallets 
      WHERE id = wallet_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Transactions: Création via système"
  ON public.wallet_transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wallets 
      WHERE id = wallet_id 
      AND user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. FONCTIONS ET TRIGGERS
-- ============================================================

-- ------------------------------------------------------------
-- Fonction: handle_new_user
-- Description: Crée automatiquement un profil dans public.users
--              quand un utilisateur s'inscrit via Supabase Auth
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, phone, full_name, avatar_url, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'PASSENGER'::user_role),
    COALESCE((NEW.raw_user_meta_data->>'is_verified')::boolean, FALSE)
  );
  
  -- Créer automatiquement un wallet pour le nouvel utilisateur
  INSERT INTO public.wallets (user_id, balance_fc, balance_ada)
  VALUES (NEW.id, 0.00, 0.000000);
  
  RETURN NEW;
END;
$$;

-- Trigger sur auth.users pour créer le profil
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- Fonction: update_updated_at
-- Description: Met à jour le champ updated_at automatiquement
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers pour updated_at sur toutes les tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_driver_profiles_updated_at
  BEFORE UPDATE ON public.driver_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_rides_updated_at
  BEFORE UPDATE ON public.rides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_fines_updated_at
  BEFORE UPDATE ON public.fines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ------------------------------------------------------------
-- Fonction: update_driver_stats
-- Description: Met à jour les statistiques du chauffeur après une course
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_driver_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Met à jour seulement si la course est complétée
  IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
    UPDATE public.driver_profiles
    SET 
      total_rides = total_rides + 1,
      rating = (
        SELECT COALESCE(AVG(driver_rating), 5.00)
        FROM public.rides
        WHERE driver_id = NEW.driver_id
        AND driver_rating IS NOT NULL
      ),
      updated_at = NOW()
    WHERE user_id = NEW.driver_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_ride_completed
  AFTER UPDATE ON public.rides
  FOR EACH ROW EXECUTE FUNCTION public.update_driver_stats();

-- ============================================================
-- 6. VUES UTILES (OPTIONNEL)
-- ============================================================

-- Vue: Chauffeurs en ligne avec leur véhicule
CREATE OR REPLACE VIEW public.online_drivers AS
SELECT 
  u.id,
  u.full_name,
  u.avatar_url,
  u.phone,
  dp.vehicle_type,
  dp.license_plate,
  dp.vehicle_brand,
  dp.vehicle_model,
  dp.vehicle_color,
  dp.rating,
  dp.total_rides,
  dp.current_lat,
  dp.current_lng
FROM public.users u
JOIN public.driver_profiles dp ON u.id = dp.user_id
WHERE dp.is_online = TRUE
AND dp.status = 'VERIFIED';

-- Vue: Statistiques globales (pour admin)
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  (SELECT COUNT(*) FROM public.users) as total_users,
  (SELECT COUNT(*) FROM public.users WHERE role = 'PASSENGER') as total_passengers,
  (SELECT COUNT(*) FROM public.users WHERE role = 'DRIVER') as total_drivers,
  (SELECT COUNT(*) FROM public.users WHERE role = 'POLICE_OFFICER') as total_officers,
  (SELECT COUNT(*) FROM public.rides) as total_rides,
  (SELECT COUNT(*) FROM public.rides WHERE status = 'COMPLETED') as completed_rides,
  (SELECT COUNT(*) FROM public.fines) as total_fines,
  (SELECT COUNT(*) FROM public.fines WHERE status = 'PAID') as paid_fines,
  (SELECT COALESCE(SUM(amount), 0) FROM public.fines WHERE status = 'PAID') as total_fines_collected;

-- ============================================================
-- 7. DONNÉES INITIALES (SEEDS - OPTIONNEL)
-- ============================================================

-- Utilisateur Admin par défaut (à adapter avec un vrai UUID après création)
-- INSERT INTO public.users (id, email, full_name, role, is_verified)
-- VALUES (
--   'VOTRE_UUID_ADMIN',
--   'admin@kenda.cd',
--   'Administrateur KENDA',
--   'ADMIN',
--   TRUE
-- );

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================

-- Pour vérifier que tout est en place:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
