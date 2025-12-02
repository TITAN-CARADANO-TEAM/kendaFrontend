"use client";

import { useState, useEffect } from "react";
import { Menu, Loader2, ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import MapComponent from "@/components/map/MapComponent";
import { RideRequestSheet } from "@/components/ride/RideRequestSheet";
import { DriverTrustCard } from "@/components/driver/DriverTrustCard";
import { ActiveRideOverlay } from "@/components/ride/ActiveRideOverlay";
import { Button } from "@/components/ui/button";

type Step = 'IDLE' | 'SELECTING' | 'SEARCHING' | 'RIDE_ACTIVE';

export default function MapPage() {
    const [step, setStep] = useState<Step>('IDLE');
    const [destination, setDestination] = useState<[number, number] | null>(null);
    const [distance, setDistance] = useState<number>(0);

    // Mock Ride Data (calculated based on distance for realism)
    const rideTime = Math.ceil(distance * 2) + " min";
    const rideDistance = distance.toFixed(1) + " km";
    const arrivalTime = new Date(Date.now() + Math.ceil(distance * 2) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handleDestinationChange = (dest: [number, number] | null, dist: number) => {
        setDestination(dest);
        setDistance(dist);
        if (dest && step === 'IDLE') {
            setStep('SELECTING');
        }
    };

    const handleOrder = () => {
        setStep('SEARCHING');
        // Simulate finding a driver
        setTimeout(() => {
            setStep('RIDE_ACTIVE');
        }, 2500);
    };

    return (
        <main className="relative h-screen w-full overflow-hidden bg-black">
            {/* Map Background (z-0) */}
            <div className="absolute inset-0 z-0">
                <MapComponent onDestinationChange={handleDestinationChange} />
            </div>

            {/* Header Overlay (Always visible) */}
            <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white bg-black/20 backdrop-blur-md rounded-full hover:bg-black/40 h-10 w-10 p-0"
                        onClick={() => window.location.href = '/'}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </div>

                {/* Desktop: Centered Logo */}
                <h1 className="font-heading font-bold text-xl text-white drop-shadow-md tracking-wide absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
                    KENDA
                </h1>

                {/* Desktop: Menu Button on right */}
                <div className="pointer-events-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white bg-black/20 backdrop-blur-md rounded-full hover:bg-black/40 h-10 w-10 p-0"
                    >
                        <Menu className="w-6 h-6" />
                    </Button>
                </div>
            </header>

            {/* UI Overlays based on Step - Responsive Container */}
            <div className="relative z-10 pointer-events-none h-full flex flex-col md:flex-row md:items-start md:p-6">

                {/* Desktop Sidebar Container */}
                <div className="md:w-[400px] md:h-full md:flex md:flex-col md:justify-end md:mr-auto relative w-full h-full flex flex-col">

                    {/* IDLE State: Floating Action Button */}
                    <AnimatePresence>
                        {step === 'IDLE' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-8 left-4 right-4 md:static md:mb-0 pointer-events-auto mt-auto"
                            >
                                <Button
                                    onClick={() => setStep('SELECTING')}
                                    className="w-full h-14 bg-[#F0B90B] text-black font-bold text-lg rounded-xl shadow-lg hover:bg-[#F0B90B]/90"
                                >
                                    Où allez-vous ?
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* SELECTING State: Bottom Sheet */}
                    {/* On Desktop, we might want this to be a side panel instead of bottom sheet, but for now let's constrain width */}
                    <div className="md:absolute md:bottom-0 md:left-0 md:w-full">
                        <RideRequestSheet
                            isOpen={step === 'SELECTING'}
                            onClose={() => setStep('IDLE')}
                            destination={destination}
                            distance={distance}
                            onOrder={handleOrder}
                        />
                    </div>

                    {/* SEARCHING State: Loader Overlay */}
                    <AnimatePresence>
                        {step === 'SEARCHING' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 pointer-events-auto md:rounded-2xl"
                            >
                                <div className="bg-[#0C0C0C] p-8 rounded-2xl border border-[#1A1A1A] flex flex-col items-center shadow-2xl">
                                    <Loader2 className="w-12 h-12 text-[#F0B90B] animate-spin mb-4" />
                                    <h3 className="text-white font-heading font-bold text-xl mb-2">Recherche d'un chauffeur...</h3>
                                    <p className="text-[#9A9A9A] text-sm">Nous contactons les chauffeurs à proximité</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* RIDE_ACTIVE State: Driver Card & Info Overlay */}
                    <AnimatePresence>
                        {step === 'RIDE_ACTIVE' && (
                            <div className="pointer-events-auto w-full flex flex-col gap-4 mt-auto md:mb-0 pb-8 px-4 md:px-0">
                                {/* Driver Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <DriverTrustCard
                                        driverName="Jean-Pierre M."
                                        driverImage="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60"
                                        vehicleModel="Toyota Corolla"
                                        plateNumber="KV 1234 BB"
                                        isVerified={true}
                                        rating={4.9}
                                    />
                                </motion.div>

                                {/* Ride Info */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <ActiveRideOverlay
                                        remainingTime={rideTime}
                                        remainingDistance={rideDistance}
                                        arrivalTime={arrivalTime}
                                        className="static" // Remove absolute positioning for flex layout
                                    />
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
