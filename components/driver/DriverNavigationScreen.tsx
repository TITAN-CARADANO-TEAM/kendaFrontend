import React from "react";
import { Navigation, MapPin, Phone, MessageSquare, Shield, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DriverNavigationProps {
    ride: any;
    onStatusUpdate: (newStatus: string) => void;
}

export default function DriverNavigationScreen({ ride, onStatusUpdate }: DriverNavigationProps) {
    // Determine instruction based on status
    const getInstruction = () => {
        switch (ride.status) {
            case 'ACCEPTED': return "Rendez-vous au point de départ";
            case 'DRIVER_ARRIVED': return "Attendez le client au point de prise en charge";
            case 'IN_PROGRESS': return "En route vers la destination";
            default: return "Course en cours";
        }
    };

    const getPrimaryAction = () => {
        switch (ride.status) {
            case 'ACCEPTED':
            case 'DRIVER_ASSIGNED':
                return {
                    label: "JE SUIS ARRIVÉ",
                    action: () => onStatusUpdate('DRIVER_ARRIVED'),
                    color: "bg-[#F0B90B] text-black hover:bg-[#D4A50A]"
                };
            case 'DRIVER_ARRIVED':
                return {
                    label: "DÉMARRER LA COURSE",
                    action: () => onStatusUpdate('IN_PROGRESS'),
                    color: "bg-green-600 text-white hover:bg-green-700"
                };
            case 'IN_PROGRESS':
                return {
                    label: "TERMINER LA COURSE",
                    action: () => onStatusUpdate('COMPLETED'),
                    color: "bg-red-600 text-white hover:bg-red-700"
                };
            default: return null;
        }
    };

    const action = getPrimaryAction();

    return (
        <div className="absolute inset-0 z-50 flex flex-col pointer-events-none">
            {/* Top Navigation Overlay (Directions) */}
            <div className="bg-[#0A0A0A] p-4 pt-safe pointer-events-auto border-b border-white/10 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="bg-[#F0B90B] p-2 rounded-full">
                        <Navigation className="w-6 h-6 text-black fill-current transform rotate-45" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xl font-bold text-white">{ride.distance_km ? `${ride.distance_km} km` : "--"}</p>
                        <p className="text-sm text-white/60 truncate">{getInstruction()}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1" /> {/* Map visible behind here */}

            {/* Bottom Actions Panel */}
            <div className="bg-[#0A0A0A] p-6 pb-safe rounded-t-3xl border-t border-white/10 pointer-events-auto shadow-2xl">
                {/* Client Info */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                            <span className="font-heading font-bold text-lg text-white">
                                {ride.user_id ? ride.user_id.slice(0, 1).toUpperCase() : 'C'}
                            </span>
                        </div>
                        <div>
                            <p className="font-bold text-white text-lg">Client</p>
                            <div className="flex items-center gap-2">
                                <div className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-white/80 uppercase">
                                    {ride.payment_method || 'CASH'}
                                </div>
                                <span className="text-[#F0B90B] text-sm font-bold flex items-center gap-1">
                                    {ride.passenger_rating || "--"} ★
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button size="icon" variant="outline" className="rounded-full w-12 h-12 border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                            <Phone className="w-5 h-5 text-white" />
                        </Button>
                        <Button size="icon" variant="outline" className="rounded-full w-12 h-12 border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </Button>
                    </div>
                </div>

                {/* Address Info */}
                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-[#9A9A9A] uppercase font-bold tracking-wider mb-1">
                                {ride.status === 'IN_PROGRESS' ? "Destination" : "Point de Ramassage"}
                            </p>
                            <p className="font-medium text-white leading-snug">
                                {ride.status === 'IN_PROGRESS'
                                    ? (ride.dest_address || ride.destination_address || "Destination définie par le client")
                                    : (ride.pickup_address || "Position actuelle du client")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Primary Action Slide/Button */}
                {action && (
                    <Button
                        onClick={action.action}
                        className={cn(
                            "w-full h-16 text-lg font-bold rounded-xl shadow-lg transition-all flex items-center justify-between px-6",
                            action.color
                        )}
                    >
                        <span className="flex-1 text-left">{action.label}</span>
                        <div className="bg-black/20 p-2 rounded-full">
                            <ChevronRight className="w-6 h-6 text-white" />
                        </div>
                    </Button>
                )}
            </div>
        </div>
    )
}
