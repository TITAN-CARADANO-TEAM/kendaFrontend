# 📋 BRIEF TECHNIQUE BACKEND - KENDA App

## 📌 Contexte du Projet

**KENDA** est une plateforme de VTC (transport à la demande) sécurisée par la blockchain Cardano, développée pour le marché de Goma, RDC. L'application frontend est développée en **Next.js 14** avec **TypeScript** et est déployée sur Vercel.

Ce document décrit toutes les fonctionnalités backend nécessaires pour faire fonctionner l'application.

---

## 🛠 Stack Backend Recommandée

- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Stockage fichiers**: Supabase Storage
- **API Real-time**: Supabase Realtime (pour le tracking en temps réel)
- **Fonctions serverless**: Supabase Edge Functions (pour la logique métier)
- **Intégration Blockchain**: Cardano (pour la vérification d'identité on-chain)

---

## 👥 Types d'Utilisateurs

### 1. **PASSENGER (Passager)**
- Peut commander des courses
- Possède un portefeuille (KENDA tokens + ADA)
- A un historique de courses
- Peut noter les chauffeurs

### 2. **DRIVER (Chauffeur)**
- Peut accepter/refuser des courses
- Possède un profil vérifié (documents)
- A des gains et un portefeuille
- Peut gérer son statut (EN LIGNE / HORS LIGNE)

---

## 📊 Modèle de Données (Tables Supabase)

### Table: `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role ENUM('PASSENGER', 'DRIVER') DEFAULT 'PASSENGER',
    city VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    wallet_address TEXT, -- Adresse Cardano
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `driver_profiles`
```sql
CREATE TABLE driver_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Informations véhicule
    vehicle_type ENUM('MOTO', 'TAXI') NOT NULL,
    vehicle_brand VARCHAR(100) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    vehicle_color VARCHAR(50) NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    vehicle_year INTEGER,
    vehicle_photo_url TEXT,
    
    -- Statut
    status ENUM('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED') DEFAULT 'PENDING',
    is_online BOOLEAN DEFAULT FALSE,
    
    -- Localisation temps réel
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    last_location_update TIMESTAMP,
    
    -- Statistiques
    total_rides INTEGER DEFAULT 0,
    total_earnings DECIMAL(12, 2) DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 5.00,
    
    -- Préférences
    accept_long_distance BOOLEAN DEFAULT TRUE,
    accept_cash_payment BOOLEAN DEFAULT TRUE,
    accept_crypto_payment BOOLEAN DEFAULT FALSE,
    
    -- Vérification blockchain
    is_verified_on_chain BOOLEAN DEFAULT FALSE,
    verification_tx_hash TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `driver_documents`
```sql
CREATE TABLE driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_profile_id UUID REFERENCES driver_profiles(id) ON DELETE CASCADE,
    document_type ENUM(
        'DRIVING_LICENSE_FRONT',
        'DRIVING_LICENSE_BACK', 
        'VEHICLE_REGISTRATION',
        'INSURANCE',
        'ID_PHOTO',
        'SELFIE',
        'CRIMINAL_RECORD'
    ) NOT NULL,
    file_url TEXT NOT NULL,
    status ENUM('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED') DEFAULT 'PENDING',
    expiry_date DATE,
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `rides`
```sql
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Participants
    passenger_id UUID REFERENCES users(id) NOT NULL,
    driver_id UUID REFERENCES users(id),
    
    -- Localisation
    pickup_latitude DECIMAL(10, 8) NOT NULL,
    pickup_longitude DECIMAL(11, 8) NOT NULL,
    pickup_address TEXT,
    destination_latitude DECIMAL(10, 8) NOT NULL,
    destination_longitude DECIMAL(11, 8) NOT NULL,
    destination_address TEXT,
    
    -- Détails du trajet
    distance_km DECIMAL(6, 2),
    duration_minutes INTEGER,
    route_polyline TEXT, -- Encoded polyline pour affichage
    
    -- Prix
    estimated_price DECIMAL(10, 2) NOT NULL,
    final_price DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'FC', -- FC (Franc Congolais) ou ADA
    payment_method ENUM('CASH', 'WALLET', 'CRYPTO') DEFAULT 'CASH',
    
    -- Statut
    status ENUM(
        'SEARCHING',      -- Recherche de chauffeur
        'DRIVER_ASSIGNED', -- Chauffeur assigné
        'DRIVER_ARRIVED', -- Chauffeur arrivé
        'IN_PROGRESS',    -- Course en cours
        'COMPLETED',      -- Terminée
        'CANCELLED'       -- Annulée
    ) DEFAULT 'SEARCHING',
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id),
    
    -- Timestamps
    requested_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Programmation (optionnel)
    scheduled_for TIMESTAMP,
    is_scheduled BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `ride_ratings`
```sql
CREATE TABLE ride_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
    rated_by UUID REFERENCES users(id) NOT NULL,
    rated_user UUID REFERENCES users(id) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `wallets`
```sql
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    balance_fc DECIMAL(12, 2) DEFAULT 0, -- Solde en Francs Congolais
    balance_ada DECIMAL(15, 6) DEFAULT 0, -- Solde en ADA (Cardano)
    cardano_address TEXT,
    is_connected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `transactions`
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id) NOT NULL,
    type ENUM(
        'RIDE_PAYMENT',      -- Paiement d'une course
        'RIDE_EARNING',      -- Gain d'une course (chauffeur)
        'TOP_UP',            -- Recharge
        'WITHDRAWAL',        -- Retrait
        'BONUS',             -- Bonus
        'REFUND'             -- Remboursement
    ) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status ENUM('PENDING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    reference_id UUID, -- Peut référencer une course ou autre
    description TEXT,
    tx_hash TEXT, -- Hash de la transaction blockchain (si applicable)
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `notifications`
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type ENUM('TRANSPORT', 'PAYMENT', 'SYSTEM', 'PROMO') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB, -- Données supplémentaires (ex: ride_id)
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `cities`
```sql
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'RDC',
    is_active BOOLEAN DEFAULT TRUE,
    base_price DECIMAL(10, 2) DEFAULT 2000, -- Prix de base
    price_per_km DECIMAL(10, 2) DEFAULT 500, -- Prix par km
    created_at TIMESTAMP DEFAULT NOW()
);

-- Données initiales
INSERT INTO cities (name) VALUES 
    ('Goma'),
    ('Bukavu'),
    ('Kinshasa'),
    ('Lubumbashi');
```

---

## 🔌 API Endpoints Nécessaires

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Inscription (passager ou chauffeur) |
| POST | `/auth/login` | Connexion (email/phone + password) |
| POST | `/auth/logout` | Déconnexion |
| POST | `/auth/forgot-password` | Mot de passe oublié |
| GET | `/auth/me` | Obtenir l'utilisateur courant |

### Utilisateurs
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/users/profile` | Obtenir le profil utilisateur |
| PUT | `/users/profile` | Modifier le profil |
| POST | `/users/avatar` | Upload avatar |

### Chauffeurs
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/drivers/apply` | Soumettre candidature chauffeur |
| GET | `/drivers/profile` | Obtenir le profil chauffeur |
| PUT | `/drivers/profile` | Modifier le profil chauffeur |
| POST | `/drivers/documents` | Upload document |
| GET | `/drivers/documents` | Liste des documents |
| PUT | `/drivers/status` | Changer statut (online/offline) |
| PUT | `/drivers/location` | Mettre à jour la position GPS |
| GET | `/drivers/earnings` | Statistiques de gains |
| GET | `/drivers/history` | Historique des courses |
| PUT | `/drivers/preferences` | Modifier les préférences |

### Courses (Rides)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/rides/request` | Demander une course |
| GET | `/rides/:id` | Détails d'une course |
| PUT | `/rides/:id/accept` | Chauffeur accepte |
| PUT | `/rides/:id/arrived` | Chauffeur est arrivé |
| PUT | `/rides/:id/start` | Démarrer la course |
| PUT | `/rides/:id/complete` | Terminer la course |
| PUT | `/rides/:id/cancel` | Annuler la course |
| POST | `/rides/:id/rate` | Noter la course |
| GET | `/rides/nearby-drivers` | Chauffeurs à proximité |
| GET | `/rides/estimate` | Estimation prix/temps |
| GET | `/rides/history` | Historique des courses |

### Portefeuille (Wallet)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/wallet` | Obtenir le solde |
| POST | `/wallet/connect` | Connecter portefeuille Cardano |
| POST | `/wallet/topup` | Recharger le compte |
| POST | `/wallet/withdraw` | Retrait (chauffeur) |
| GET | `/wallet/transactions` | Historique des transactions |

### Notifications
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/notifications` | Liste des notifications |
| PUT | `/notifications/:id/read` | Marquer comme lu |
| PUT | `/notifications/read-all` | Tout marquer comme lu |

---

## 🔄 Fonctionnalités Real-time (Supabase Realtime)

### Subscriptions nécessaires:

1. **Suivi de course en temps réel**
   - Canal: `ride:{ride_id}`
   - Événements: `location_update`, `status_change`

2. **Position du chauffeur (pour passager)**
   - Canal: `driver_location:{driver_id}`
   - Données: `{ latitude, longitude, heading }`

3. **Nouvelles demandes de course (pour chauffeurs)**
   - Canal: `ride_requests:{city}`
   - Filtre: Chauffeurs en ligne dans la zone

4. **Notifications push**
   - Canal: `notifications:{user_id}`

---

## 📁 Supabase Storage Buckets

### Buckets à créer:

1. **`avatars`**
   - Photos de profil utilisateurs
   - Public: Oui
   - Max size: 2MB
   - Formats: jpg, png, webp

2. **`driver-documents`**
   - Documents des chauffeurs (permis, assurance, etc.)
   - Public: Non (accès restreint)
   - Max size: 10MB
   - Formats: jpg, png, pdf

3. **`vehicle-photos`**
   - Photos des véhicules
   - Public: Oui
   - Max size: 5MB
   - Formats: jpg, png, webp

---

## 🔐 Règles de Sécurité (RLS Policies)

### Exemples de policies:

```sql
-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Drivers can only see their own documents
CREATE POLICY "Drivers can view own documents"
    ON driver_documents FOR SELECT
    USING (
        driver_profile_id IN (
            SELECT id FROM driver_profiles WHERE user_id = auth.uid()
        )
    );

-- Rides: Passenger or driver can view their rides
CREATE POLICY "Users can view their rides"
    ON rides FOR SELECT
    USING (
        passenger_id = auth.uid() OR driver_id = auth.uid()
    );
```

---

## 🧮 Logique Métier (Edge Functions)

### 1. **Calcul du prix**
```typescript
function calculatePrice(distanceKm: number, cityId: string): number {
    const city = await getCityPricing(cityId);
    return city.base_price + (city.price_per_km * distanceKm);
}
```

### 2. **Attribution de chauffeur**
```typescript
async function findNearbyDrivers(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 5
): Promise<Driver[]> {
    // Utiliser PostGIS pour la requête géospatiale
    // Filtrer par: is_online = true, status = 'VERIFIED'
    // Ordonner par distance
}
```

### 3. **Mise à jour de la note moyenne**
```typescript
async function updateDriverRating(driverId: string): Promise<void> {
    const avgRating = await calculateAverageRating(driverId);
    await updateDriverProfile(driverId, { average_rating: avgRating });
}
```

### 4. **Traitement des paiements**
```typescript
async function processRidePayment(rideId: string): Promise<void> {
    const ride = await getRide(rideId);
    
    // Débit du passager
    await debitWallet(ride.passenger_id, ride.final_price);
    
    // Crédit du chauffeur (moins commission)
    const commission = ride.final_price * 0.15; // 15% commission
    await creditWallet(ride.driver_id, ride.final_price - commission);
    
    // Créer les transactions
    await createTransaction({ ... });
}
```

---

## 📱 Push Notifications (FCM)

### Scénarios de notifications:

| Événement | Destinataire | Message |
|-----------|--------------|---------|
| Nouvelle course disponible | Chauffeur | "Nouvelle course près de vous!" |
| Chauffeur assigné | Passager | "Jean arrive dans 5 min" |
| Chauffeur arrivé | Passager | "Votre chauffeur est arrivé" |
| Course terminée | Passager | "Merci! N'oubliez pas de noter" |
| Paiement reçu | Chauffeur | "Vous avez reçu 3,500 FC" |
| Documents validés | Chauffeur | "Votre compte est activé!" |

---

## 🔗 Intégration Blockchain Cardano

### Fonctionnalités:

1. **Vérification d'identité on-chain**
   - Enregistrer le hash des documents vérifiés sur la blockchain
   - Émettre un "badge" NFT de chauffeur vérifié

2. **Paiement en ADA**
   - Permettre aux passagers de payer en ADA
   - Conversion automatique FC ↔ ADA

3. **Historique immutable**
   - Enregistrer les courses terminées sur la blockchain
   - Preuve de travail pour les chauffeurs

---

## 📋 Variables d'Environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Cardano (optionnel pour phase 1)
BLOCKFROST_API_KEY=xxx
CARDANO_NETWORK=mainnet

# Push Notifications
FIREBASE_SERVER_KEY=xxx

# Autres
OSRM_API_URL=https://router.project-osrm.org
```

---

## 📅 Phases de Développement Suggérées

### Phase 1: MVP (2-3 semaines)
- [ ] Auth (inscription, connexion, logout)
- [ ] Profil utilisateur basique
- [ ] Demande de course (passager)
- [ ] Mode chauffeur (online/offline)
- [ ] Attribution manuelle de chauffeur
- [ ] Historique des courses

### Phase 2: Core Features (2 semaines)
- [ ] Upload documents chauffeur
- [ ] Validation documents (admin)
- [ ] Tracking GPS temps réel
- [ ] Notifications push
- [ ] Portefeuille basique (FC)

### Phase 3: Avancé (2 semaines)
- [ ] Intégration paiement Mobile Money
- [ ] Rating et commentaires
- [ ] Statistiques chauffeur
- [ ] Courses programmées

### Phase 4: Blockchain (2-3 semaines)
- [ ] Connexion wallet Cardano
- [ ] Paiement en ADA
- [ ] Vérification on-chain

---

## 📞 Contact

Pour toute question sur ce brief, contacter l'équipe frontend.

---

*Document généré le 11 Décembre 2025*
*Version: 1.0*
