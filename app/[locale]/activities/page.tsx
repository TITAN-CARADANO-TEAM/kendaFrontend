"use client";

import { Clock, MapPin } from "lucide-react";

export default function ActivitiesPage() {
    return (
        <main className="h-full bg-black text-white pt-safe pb-[calc(6rem+env(safe-area-inset-bottom))] px-4 overflow-y-auto">
            <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md -mx-4 px-4 py-4 mb-6 border-b border-[#1A1A1A]">
                <h1 className="text-xl font-heading font-bold text-white text-center">
                    Activités
                </h1>
            </header>

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white mb-4">Historique</h2>

                {/* Placeholder Items */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#0C0C0C] rounded-xl border border-[#1A1A1A] p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                            <Clock className="w-5 h-5 text-[#9A9A9A]" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-white">Trajet vers Centre-Ville</p>
                            <p className="text-xs text-[#9A9A9A]">Hier, 14:30 • 2500 FC</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs bg-[#1A1A1A] text-[#9A9A9A] px-2 py-1 rounded-full">
                                Terminé
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
