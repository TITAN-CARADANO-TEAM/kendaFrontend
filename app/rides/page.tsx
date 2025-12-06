"use client";

import React, { useState } from "react";
import { Clock, MapPin, Calendar, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data - Past Rides
const PAST_RIDES = [
    {
        id: "1",
        date: "Aujourd'hui, 14:30",
        from: "Entrée Président",
        to: "Marché Birere",
        price: "3000 FC",
        status: "COMPLETED",
    },
    {
        id: "2",
        date: "Hier, 09:15",
        from: "Port de Goma",
        to: "Rond-point Signers",
        price: "2500 FC",
        status: "COMPLETED",
    },
    {
        id: "3",
        date: "03 Dec, 18:00",
        from: "Hôtel Serena",
        to: "Aéroport International",
        price: "5000 FC",
        status: "COMPLETED",
    },
    {
        id: "4",
        date: "01 Dec, 12:45",
        from: "ULPGL",
        to: "Centre-ville",
        price: "1500 FC",
        status: "CANCELLED",
    },
    {
        id: "5",
        date: "28 Nov, 08:30",
        from: "Ndosho",
        to: "Hôpital Général",
        price: "2000 FC",
        status: "COMPLETED",
    }
];

// Mock Data - Scheduled Future Rides
const SCHEDULED_RIDES = [
    {
        id: "s1",
        date: "Demain, 08:00",
        from: "Ma Position",
        to: "Aéroport de Goma",
        price: "6500 FC",
        status: "SCHEDULED",
    },
    {
        id: "s2",
        date: "08 Dec, 14:30",
        from: "Hôtel Serena",
        to: "ULPGL Campus",
        price: "3500 FC",
        status: "SCHEDULED",
    }
];

type TabType = "past" | "upcoming";

export default function RidesPage() {
    const [activeTab, setActiveTab] = useState<TabType>("past");

    const currentRides = activeTab === "past" ? PAST_RIDES : SCHEDULED_RIDES;

    return (
        <main className="h-full overflow-y-auto bg-black text-white pt-safe pb-32 px-4">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md -mx-4 px-4 py-4 mb-6 border-b border-[#1A1A1A]">
                <h1 className="text-xl font-heading font-bold text-white mb-4">
                    Vos Activités
                </h1>

                {/* Tabs */}
                <div className="bg-[#0C0C0C] rounded-full p-1 flex items-center gap-1">
                    <button
                        onClick={() => setActiveTab("past")}
                        className={cn(
                            "flex-1 py-2.5 px-4 rounded-full text-sm font-bold transition-all duration-200",
                            activeTab === "past"
                                ? "bg-[#F0B90B] text-black"
                                : "bg-transparent text-[#9A9A9A] hover:text-white"
                        )}
                    >
                        Passés
                    </button>
                    <button
                        onClick={() => setActiveTab("upcoming")}
                        className={cn(
                            "flex-1 py-2.5 px-4 rounded-full text-sm font-bold transition-all duration-200",
                            activeTab === "upcoming"
                                ? "bg-[#F0B90B] text-black"
                                : "bg-transparent text-[#9A9A9A] hover:text-white"
                        )}
                    >
                        À venir
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="space-y-4">
                {currentRides.length > 0 ? (
                    currentRides.map((ride) => (
                        <RideCard key={ride.id} ride={ride} isScheduled={activeTab === "upcoming"} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-[#9A9A9A]">
                        <Clock className="w-12 h-12 mb-4 opacity-50" />
                        <p>{activeTab === "past" ? "Aucune course pour le moment" : "Aucune réservation planifiée"}</p>
                    </div>
                )}
            </div>
        </main>
    );
}

interface RideCardProps {
    ride: typeof PAST_RIDES[0] | typeof SCHEDULED_RIDES[0];
    isScheduled?: boolean;
}

function RideCard({ ride, isScheduled = false }: RideCardProps) {
    const isCompleted = ride.status === "COMPLETED";
    const isCancelled = ride.status === "CANCELLED";
    const isPlanned = ride.status === "SCHEDULED";

    return (
        <div className="bg-[#0C0C0C] rounded-2xl border border-[#1A1A1A] p-4 flex flex-col gap-3 active:scale-[0.98] transition-transform">
            {/* Header: Date & Status */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#9A9A9A]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{ride.date}</span>
                </div>
                <div className={cn(
                    "flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border",
                    isPlanned && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                    isCompleted && "bg-green-500/10 text-green-500 border-green-500/20",
                    isCancelled && "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                    {isPlanned && "PLANIFIÉ"}
                    {isCompleted && "TERMINÉ"}
                    {isCancelled && "ANNULÉ"}
                </div>
            </div>

            {/* Route */}
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1 h-full py-1">
                    <div className="w-2 h-2 rounded-full bg-[#9A9A9A]" />
                    <div className="w-0.5 h-6 bg-[#1A1A1A]" />
                    <div className="w-2 h-2 rounded-full bg-[#F0B90B]" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <div>
                        <p className="text-xs text-[#9A9A9A] mb-0.5">De</p>
                        <p className="text-sm font-bold text-white leading-tight">{ride.from}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#9A9A9A] mb-0.5">À</p>
                        <p className="text-sm font-bold text-white leading-tight">{ride.to}</p>
                    </div>
                </div>
            </div>

            {/* Footer: Price & Scheduled Badge */}
            <div className="mt-1 pt-3 border-t border-[#1A1A1A] flex justify-between items-center">
                {isScheduled && (
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
                        📅 Réservation confirmée
                    </span>
                )}
                <span className={cn(
                    "text-lg font-heading font-bold text-[#F0B90B]",
                    isScheduled && "ml-auto"
                )}>
                    {ride.price}
                </span>
            </div>
        </div>
    );
}
