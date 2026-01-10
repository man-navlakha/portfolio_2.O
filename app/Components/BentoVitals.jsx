"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Music, Cpu, Code2, Globe2, Coffee, Zap } from 'lucide-react';

const LiveClock = () => {
    const [time, setTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!mounted) {
        return (
            <div className="flex flex-col justify-between h-full p-6 animate-pulse">
                <div className="flex justify-between items-start">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <Clock size={20} />
                    </div>
                </div>
                <div className="mt-4">
                    <div className="h-10 w-32 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-between h-full p-6">
            <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Clock size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Local Time</span>
            </div>
            <div className="mt-4">
                <div className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </div>
                <div className="text-xs text-slate-500 mt-1">Gujarat, India (GMT+5:30)</div>
            </div>
        </div>
    );
};

const CurrentTrack = () => {
    return (
        <div className="flex flex-col justify-between h-full p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex justify-between items-start relative z-10">
                <div className="p-2 rounded-lg bg-[#1DB954]/10 text-[#1DB954]">
                    <Music size={20} />
                </div>
                <div className="flex gap-0.5 items-end h-4">
                    {[0.6, 0.4, 0.8, 0.5, 0.7].map((h, i) => (
                        <motion.div
                            key={i}
                            animate={{ height: ["20%", "100%", "20%"] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                            className="w-0.5 bg-[#1DB954]"
                            style={{ height: `${h * 100}%` }}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-8 relative z-10">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">On Repeat</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white truncate">Lo-fi Beats</div>
                <div className="text-sm text-slate-500">ChilledCow • Study Session</div>
            </div>
        </div>
    );
};

const TechWiggle = () => {
    const techs = [
        { icon: Code2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { icon: Globe2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' }
    ];

    return (
        <div className="grid grid-cols-2 gap-3 h-full p-4">
            {techs.map((T, i) => (
                <motion.div
                    key={i}
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    className={`${T.bg} rounded-2xl flex items-center justify-center aspect-square transition-colors hover:bg-opacity-20`}
                >
                    <T.icon size={24} className={T.color} />
                </motion.div>
            ))}
        </div>
    );
};

const MiniMap = () => {
    return (
        <div className="h-full w-full relative group overflow-hidden">
            <img
                src="https://ik.imagekit.io/pxc/mannavlakha/image.png?q=80&w=1000&auto=format&fit=crop"
                className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                alt="Location Map"
            />
            <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-transparent transition-colors" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                    <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-brand rounded-full opacity-50"
                    />
                    <div className="relative w-4 h-4 bg-brand rounded-full border-2 border-white dark:border-slate-900 z-10" />
                </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2">
                <MapPin size={12} className="text-white" />
                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">AHM, GJ, IN</span>
            </div>
        </div>
    );
};

const StatsTile = ({ label, value, sub }) => (
    <div className="p-6 flex flex-col justify-between h-full group hover:bg-brand transition-colors duration-500">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-white/60 transition-colors">{label}</span>
        <div className="mt-2">
            <div className="text-4xl font-black text-slate-900 dark:text-white group-hover:text-white transition-colors">{value}</div>
            <div className="text-[10px] text-slate-500 group-hover:text-white/40 transition-colors uppercase font-bold mt-1">{sub}</div>
        </div>
    </div>
);

export default function BentoVitals() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-4 md:grid-rows-2 gap-4 h-[600px] md:h-[400px]">
            {/* Time Tile */}
            <div className="col-span-2 row-span-1 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden">
                <LiveClock />
            </div>

            {/* Map Tile */}
            <div className="col-span-2 row-span-1 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden">
                <MiniMap />
            </div>

            {/* Tech Tile */}
            <div className="col-span-1 row-span-1 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden">
                <TechWiggle />
            </div>

            {/* Spotify/Music Tile */}
            <div className="col-span-1 row-span-1 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden">
                <CurrentTrack />
            </div>

            {/* Stats Tile 1 */}
            <div className="col-span-1 row-span-1 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden">
                <StatsTile label="Experience" value="1" sub="Years Journey" />
            </div>

            {/* Stats Tile 2 */}
            <div className="col-span-1 row-span-1 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden">
                <StatsTile label="Projects" value="6+" sub="Finished Works" />
            </div>
        </div>
    );
}
