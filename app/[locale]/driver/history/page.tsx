"use client";

import React, { useState, useEffect } from "react";
import { History, Calendar, MapPin, Clock, DollarSign, Star, Loader2, Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { Ride, DriverStats } from "@/types";
// TODO: Import service when ready
// import { getDriverRideHistory, getDriverStats } from "@/services/driverService";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export default function DriverHistoryPage() {
    const t = useTranslations('Profile');
    const { user } = useAuth();
    const supabase = createClient();

    // State for data from backend
    const [rides, setRides] = useState<Ride[]>([]);
    const [stats, setStats] = useState<DriverStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch Rides
                const { data: ridesData, error } = await supabase
                    .from('rides')
                    .select('*')
                    .eq('driver_id', user.id)
                    .order('created_at', { ascending: false });

                if (ridesData) {
                    setRides(ridesData as Ride[]);

                    // Calculate Stats
                    const total = ridesData.length;
                    const completed = ridesData.filter((r: any) => r.status === 'COMPLETED').length;
                    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

                    // Fetch Profile for Rating
                    const { data: profile } = await supabase
                        .from('driver_profiles')
                        .select('rating')
                        .eq('user_id', user.id)
                        .single();

                    setStats({
                        total_rides: total,
                        completion_rate: completionRate,
                        average_rating: profile?.rating || 5.0,
                        earnings: 0 // Not used in summary directly in this view
                    });
                }
            } catch (error) {
                console.error('Failed to fetch driver history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Format ride for display
    const formatRide = (ride: Ride) => {
        const rideDate = ride.completed_at ? new Date(ride.completed_at) : new Date(ride.created_at);
        return {
            id: ride.id,
            date: rideDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: rideDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            from: ride.pickup_address || t('startPoint') || 'Point de départ',
            to: ride.dest_address || ride.destination_address || t('destination') || 'Destination', // Handle varying field names
            distance: ride.distance_km ? `${ride.distance_km} km` : '--',
            duration: ride.duration_minutes ? `${ride.duration_minutes} min` : '--',
            amount: `${(ride.final_price || ride.price || ride.estimated_price || 0).toLocaleString()} FC`,
            rating: 5, // Default as individual ride ratings not fully linked yet
            status: ride.status
        };
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/10 flex items-center justify-center">
                        <History className="w-5 h-5 text-[#F0B90B]" />
                    </div>
                    <h1 className="text-2xl font-heading font-bold">Historique des Courses</h1>
                </div>
                <p className="text-[#9A9A9A] text-sm">Consultez l&apos;historique de toutes vos courses</p>
            </div>

            {/* Stats Summary */}
            {/* TODO: Connect to Supabase - stats will come from driverService.getDriverStats() */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <Card className="bg-[#0C0C0C] border-[#1A1A1A]">
                    <CardContent className="p-4 text-center">
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#666]" />
                        ) : (
                            <>
                                <p className="text-2xl font-bold text-white">{stats?.total_rides || 0}</p>
                                <p className="text-xs text-[#9A9A9A]">Total Courses</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card className="bg-[#0C0C0C] border-[#1A1A1A]">
                    <CardContent className="p-4 text-center">
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#666]" />
                        ) : (
                            <>
                                <p className="text-2xl font-bold text-[#F0B90B]">{stats?.average_rating?.toFixed(1) || '5.0'}</p>
                                <p className="text-xs text-[#9A9A9A]">Note Moyenne</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card className="bg-[#0C0C0C] border-[#1A1A1A]">
                    <CardContent className="p-4 text-center">
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#666]" />
                        ) : (
                            <>
                                <p className="text-2xl font-bold text-white">{stats?.completion_rate || 0}%</p>
                                <p className="text-xs text-[#9A9A9A]">Taux Complétion</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && rides.length === 0 && (
                <div className="text-center py-16">
                    <Car className="w-16 h-16 mx-auto mb-4 text-[#333]" />
                    <h3 className="text-lg font-bold text-white mb-2">Aucune course pour l&apos;instant</h3>
                    <p className="text-sm text-[#9A9A9A]">
                        Vos courses apparaîtront ici une fois que vous aurez commencé à conduire.
                    </p>
                </div>
            )}

            {/* Rides List */}
            {!isLoading && rides.length > 0 && (
                <div className="space-y-4">
                    {rides.map((ride) => {
                        const formatted = formatRide(ride);
                        return (
                            <Card key={formatted.id} className="bg-[#0C0C0C] border-[#1A1A1A] overflow-hidden">
                                <CardContent className="p-4">
                                    {/* Header Row */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[#666]" />
                                            <span className="text-xs text-[#9A9A9A]">{formatted.date}</span>
                                            <Clock className="w-4 h-4 text-[#666] ml-2" />
                                            <span className="text-xs text-[#9A9A9A]">{formatted.time}</span>
                                        </div>
                                        <span className={cn(
                                            "text-xs font-bold px-2 py-1 rounded-full",
                                            formatted.status === "COMPLETED"
                                                ? "bg-green-500/10 text-green-500"
                                                : "bg-red-500/10 text-red-500"
                                        )}>
                                            {formatted.status === "COMPLETED" ? t('completed') : t('cancelled')}
                                        </span>
                                    </div>

                                    {/* Route */}
                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                            </div>
                                            <p className="text-sm text-white">{formatted.from}</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <div className="w-2 h-2 rounded-full bg-[#F0B90B]" />
                                            </div>
                                            <p className="text-sm text-white">{formatted.to}</p>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-3 border-t border-[#1A1A1A]">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-[#666]" />
                                                <span className="text-xs text-[#9A9A9A]">{formatted.distance}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-[#666]" />
                                                <span className="text-xs text-[#9A9A9A]">{formatted.duration}</span>
                                            </div>
                                            {formatted.rating && (
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-[#F0B90B] fill-[#F0B90B]" />
                                                    <span className="text-xs text-[#F0B90B]">{formatted.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="w-4 h-4 text-[#F0B90B]" />
                                            <span className="text-sm font-bold text-white">{formatted.amount}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
