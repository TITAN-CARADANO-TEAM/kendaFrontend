"use client";

import React from "react";
import { User, Shield, MapPin, ArrowRight, Star, Clock, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data for Ride History
const MOCK_RIDES = [
    {
        id: "1",
        date: "Aujourd'hui, 08:30",
        from: "Majengo",
        to: "Centre-ville",
        price: "2500 FC",
        status: "COMPLETED",
        distance: "4.2 km"
    },
    {
        id: "2",
        date: "Hier, 18:15",
        from: "Himbi",
        to: "Aéroport Intl. Goma",
        price: "5000 FC",
        status: "COMPLETED",
        distance: "8.5 km"
    },
    {
        id: "3",
        date: "02 Dec, 14:00",
        from: "Université de Goma",
        to: "Katindo",
        price: "1500 FC",
        status: "CANCELLED",
        distance: "2.1 km"
    },
    {
        id: "4",
        date: "28 Nov, 09:45",
        from: "Birere",
        to: "Marché Virunga",
        price: "1000 FC",
        status: "COMPLETED",
        distance: "1.5 km"
    },
    {
        id: "5",
        date: "25 Nov, 21:30",
        from: "Restaurant Kivu",
        to: "Ndosho",
        price: "3500 FC",
        status: "COMPLETED",
        distance: "6.0 km"
    }
];

export function UserProfileScreen() {
    return (
        <div className="h-full overflow-y-auto bg-black text-white pb-24 pt-safe">
            {/* Header Profile */}
            <div className="flex flex-col items-center pt-10 pb-8 px-4 bg-gradient-to-b from-[#0C0C0C] to-black border-b border-[#1A1A1A]">
                {/* Avatar */}
                <div className="relative mb-4">
                    <div className="w-28 h-28 rounded-full bg-[#1A1A1A] border-2 border-[#1A1A1A] flex items-center justify-center overflow-hidden">
                        <User className="w-12 h-12 text-[#9A9A9A]" />
                        {/* Placeholder for real image */}
                        {/* <img src="..." alt="Profile" className="w-full h-full object-cover" /> */}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-[#F0B90B] text-black rounded-full p-1.5 border-4 border-black">
                        <Shield className="w-4 h-4 fill-current" />
                    </div>
                </div>

                {/* Name & Badge */}
                <h1 className="text-2xl font-heading font-bold text-white mb-1">
                    Alexandre K.
                </h1>
                <div className="flex items-center gap-1.5 bg-[#F0B90B]/10 px-3 py-1 rounded-full border border-[#F0B90B]/20">
                    <Shield className="w-3 h-3 text-[#F0B90B] fill-current" />
                    <span className="text-xs font-bold text-[#F0B90B] uppercase tracking-wide">
                        Passager Vérifié
                    </span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-sm mt-8">
                    <StatBlock label="Courses" value="42" />
                    <StatBlock label="Note" value="4.9" icon={<Star className="w-3 h-3 text-[#F0B90B] fill-current ml-1" />} />
                    <StatBlock label="Km Total" value="128" />
                </div>
            </div>

            {/* Ride History Section */}
            <div className="px-4 py-6">
                <h2 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#F0B90B]" />
                    Mes Trajets
                </h2>

                <div className="space-y-3">
                    {MOCK_RIDES.map((ride) => (
                        <RideCard key={ride.id} ride={ride} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Sub-components

function StatBlock({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center p-3 bg-[#0C0C0C] rounded-2xl border border-[#1A1A1A]">
            <div className="flex items-center text-xl font-bold text-white mb-1">
                {value}
                {icon}
            </div>
            <span className="text-[10px] text-[#9A9A9A] uppercase tracking-wider font-medium">
                {label}
            </span>
        </div>
    );
}

function RideCard({ ride }: { ride: typeof MOCK_RIDES[0] }) {
    const isCompleted = ride.status === "COMPLETED";

    return (
        <div className="group flex flex-col bg-[#0C0C0C] rounded-2xl border border-[#1A1A1A] p-4 active:scale-[0.98] transition-transform duration-200">
            {/* Top Row: Date & Status */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-[#9A9A9A]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{ride.date}</span>
                </div>
                <div className={cn(
                    "flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border",
                    isCompleted
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                    {isCompleted ? (
                        <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>TERMINÉ</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3 h-3" />
                            <span>ANNULÉ</span>
                        </>
                    )}
                </div>
            </div>

            {/* Middle Row: Route */}
            <div className="flex items-center gap-3 mb-3">
                <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#9A9A9A]" />
                    <div className="w-0.5 h-8 bg-[#1A1A1A]" />
                    <div className="w-2 h-2 rounded-full bg-[#F0B90B]" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <div>
                        <p className="text-sm text-[#9A9A9A] leading-none mb-1">De</p>
                        <p className="text-sm font-bold text-white">{ride.from}</p>
                    </div>
                    <div>
                        <p className="text-sm text-[#9A9A9A] leading-none mb-1">À</p>
                        <p className="text-sm font-bold text-white">{ride.to}</p>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Price & Distance */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1A1A1A] mt-1">
                <span className="text-xs text-[#9A9A9A] font-medium">
                    {ride.distance}
                </span>
                <span className="text-base font-heading font-bold text-white">
                    {ride.price}
                </span>
            </div>
        </div>
    );
}
