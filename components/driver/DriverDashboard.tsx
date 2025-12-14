"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    Power,
    Navigation,
    MapPin,
    Clock,
    User,
    DollarSign,
    X,
    ShieldAlert,
    Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { type Ride } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Components
import DriverNavigationScreen from "./DriverNavigationScreen";
import DriverRideSummary from "./DriverRideSummary";
import { AnimatePresence, motion } from "framer-motion";

// --- CUSTOM MARKER ICONS ---
const createCustomIcon = (type: 'client' | 'driver' | 'me') => {
    let html = '';
    let size = 40;

    if (type === 'client') {
        html = `
            <div class="relative flex items-center justify-center w-10 h-10 bg-black/50 rounded-full shadow-lg border-2 border-white backdrop-blur-md">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                 <div class="absolute -bottom-1 w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            </div>`;
    } else if (type === 'driver') {
        size = 32;
        html = `
            <div class="flex items-center justify-center w-8 h-8 bg-gray-500/50 rounded-full border border-white/30 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            </div>`;
    } else if (type === 'me') {
        size = 48;
        html = `
            <div class="relative flex items-center justify-center w-12 h-12">
                <div class="absolute inset-0 bg-yellow-500/30 rounded-full animate-ping"></div>
                <div class="relative w-10 h-10 bg-yellow-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transform rotate-45"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                </div>
            </div>`;
    }

    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: html,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};

// --- MAP CONTROLLER ---
function MapController({ center }: { center: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15, { duration: 1.5 });
        }
    }, [center, map]);
    return null;
}

interface DriverDashboardProps {
    driverName?: string;
    driverAvatar?: string;
}

export function DriverDashboard({
    driverName: propName,
    driverAvatar: propAvatar
}: DriverDashboardProps) {
    const t = useTranslations('Driver');
    const { user } = useAuth();
    const supabase = createClient();

    // --- STATE ---
    const [isMounted, setIsMounted] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [myLocation, setMyLocation] = useState<[number, number] | null>(null);

    // Data Lists
    const [availableRides, setAvailableRides] = useState<any[]>([]); // Rides with status 'SEARCHING'
    const [otherDrivers, setOtherDrivers] = useState<any[]>([]);

    // Active Flow
    const [selectedRide, setSelectedRide] = useState<any | null>(null); // The ride shown in Bottom Sheet
    const [activeRide, setActiveRide] = useState<Ride | null>(null); // Accepted ride
    const [showSummary, setShowSummary] = useState(false);

    // Loading States
    const [isTogglingOnline, setIsTogglingOnline] = useState(false);
    const [isAcceptingRide, setIsAcceptingRide] = useState(false);

    // Derived
    const driverName = propName || user?.user_metadata?.full_name || "Chauffeur";
    const driverAvatar = propAvatar || user?.user_metadata?.avatar_url;

    // Refs for Realtime
    const isOnlineRef = useRef(isOnline);

    useEffect(() => {
        setIsMounted(true);

        // Get real GPS position immediately on mount
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    console.log("📍 [Mount] Got initial GPS position:", latitude, longitude);
                    setMyLocation([latitude, longitude]);
                },
                (err) => {
                    console.error("📍 [Mount] GPS Error, using fallback:", err.message);
                    // Only use fallback if GPS fails
                    setMyLocation([-1.6585, 29.2205]);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            console.warn("📍 [Mount] Geolocation not supported");
            setMyLocation([-1.6585, 29.2205]);
        }
    }, []);

    useEffect(() => { isOnlineRef.current = isOnline; }, [isOnline]);

    // --- 1. INITIAL FETCH & ACTIVE RIDE CHECK ---
    useEffect(() => {
        if (!user) return;

        let pollInterval: NodeJS.Timeout;

        const fetchAvailableRides = async () => {
            // Only fetch rides from the last 30 minutes to avoid stale data
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from('rides')
                .select('*')
                .eq('status', 'SEARCHING')
                .gte('created_at', thirtyMinutesAgo)
                .not('pickup_lat', 'is', null)
                .not('pickup_lng', 'is', null);

            if (error) {
                console.error('[fetchAvailableRides] Error:', error);
                return;
            }

            console.log('[fetchAvailableRides] Found', data?.length || 0, 'rides');
            // Only update if no active ride
            setAvailableRides(prev => {
                // If we already have selected ride, ensure it is kept or updated
                return data || [];
            });
        };

        const init = async () => {
            // Check Profile status
            const { data: profile } = await supabase.from('driver_profiles').select('is_online, current_lat, current_lng').eq('user_id', user.id).maybeSingle();

            if (profile) {
                const p = profile as any;
                setIsOnline(p.is_online || false);
                // Use saved location from DB if available and we don't have GPS yet
                if (p.current_lat && p.current_lng && !myLocation) {
                    console.log("📍 [Init] Using saved location from DB:", p.current_lat, p.current_lng);
                    setMyLocation([p.current_lat, p.current_lng]);
                }
            }

            // Check for Active Ride
            const { data: currentRide } = await supabase
                .from('rides')
                .select('*')
                .eq('driver_id', user.id)
                .in('status', ['ACCEPTED', 'ARRIVED', 'IN_PROGRESS'])
                .maybeSingle();

            if (currentRide) {
                setActiveRide(currentRide as Ride);
            }

            // Listen for available rides immediately
            await fetchAvailableRides();

            // Fallback: Poll every 5 seconds to ensure we don't miss any rides
            pollInterval = setInterval(fetchAvailableRides, 5000);
        };

        init();

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);


    // --- 2. GPS TRACKING (Online Only) ---
    useEffect(() => {
        if (!isOnline || !user) return;

        console.log("📍 Starting continuous GPS Tracking...");

        // Function to update location in DB
        const updateLocationInDB = async (latitude: number, longitude: number) => {
            try {
                const { error, data } = await (supabase
                    .from('driver_profiles') as any)
                    .update({
                        current_lat: latitude,
                        current_lng: longitude,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .select();

                if (error) {
                    console.error("📍 [DB] Update error:", error.message);
                } else {
                    console.log("📍 [DB] Location updated successfully:", { latitude, longitude });
                }
            } catch (e) {
                console.error("📍 [DB] Exception:", e);
            }
        };

        // Watch position for real-time updates
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                console.log(`📍 [GPS] Position update: (${latitude.toFixed(6)}, ${longitude.toFixed(6)}) Accuracy: ${accuracy?.toFixed(0)}m`);
                setMyLocation([latitude, longitude]);
                updateLocationInDB(latitude, longitude);
            },
            (err) => console.error("📍 [GPS] Error:", err.code, err.message),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
        );

        // Fallback: Also update on interval in case watchPosition doesn't fire frequently
        const intervalId = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    console.log(`📍 [Interval] Pushing location: (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`);
                    setMyLocation([latitude, longitude]);
                    updateLocationInDB(latitude, longitude);
                },
                (err) => console.error("📍 [Interval] GPS Error:", err.message),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }, 15000); // Every 15 seconds

        return () => {
            console.log("📍 Stopping GPS Tracking");
            navigator.geolocation.clearWatch(watchId);
            clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline, user]);


    // --- 3. REALTIME SUBSCRIPTIONS ---
    useEffect(() => {
        if (!user) return;

        // Channel for RIDES (Clients)
        console.log("🔔 [Driver] Setting up realtime subscription for rides...");
        const ridesChannel = supabase.channel('radar-rides')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'rides'
            }, (payload) => {
                const newRide = payload.new as any;
                const oldRide = payload.old as any;
                const eventType = payload.eventType; // 'INSERT', 'UPDATE', 'DELETE'

                console.log(`📥 [Driver] Realtime event: ${eventType}`, {
                    id: newRide?.id?.slice(0, 8),
                    status: newRide?.status,
                    driver_id: newRide?.driver_id,
                    pickup_lat: newRide?.pickup_lat
                });

                // Logic for Targeted Rides (Direct Requests)
                if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRide.status === 'SEARCHING') {
                    if (newRide.driver_id === user.id) {
                        // IT'S FOR ME!
                        console.log("🎯 [Driver] TARGETED RIDE - This is for me!");
                        setSelectedRide({ ...newRide, isTargeted: true });
                        // Also add to map for visual confirmation if dismissed
                        setAvailableRides((prev: any[]) => {
                            const exists = prev.find(r => r.id === newRide.id);
                            return exists ? prev.map(r => r.id === newRide.id ? newRide : r) : [...prev, newRide];
                        });
                        return;
                    } else if (newRide.driver_id && newRide.driver_id !== user.id) {
                        // For someone else - Ignore
                        console.log("👤 [Driver] Ride assigned to another driver, ignoring");
                        return;
                    }
                }

                if (eventType === 'INSERT') {
                    // New ride request - add if it's open for anyone
                    if (newRide.status === 'SEARCHING' && newRide.pickup_lat && newRide.pickup_lng) {
                        console.log("🆕 [Driver] New ride request added to map!");
                        setAvailableRides((prev: any[]) => {
                            // Avoid duplicates
                            if (prev.find(r => r.id === newRide.id)) return prev;
                            return [...prev, newRide];
                        });
                    }
                } else if (eventType === 'UPDATE') {
                    if (newRide.status === 'SEARCHING') {
                        // If it became assigned to someone else (and processed above as not for me), remove it
                        if (newRide.driver_id && newRide.driver_id !== user.id) {
                            setAvailableRides((prev: any[]) => prev.filter(r => r.id !== newRide.id));
                            if (selectedRide?.id === newRide.id) setSelectedRide(null);
                            return;
                        }

                        // Ensure it's in the list (general update)
                        setAvailableRides((prev: any[]) => {
                            const exists = prev.find(r => r.id === newRide.id);
                            return exists ? prev.map(r => r.id === newRide.id ? newRide : r) : [...prev, newRide];
                        });
                    } else {
                        // Remove if no longer searching
                        setAvailableRides((prev: any[]) => prev.filter(r => r.id !== newRide.id));
                        // Close bottom sheet if this ride was selected
                        if (selectedRide?.id === newRide.id) {
                            setSelectedRide(null);
                        }
                    }
                } else if (eventType === 'DELETE') {
                    setAvailableRides((prev: any[]) => prev.filter(r => r.id !== oldRide.id));
                }
            })
            .subscribe();

        // Channel for DRIVERS (Competition)
        const driversChannel = supabase.channel('radar-drivers')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'driver_profiles',
                filter: 'is_online=eq.true'
            }, (payload) => {
                const driver = payload.new as any;
                // Exclude self
                if (driver.user_id === user.id) return;

                setOtherDrivers(prev => {
                    const idx = prev.findIndex(d => d.user_id === driver.user_id);
                    if (idx >= 0) {
                        const copy = [...prev];
                        copy[idx] = driver;
                        return copy;
                    }
                    return [...prev, driver];
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ridesChannel);
            supabase.removeChannel(driversChannel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, selectedRide]);

    // --- 3b. ROUTE CALCULATION (Navigation) ---
    const [routePath, setRoutePath] = useState<[number, number][]>([]);

    useEffect(() => {
        const ride = activeRide as any;
        if (!ride || !myLocation) {
            setRoutePath([]);
            return;
        }

        const fetchRoute = async (targetLat: number, targetLng: number) => {
            try {
                const start = `${myLocation[1]},${myLocation[0]}`;
                const end = `${targetLng},${targetLat}`;
                const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`);
                const data = await response.json();
                if (data.routes?.[0]) {
                    const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
                    setRoutePath(coords);
                }
            } catch (e) {
                console.error("Route Error", e);
                setRoutePath([[myLocation[0], myLocation[1]], [targetLat, targetLng]]);
            }
        };

        if (ride.status === 'ACCEPTED' || ride.status === 'ARRIVED') {
            if (ride.pickup_lat && ride.pickup_lng) {
                fetchRoute(ride.pickup_lat, ride.pickup_lng);
            }
        } else if (ride.status === 'IN_PROGRESS') {
            if (ride.dest_lat && ride.dest_lng) {
                fetchRoute(ride.dest_lat, ride.dest_lng);
            }
        } else {
            setRoutePath([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRide, myLocation]);


    // --- 4. HANDLERS ---

    const handleToggleOnline = async () => {
        if (!user || isTogglingOnline) return;
        setIsTogglingOnline(true);
        const newStatus = !isOnline;
        setIsOnline(newStatus);

        // If going online, get position immediately
        if (newStatus) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                setMyLocation([pos.coords.latitude, pos.coords.longitude]);
                await (supabase.from('driver_profiles') as any).update({
                    is_online: true,
                    current_lat: pos.coords.latitude,
                    current_lng: pos.coords.longitude
                }).eq('user_id', user.id);
            });
        } else {
            await (supabase.from('driver_profiles') as any).update({ is_online: false }).eq('user_id', user.id);
            setAvailableRides([]); // Clear map when offline
        }
        setIsTogglingOnline(false);
    };

    const handleAcceptRide = async () => {
        if (!selectedRide || !user || isAcceptingRide) return;
        setIsAcceptingRide(true);

        // Atomic Update: Only update if status is still 'SEARCHING'
        // This prevents race conditions where another driver accepted it 1ms ago.
        const { data, error, count } = await (supabase
            .from('rides') as any)
            .update({
                status: 'ACCEPTED',
                driver_id: user.id,
                accepted_at: new Date().toISOString()
            })
            .eq('id', selectedRide.id)
            .eq('status', 'SEARCHING') // The Condition
            .select();

        if (error || !data || data.length === 0) {
            alert("Trop tard ! Cette course a déjà été prise par un autre chauffeur.");
            setSelectedRide(null); // Close sheet
            // Refresh list
            const { data: fresh } = await supabase.from('rides').select('*').eq('status', 'SEARCHING');
            if (fresh) setAvailableRides(fresh);
        } else {
            // Success
            setActiveRide(data[0] as Ride);
            setSelectedRide(null);
        }
        setIsAcceptingRide(false);
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!activeRide) return;
        setActiveRide(prev => prev ? ({ ...prev, status: newStatus } as any) : null);

        const updates: any = { status: newStatus };
        if (newStatus === 'IN_PROGRESS') updates.started_at = new Date().toISOString();
        if (newStatus === 'COMPLETED') updates.completed_at = new Date().toISOString();

        await (supabase.from('rides') as any).update(updates).eq('id', activeRide.id);

        if (newStatus === 'COMPLETED') {
            setShowSummary(true);
        }
    };

    const handleCloseSummary = () => {
        setShowSummary(false);
        setActiveRide(null);
    };

    // --- RENDER ---

    if (!isMounted) return <div className="h-full w-full bg-black" />;

    if (showSummary) {
        return <DriverRideSummary ride={(activeRide as any) || {}} onClose={handleCloseSummary} />;
    }

    if (activeRide && activeRide.status !== 'COMPLETED') {
        return <DriverNavigationScreen ride={activeRide} onStatusUpdate={handleStatusUpdate} />;
    }

    return (
        <div className="relative h-full w-full bg-zinc-950 flex flex-col overflow-hidden">

            {/* Header / Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-[50] p-4 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col gap-2 pointer-events-auto">
                    {/* Driver Profile */}
                    <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-full h-12 pr-4 flex items-center gap-3 shadow-lg">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 relative">
                            {driverAvatar ? (
                                <Image src={driverAvatar} alt="Driver" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-neutral-800 flex items-center justify-center"><User size={20} className="text-neutral-400" /></div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white text-sm font-bold leading-none">{driverName}</span>
                            <span className={cn("text-[10px] uppercase font-bold mt-0.5", isOnline ? "text-green-500" : "text-neutral-500")}>
                                {isOnline ? 'En Ligne' : 'Hors Ligne'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Online Toggle Button */}
                <button
                    onClick={handleToggleOnline}
                    className={cn(
                        "pointer-events-auto h-12 px-4 rounded-full flex items-center gap-2 font-bold shadow-xl transition-all active:scale-95 border",
                        isOnline
                            ? "bg-black/80 backdrop-blur border-white/10 text-red-500 hover:bg-neutral-900"
                            : "bg-yellow-500 text-black border-yellow-400 hover:bg-yellow-400"
                    )}
                >
                    {isTogglingOnline ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Power size={20} />
                            <span>{isOnline ? "STOP" : "GO !"}</span>
                        </>
                    )}
                </button>
            </div>

            {/* MAP LAYERS */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={myLocation || [-1.6585, 29.2205]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />

                    <MapController center={myLocation} />

                    {/* My Position Marker */}
                    {myLocation && (
                        <Marker position={myLocation} icon={createCustomIcon('me')} zIndexOffset={1000} />
                    )}

                    {/* Other Drivers (Competition) - Only show if Online */}
                    {isOnline && otherDrivers.map((driver) => (
                        driver.current_lat && driver.current_lng ? (
                            <Marker
                                key={driver.id}
                                position={[driver.current_lat, driver.current_lng]}
                                icon={createCustomIcon('driver')}
                                opacity={0.6}
                            />
                        ) : null
                    ))}

                    {/* Active Route & Target */}
                    {activeRide && routePath.length > 0 && (
                        <Polyline positions={routePath as L.LatLngExpression[]} pathOptions={{ color: "#F0B90B", weight: 5 }} />
                    )}
                    {activeRide && ((activeRide as any).status === 'ACCEPTED' || (activeRide as any).status === 'ARRIVED') && (activeRide as any).pickup_lat && (
                        <Marker position={[(activeRide as any).pickup_lat, (activeRide as any).pickup_lng]} icon={createCustomIcon('client')}>
                            <Popup>Client (Prise en charge)</Popup>
                        </Marker>
                    )}
                    {activeRide && (activeRide as any).status === 'IN_PROGRESS' && (activeRide as any).dest_lat && (
                        <Marker position={[(activeRide as any).dest_lat, (activeRide as any).dest_lng]} icon={createCustomIcon('client')}>
                            <Popup>Destination</Popup>
                        </Marker>
                    )}

                    {/* Available Rides (Clients) - Only show when online AND no active ride */}
                    {isOnline && !activeRide && availableRides
                        .filter(ride => ride.pickup_lat && ride.pickup_lng)
                        .map((ride) => (
                            <Marker
                                key={ride.id}
                                position={[ride.pickup_lat, ride.pickup_lng]}
                                icon={createCustomIcon('client')}
                                eventHandlers={{
                                    click: () => setSelectedRide(ride)
                                }}
                            />
                        ))}
                </MapContainer>
            </div>

            {/* BOTTOM SHEET - Ride Details */}
            <AnimatePresence>
                {selectedRide && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={cn(
                            "absolute bottom-0 left-0 right-0 z-[60] rounded-t-[32px] border-t shadow-2xl p-6 pb-safe safe-area-bottom",
                            (selectedRide as any).isTargeted
                                ? "bg-red-950/95 border-red-500/50"
                                : "bg-[#121212] border-white/10"
                        )}
                    >
                        <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-6" />

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className={cn(
                                    "text-xs font-bold uppercase tracking-wider mb-1",
                                    (selectedRide as any).isTargeted ? "text-red-400 animate-pulse" : "text-neutral-400"
                                )}>
                                    {(selectedRide as any).isTargeted ? "⚠️ PRIO : CLIENT VOUS A CHOISI !" : "Nouvelle Course"}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold text-white">{(selectedRide.price || 0).toLocaleString()} FC</h2>
                                    <span className="px-2 py-0.5 bg-neutral-800 rounded text-xs text-neutral-400">Cash</span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full hover:bg-white/10"
                                onClick={() => setSelectedRide(null)}
                            >
                                <X className="text-white" />
                            </Button>
                        </div>

                        <div className="space-y-4 mb-8">
                            {/* Pickup */}
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center pt-1">
                                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                    <div className="w-0.5 h-full bg-neutral-800 my-1" />
                                </div>
                                <div className="flex-1 pb-4 border-b border-white/5">
                                    <p className="text-xs text-neutral-500 mb-1">Lieu de prise en charge</p>
                                    <p className="text-white font-medium text-sm line-clamp-1">
                                        {selectedRide.pickup_address || "Position actuelle"}
                                    </p>
                                    {myLocation && selectedRide.pickup_lat && selectedRide.pickup_lng && (
                                        <p className="text-neutral-400 text-xs mt-1 flex items-center gap-1">
                                            <Navigation size={12} />
                                            À {
                                                (() => {
                                                    const distMeters = L.latLng(myLocation[0], myLocation[1]).distanceTo(
                                                        L.latLng(selectedRide.pickup_lat, selectedRide.pickup_lng)
                                                    );
                                                    return distMeters > 1000
                                                        ? `${(distMeters / 1000).toFixed(1)} km`
                                                        : `${Math.round(distMeters)} m`;
                                                })()
                                            } de vous
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center pt-1">
                                    <div className="w-3 h-3 border-2 border-yellow-500 rounded-sm" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-neutral-500 mb-1">Destination</p>
                                    <p className="text-white font-medium text-sm line-clamp-1">
                                        {selectedRide.dest_address || "Destination définie"}
                                    </p>
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 bg-neutral-900 px-2 py-1 rounded text-neutral-300 text-xs">
                                            <Clock size={12} />
                                            {selectedRide.duration_minutes ? `~${selectedRide.duration_minutes} min` : "-- min"}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-neutral-900 px-2 py-1 rounded text-neutral-300 text-xs">
                                            <Navigation size={12} />
                                            {selectedRide.distance_km} km
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold h-14 rounded-xl text-lg shadow-[0_4px_20px_rgba(34,197,94,0.3)] disabled:opacity-50"
                                onClick={handleAcceptRide}
                                disabled={isAcceptingRide}
                            >
                                {isAcceptingRide ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>ACCEPTATION...</span>
                                    </div>
                                ) : (
                                    "ACCEPTER LA COURSE"
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Offline/Empty State Message */}
            {!isOnline && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10">
                    <div className="w-16 h-16 bg-neutral-900/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <Power size={24} className="text-neutral-500" />
                    </div>
                    <h2 className="text-white font-bold text-lg">Vous êtes hors ligne</h2>
                    <p className="text-neutral-400 text-sm mt-1">Passez en ligne pour voir la carte radar.</p>
                </div>
            )}
        </div>
    );
}
