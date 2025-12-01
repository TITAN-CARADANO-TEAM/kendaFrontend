"use client";

import { useState } from "react";
import MapComponent from "@/components/map/MapComponent";
import { RideRequestSheet } from "@/components/ride/RideRequestSheet";

export default function MapPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(true);
    const [destination, setDestination] = useState<[number, number] | null>(null);
    const [distance, setDistance] = useState<number>(0);

    const handleDestinationChange = (dest: [number, number] | null, dist: number) => {
        setDestination(dest);
        setDistance(dist);
    };

    return (
        <main className="relative h-screen w-full overflow-hidden bg-black">
            {/* Map Background (z-0) */}
            <div className="absolute inset-0 z-0">
                <MapComponent onDestinationChange={handleDestinationChange} />
            </div>

            {/* UI Overlays (z-10+) */}
            <div className="relative z-10 pointer-events-none h-full flex flex-col">
                {/* Ride Request Sheet */}
                <div className="mt-auto">
                    <RideRequestSheet
                        isOpen={isSheetOpen}
                        onClose={() => setIsSheetOpen(false)}
                        destination={destination}
                        distance={distance}
                    />
                </div>
            </div>

            {/* Floating Button to reopen sheet when closed */}
            {!isSheetOpen && (
                <button
                    onClick={() => setIsSheetOpen(true)}
                    className="fixed bottom-8 right-8 z-20 bg-[#F0B90B] text-black px-6 py-3 rounded-full font-bold shadow-lg hover:bg-[#F0B90B]/90 transition-all"
                >
                    Order a Ride
                </button>
            )}
        </main>
    );
}
