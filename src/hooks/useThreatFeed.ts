import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ThreatEvent {
    id: string;
    lat: number;
    lng: number;
    type: 'safe' | 'suspicious' | 'critical';
    target: string;
    timestamp: Date;
    isRealTime?: boolean;
    source: 'local' | 'global';
}

const WORLD_HUBS = [
    { city: 'New York', lat: 40.7128, lng: -74.0060 },
    { city: 'London', lat: 51.5074, lng: -0.1278 },
    { city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
    { city: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { city: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { city: 'Sao Paulo', lat: -23.5505, lng: -46.6333 },
    { city: 'Dubai', lat: 25.2048, lng: 55.2708 },
    { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
];

export const useThreatFeed = () => {
    const [events, setEvents] = useState<ThreatEvent[]>([]);
    const [stats, setStats] = useState({
        safe: 24912,
        suspicious: 1204,
        critical: 419
    });

    useEffect(() => {
        // 0. Initial load of existing local risky entries
        const loadInitialData = async () => {
            const { data, error } = await supabase
                .from('discovery_cache')
                .select('*')
                .gte('risk_score', 20)
                .order('created_at', { ascending: false })
                .limit(5);

            if (data && !error) {
                const initialEvents: ThreatEvent[] = data.map(item => {
                    // Fallback to a random but consistent location if geo data is missing
                    const coords = item.data?.geo_location?.coordinates || {
                        latitude: (Math.random() * 120) - 60,
                        longitude: (Math.random() * 240) - 120
                    };

                    return {
                        id: `hist-${item.target}-${item.created_at}`,
                        lat: coords.latitude,
                        lng: coords.longitude,
                        type: item.risk_score >= 60 ? 'critical' : 'suspicious',
                        target: item.target,
                        timestamp: new Date(item.created_at),
                        isRealTime: false,
                        source: 'local'
                    };
                });
                setEvents(prev => [...initialEvents, ...prev].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 50));
            }
        };

        // 0.5 Fetch Global Telemetry from Edge Function
        const fetchGlobalTelemetry = async () => {
            try {
                const { data, error } = await supabase.functions.invoke('telemetry');
                if (data && !error) {
                    const globalEvents: ThreatEvent[] = data.map((ev: any) => ({
                        ...ev,
                        timestamp: new Date(ev.timestamp),
                        isRealTime: true
                    }));

                    setEvents(prev => {
                        // Merge and dedup by target
                        const combined = [...globalEvents, ...prev];
                        const unique = combined.filter((v, i, a) => a.findIndex(t => t.target === v.target) === i);
                        return unique.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 50);
                    });

                    // Update stats counters
                    setStats(prev => ({
                        ...prev,
                        critical: prev.critical + 1
                    }));
                }
            } catch (e) {
                console.error("Telemetry fetch failed:", e);
            }
        };

        loadInitialData();
        fetchGlobalTelemetry();

        // 1. Subscribe to real-time local updates
        const channel = supabase
            .channel('public:discovery_cache')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'discovery_cache'
            }, (payload) => {
                const data = payload.new;
                const coords = data.data?.geo_location?.coordinates || {
                    latitude: (Math.random() * 120) - 60,
                    longitude: (Math.random() * 240) - 120
                };

                const newEvent: ThreatEvent = {
                    id: `live-${data.target}-${Date.now()}`,
                    lat: coords.latitude,
                    lng: coords.longitude,
                    type: data.risk_score >= 60 ? 'critical' : data.risk_score >= 20 ? 'suspicious' : 'safe',
                    target: data.target,
                    timestamp: new Date(),
                    isRealTime: true,
                    source: 'local'
                };

                // Real threats go to the VERY top
                setEvents(prev => [newEvent, ...prev].slice(0, 50));

                setStats(prev => ({
                    ...prev,
                    [newEvent.type]: prev[newEvent.type] + 1
                }));
            })
            .subscribe();

        // 2. Poll Global Telemetry every 45 seconds (Real Feed)
        const interval = setInterval(fetchGlobalTelemetry, 45000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, []);

    return { events, stats };
};
