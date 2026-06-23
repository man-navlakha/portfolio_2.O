'use client';

import React, { useState } from 'react';
import CallToAction from "../Components/CallToAction";
import RevealOnScroll from "../Components/ui/RevealOnScroll";
import ShinyText from '../../components/ShinyText';
import { useProjects } from '@/app/context/ProjectContext';
import Link from 'next/link';
import Image from 'next/image';
import { Globe, Zap, Figma, Code, Layout as LayoutIcon } from 'lucide-react';

export default function ProjectsClient() {
    const { projects, loading, error } = useProjects();
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [activeTab, setActiveTab] = useState('All');

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand"></div>
        </div>
    );

    // Extract unique categories for tabs, cleaning up the string-based categories from API
    const allCategories = ['All', ...new Set(projects.flatMap(p =>
        p.category?.split(',').map(c => c.trim().replace(/"/g, '')) || []
    ))];

    const filteredProjects = (activeTab === 'All'
        ? projects
        : projects.filter(p => p.category?.toLowerCase().includes(activeTab.toLowerCase())))
        .sort((a, b) => {
            // First sort by featured status
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            // Then sort by the defined order
            return (a.order || 0) - (b.order || 0);
        });

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-brand selection:text-black pt-32">
            <section className="px-6 md:px-12 lg:px-24 pb-24">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-px w-8 bg-brand"></div>
                            <span className="text-brand text-xs font-bold uppercase tracking-[0.3em]">Selected Work</span>
                        </div>

                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-20">
                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                                CREATIVE <br /> <span className="text-slate-300 dark:text-white/20">PORTFOLIO</span>
                            </h1>

                            <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-white/5 p-2 rounded-2xl border border-slate-200 dark:border-white/10">
                                {allCategories.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg scale-105'
                                            : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </RevealOnScroll>

                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-24">
                        {filteredProjects.map((project, index) => (
                            <RevealOnScroll key={index} delay={index * 100}>
                                <Link href={`/projects/${project.id}`}>
                                    <div
                                        className={`group relative transition-all duration-700 ease-[cubic-bezier(0.23, 1, 0.32, 1)] ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-40 grayscale-[0.5]' : ''
                                            }`}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        {/* Featured Badge */}
                                        {project.isFeatured && (
                                            <div className="absolute -top-4 -right-4 z-20 bg-brand text-black text-[10px] font-black uppercase tracking-tighter px-4 py-2 rounded-full flex items-center gap-2 shadow-xl border-4 border-white dark:border-[#050505]">
                                                <Zap size={12} fill="currentColor" />
                                                Featured
                                            </div>
                                        )}

                                        {/* Image Container */}
                                        <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-white/5 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02] group-hover:-translate-y-2">
                                            {project.image ? (
                                                <Image
                                                    src={project.image}
                                                    alt={project.title}
                                                    fill
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-white/10">
                                                    <LayoutIcon size={64} strokeWidth={1} />
                                                </div>
                                            )}

                                            {/* Overlays */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            <div className="absolute bottom-8 left-8 flex gap-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                                {project.liveLink && project.liveLink !== "#" && (
                                                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20">
                                                        <Globe size={18} />
                                                    </div>
                                                )}
                                                {project.figma && project.figma !== "#" && (
                                                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20">
                                                        <Figma size={18} />
                                                    </div>
                                                )}
                                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20">
                                                    <Code size={18} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="mt-10 px-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {project.category?.split(',').map(tag => (
                                                        <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">
                                                            {tag.trim().replace(/"/g, '')}
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="text-xs font-medium text-slate-400">/ {project.year || new Date().getFullYear()}</span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-brand transition-colors duration-300">
                                                    {project.title}
                                                </h3>
                                                {(project.status?.toLowerCase().includes('active') || project.status?.toLowerCase().includes('production')) && (
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                )}
                                            </div>

                                            <p className="mt-4 text-slate-500 dark:text-gray-400 text-sm max-w-sm line-clamp-2 leading-relaxed">
                                                {project.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            <RevealOnScroll>
                <CallToAction />
            </RevealOnScroll>
        </div>
    );
}
