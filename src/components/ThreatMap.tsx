
import React from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    Sphere,
    Graticule
} from "react-simple-maps";
import { motion, AnimatePresence } from 'framer-motion';
import { ThreatEvent } from '@/hooks/useThreatFeed';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface ThreatMapProps {
    events: ThreatEvent[];
}

const ThreatMap: React.FC<ThreatMapProps> = ({ events }) => {
    const [hoveredId, setHoveredId] = React.useState<string | null>(null);

    return (
        <div className="w-full h-full relative">
            <ComposableMap
                projection="geoEqualEarth"
                projectionConfig={{
                    scale: 200,
                }}
                className="w-full h-full"
            >
                <Sphere stroke="#27272a" strokeWidth={0.5} id="sphere" fill="transparent" />
                <Graticule stroke="#27272a" strokeWidth={0.5} />
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="#18181b"
                                stroke="#27272a"
                                strokeWidth={0.5}
                                style={{
                                    default: { outline: "none" },
                                    hover: { fill: "#27272a", outline: "none" },
                                    pressed: { outline: "none" },
                                }}
                            />
                        ))
                    }
                </Geographies>

                <AnimatePresence>
                    {events.map((event) => (
                        <Marker
                            key={event.id}
                            coordinates={[event.lng, event.lat]}
                            onMouseEnter={() => setHoveredId(event.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <motion.g
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="cursor-crosshair"
                            >
                                {/* The Main Dot */}
                                <circle
                                    r={event.isRealTime ? 5 : 2.5}
                                    fill={event.type === 'critical' ? '#ef4444' : event.type === 'suspicious' ? '#f59e0b' : '#22c55e'}
                                    className={event.type === 'critical' || event.isRealTime ? 'animate-pulse' : ''}
                                />

                                {/* Outer Glow/Ping for high risk or real-time */}
                                {(event.type === 'critical' || event.isRealTime) && (
                                    <circle
                                        r={10}
                                        fill="none"
                                        stroke={event.type === 'critical' ? '#ef4444' : '#3b82f6'}
                                        strokeWidth={1}
                                        className="animate-ping opacity-30"
                                    />
                                )}

                                {/* Combined Label for Hover or Real-Time scans */}
                                {(hoveredId === event.id || event.isRealTime) && (
                                    <g pointerEvents="none">
                                        <rect
                                            x={8}
                                            y={-18}
                                            width={event.target.length * 7 + 10}
                                            height={16}
                                            rx={4}
                                            fill="rgba(0,0,0,0.9)"
                                            className="stroke-white/10"
                                        />
                                        <text
                                            x={12}
                                            y={-7}
                                            fill="white"
                                            fontSize={9}
                                            fontFamily="monospace"
                                            className="font-bold"
                                        >
                                            {event.isRealTime ? `NEW SCAN: ${event.target}` : event.target}
                                        </text>
                                    </g>
                                )}
                            </motion.g>
                        </Marker>
                    ))}
                </AnimatePresence>
            </ComposableMap>

            {/* Legend Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 p-3 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-mono">
                <div className="flex items-center gap-2 text-white">
                    <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_#22c55e]" /> SAFE CONNECTION
                </div>
                <div className="flex items-center gap-2 text-white">
                    <div className="w-2 h-2 rounded-full bg-warning shadow-[0_0_8px_#f59e0b]" /> ANOMALY DETECTED
                </div>
                <div className="flex items-center gap-2 text-white">
                    <div className="w-2 h-2 rounded-full bg-danger shadow-[0_0_8px_#ef4444]" /> CRITICAL THREAT
                </div>
                <div className="h-px bg-white/10 my-1" />
                <div className="flex items-center gap-2 text-white uppercase opacity-70">
                    <div className="w-2 h-2 rounded-full bg-info animate-ping" /> OUR LIVE SCAN
                </div>
            </div>
        </div>
    );
};

export default ThreatMap;
