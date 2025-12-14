import React from 'react';
import { CheckCircle2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DriverRideSummaryProps {
    ride: any;
    onClose: () => void;
}

export default function DriverRideSummary({ ride, onClose }: DriverRideSummaryProps) {
    return (
        <div className="absolute inset-0 z-[60] bg-[#0A0A0A] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6 ring-4 ring-green-500/20">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>

            <h1 className="text-3xl font-heading font-bold text-white mb-2 text-center">Course Terminée avec Succès !</h1>
            <p className="text-white/60 mb-8 text-center max-w-xs">Vous avez complété cette course. Le montant est disponible dans votre portefeuille.</p>

            <Card className="w-full bg-[#1A1A1A] border border-[#333] mb-8 shadow-xl">
                <CardContent className="p-8 text-center">
                    <p className="text-sm font-bold text-[#666] uppercase tracking-widest mb-3">Montant Total</p>
                    <p className="text-5xl font-heading font-black text-[#F0B90B] mb-2 tracking-tight">
                        {(ride.price || ride.final_price || 0).toLocaleString()}
                        <span className="text-2xl text-white ml-2 font-normal">FC</span>
                    </p>
                    <div className="inline-block px-3 py-1 bg-green-500/20 rounded-full">
                        <p className="text-xs font-bold text-green-500 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Paiement validé
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-[#151515] rounded-xl p-4 text-center border border-[#222]">
                    <p className="text-xs text-[#666] uppercase font-bold tracking-wider mb-1">Distance</p>
                    <p className="text-xl font-bold text-white">{ride.distance_km ? `${ride.distance_km} km` : '--'}</p>
                </div>
                <div className="bg-[#151515] rounded-xl p-4 text-center border border-[#222]">
                    <p className="text-xs text-[#666] uppercase font-bold tracking-wider mb-1">Durée</p>
                    <p className="text-xl font-bold text-white">{ride.duration_minutes ? `${ride.duration_minutes} min` : '--'}</p>
                </div>
            </div>

            <Button
                onClick={onClose}
                className="w-full h-16 text-lg font-bold bg-[#F0B90B] text-black hover:bg-[#D4A50A] rounded-2xl shadow-lg shadow-yellow-500/20 transition-all active:scale-95"
            >
                Retour au Tableau de Bord
            </Button>
        </div>
    );
}
