"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Menu, Loader2, ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { RideRequestSheet } from "@/components/ride/RideRequestSheet";
import { DriverTrustCard } from "@/components/driver/DriverTrustCard";
import { ActiveRideOverlay } from "@/components/ride/ActiveRideOverlay";
import { RideRatingScreen } from "@/components/ride/RideRatingScreen";
import { SafetyToolkit } from "@/components/ride/SafetyToolkit";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import * as rideService from "@/services/rideService";
import type { DriverLocation, Ride } from "@/types";

// Dynamic import with SSR disabled to avoid "window is not defined" error from Leaflet
const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-[#0C0C0C] text-white">
            <Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" />
        </div>
    ),
});

type Step = 'IDLE' | 'SELECTING' | 'SEARCHING' | 'RIDE_ACTIVE' | 'RIDE_COMPLETED';

export default function MapPage() {
    const router = useRouter();
    const t = useTranslations('Ride');
    const [step, setStep] = useState<Step>('IDLE');
    const [destination, setDestination] = useState<[number, number] | null>(null);
    const [distance, setDistance] = useState<number>(0);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [nearbyDrivers, setNearbyDrivers] = useState<DriverLocation[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<DriverLocation | null>(null);
    const [currentRide, setCurrentRide] = useState<Ride | null>(null);
    const { user } = useAuth();

    const handleDriverSelect = (driver: DriverLocation) => {
        setSelectedDriver(driver);
        // Automatically open the sheet to confirm logic
        if (step === 'IDLE' || step === 'SELECTING') {
            setStep('SELECTING');
        }
    };

    const handleClearDriver = () => {
        setSelectedDriver(null);
    };

    // Get User Position & Drivers
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const fetchDrivers = async (latitude: number, longitude: number) => {
            const drivers = await rideService.fetchNearbyDrivers(latitude, longitude);
            console.log('[MapPage] Fetched drivers:', drivers.length);
            setNearbyDrivers(drivers);
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setUserLocation([latitude, longitude]);
                    await fetchDrivers(latitude, longitude);

                    // Refresh drivers every 10 seconds
                    intervalId = setInterval(() => {
                        fetchDrivers(latitude, longitude);
                    }, 10000);
                },
                (err) => console.error("Loc error:", err)
            );
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    // Mock Ride Data (calculated based on distance for realism)
    const rideTime = Math.ceil(distance * 2) + " min";
    const rideDistance = distance.toFixed(1) + " km";
    const arrivalTime = new Date(Date.now() + Math.ceil(distance * 2) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Calculate price for rating screen
    const estimatedPrice = (2000 + (500 * distance)).toLocaleString() + " FC";

    const handleDestinationChange = (dest: [number, number] | null, dist: number) => {
        setDestination(dest);
        setDistance(dist);
        if (dest && step === 'IDLE') {
            setStep('SELECTING');
        }
    };

    const handleOrder = async () => {
        if (!user || !userLocation || !destination) {
            alert(t('loginRequired') || "Veuillez vous connecter et activer la localisation");
            return;
        }

        setStep('SEARCHING');

        // Clean price string "2,500 FC" -> 2500
        const priceValue = parseInt(estimatedPrice.replace(/\D/g, '')) || 2000;

        const result = await rideService.createRide({
            passenger_id: user.id,
            pickup_latitude: userLocation[0],
            pickup_longitude: userLocation[1],
            pickup_address: "Ma position", // TODO: Reverse geocoding
            destination_latitude: destination[0],
            destination_longitude: destination[1],
            destination_address: "Destination", // TODO: Reverse geocoding
            distance: distance,
            duration: Math.ceil(distance * 3),
            price: priceValue,
            vehicle_type: 'TAXI',
            specificDriverId: selectedDriver?.driver_id
        } as any);

        if (result.success && result.data) {
            setCurrentRide(result.data);

            // Subscribe to Ride Updates
            const unsubscribe = rideService.subscribeToRide(result.data.id, async (updatedRide) => {
                const ride = updatedRide as any;
                console.log("📨 [Client] Ride update received:", ride.status);
                setCurrentRide(updatedRide);

                // Driver accepted the ride
                if (ride.status === 'ACCEPTED' || ride.status === 'DRIVER_ASSIGNED' || ride.status === 'ARRIVED' || ride.status === 'DRIVER_ARRIVED') {
                    console.log("✅ [Client] Driver assigned! Switching to RIDE_ACTIVE");
                    // Fetch full details (driver info)
                    const fullRide = await rideService.getRideStatus(ride.id);
                    if (fullRide.success && fullRide.data) {
                        setCurrentRide(fullRide.data);
                    }
                    setStep('RIDE_ACTIVE');
                } else if (ride.status === 'IN_PROGRESS') {
                    console.log("🚗 [Client] Ride in progress");
                    setStep('RIDE_ACTIVE');
                } else if (ride.status === 'COMPLETED') {
                    console.log("🏁 [Client] Ride completed");
                    setStep('RIDE_COMPLETED');
                } else if (ride.status === 'CANCELLED') {
                    console.log("❌ [Client] Ride cancelled");
                    alert("La course a été annulée");
                    setStep('IDLE');
                    setCurrentRide(null);
                }
            });

            // Cleanup subscription on unmount or step change? 
            // Better to keep it until flow ends.
        } else {
            alert("Erreur: " + (result.error || "Impossible de commander"));
            setStep('IDLE');
        }
    };

    // Remove simulated ride completion
    /* 
    useEffect(() => { ... } 
    */


    // Clean up simulation effect
    /*
    useEffect(() => {
        if (step === 'RIDE_ACTIVE') {
            const timer = setTimeout(() => {
                setStep('RIDE_COMPLETED');
            }, 8000); // Ride finishes after 8 seconds for demo
            return () => clearTimeout(timer);
        }
    }, [step]);
    */

    const handleRatingComplete = () => {
        setStep('IDLE');
        setDestination(null);
        setDistance(0);
    };

    return (
        <main className="relative w-full h-full overflow-hidden bg-black">
            {/* Map Background (z-0) - Covers EVERYTHING */}
            <div className="absolute inset-0 z-0">
                <MapComponent
                    onDestinationChange={handleDestinationChange}
                    nearbyDrivers={nearbyDrivers}
                    onDriverSelect={handleDriverSelect}
                    userLocation={userLocation}
                    trackedDriverId={(step === 'RIDE_ACTIVE' && currentRide?.status !== 'IN_PROGRESS') ? currentRide?.driver_id : null}
                />
            </div>

            {/* Floating Header (App Shell) */}
            <header className="absolute top-0 left-0 right-0 z-40 p-4 pt-safe flex items-center justify-between pointer-events-none">
                {/* Left: Menu/Back */}
                <div className="pointer-events-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-[#0C0C0C] text-white rounded-full h-10 w-10 shadow-lg border border-[#1A1A1A]"
                        onClick={() => router.push('/')} // Or open menu
                    >
                        {step === 'IDLE' ? <Menu className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                    </Button>
                </div>

                {/* Center: Title */}
                <h1 className="font-heading font-bold text-lg text-white drop-shadow-md tracking-wide pointer-events-auto">
                    {step === 'IDLE' ? 'KENDA' : 'Ride'}
                </h1>

                {/* Right: Notifications/SOS */}
                <div className="pointer-events-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-[#0C0C0C] text-white rounded-full h-10 w-10 shadow-lg border border-[#1A1A1A]"
                        onClick={() => {
                            if (step !== 'RIDE_ACTIVE') {
                                router.push('/notifications');
                            }
                        }}
                    >
                        {step === 'RIDE_ACTIVE' ? (
                            <SafetyToolkit />
                        ) : (
                            <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-white" /> // Notification dot placeholder or Bell icon
                        )}
                    </Button>
                </div>
            </header>

            {/* UI Overlays */}
            <div className="relative z-10 pointer-events-none h-full flex flex-col justify-end pb-[calc(4rem+env(safe-area-inset-bottom))]">
                {/* pb-safe + nav height (approx 4rem) */}

                {/* IDLE State: Floating Action Button */}
                <AnimatePresence>
                    {step === 'IDLE' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="p-4 pointer-events-auto"
                        >
                            <Button
                                onClick={() => setStep('SELECTING')}
                                className="w-full h-14 bg-[#F0B90B] text-black font-bold text-lg rounded-xl shadow-lg hover:bg-[#F0B90B]/90"
                            >
                                {t('whereTo')}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SELECTING State: Bottom Sheet */}
                {/* We place this outside the padded container if we want it to cover the nav bar, 
                    but user said "pb-24... pour que le contenu ne soit pas caché". 
                    However, drawers usually cover nav bars. 
                    I'll keep it here but ensure it has high z-index if needed. 
                    Actually, RideRequestSheet is likely a drawer. 
                */}
                <div className="pointer-events-auto">
                    <RideRequestSheet
                        isOpen={step === 'SELECTING'}
                        onClose={() => setStep('IDLE')}
                        destination={destination}
                        distance={distance}
                        onOrder={handleOrder}
                        selectedDriver={selectedDriver}
                        onDriverClear={handleClearDriver}
                    />
                </div>

                {/* SEARCHING State: Loader Overlay */}
                <AnimatePresence>
                    {step === 'SEARCHING' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 pointer-events-auto"
                        >
                            <div className="bg-[#0C0C0C] p-8 rounded-2xl border border-[#1A1A1A] flex flex-col items-center shadow-2xl">
                                <Loader2 className="w-12 h-12 text-[#F0B90B] animate-spin mb-4" />
                                <h3 className="text-white font-heading font-bold text-xl mb-2">{t('searching')}</h3>
                                <p className="text-[#9A9A9A] text-sm">{t('contactingDrivers')}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* RIDE_ACTIVE State: Driver Card & Info */}
                <AnimatePresence>
                    {step === 'RIDE_ACTIVE' && (
                        <div className="pointer-events-auto w-full flex flex-col gap-4 p-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <DriverTrustCard
                                    driverName={currentRide?.driver?.full_name || "Chauffeur"}
                                    driverImage={currentRide?.driver?.avatar_url || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60"}
                                    vehicleModel={(currentRide as any)?.driver_profile?.vehicle_model || "Véhicule"}
                                    plateNumber={(currentRide as any)?.driver_profile?.license_plate || "PLAQU"}
                                    isVerified={true}
                                    rating={(currentRide as any)?.driver_profile?.rating || 5.0}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <ActiveRideOverlay
                                    remainingTime={rideTime} // Could be real-time
                                    remainingDistance={rideDistance} // Could be real-time
                                    arrivalTime={arrivalTime}
                                    className="static"
                                />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* RIDE_COMPLETED State: Rating Screen (Full Screen Overlay) */}
            <AnimatePresence>
                {step === 'RIDE_COMPLETED' && (
                    <div className="absolute inset-0 z-[60] bg-black">
                        <RideRatingScreen
                            price={estimatedPrice}
                            onComplete={handleRatingComplete}
                        />
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
