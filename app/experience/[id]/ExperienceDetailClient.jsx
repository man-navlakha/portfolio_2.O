"use client";

import React, { useState, useEffect } from 'react';
import { useExperience } from '@/app/context/ExperienceContext';
import { useRouter } from 'next/navigation';
import RevealOnScroll from '@/app/Components/ui/RevealOnScroll';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Briefcase,
    CheckCircle2,
    Code2,
    Award,
    Building2,
    Clock,
    ChevronRight
} from 'lucide-react';

export default function ExperienceDetailClient({ id }) {
    const router = useRouter();
    const { loading: contextLoading, getExperienceById } = useExperience();
    const [experience, setExperience] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExperience = async () => {
            if (!id) {
                setExperience(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            const data = await getExperienceById(id);
            setExperience(data);
            setLoading(false);
        };
        fetchExperience();
    }, [id, getExperienceById]);

    if (loading || contextLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand"></div>
        </div>
    );

    if (!experience) {
        return (
            <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-white pt-32 pb-24 px-4 md:px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-10 text-center space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight">Experience Not Found</h1>
                        <p className="text-slate-600 dark:text-gray-400">
                            The experience you are trying to view does not exist.
                        </p>
                        <Link
                            href="/experience"
                            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
                        >
                            Back to Experience
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-white pt-32 pb-24 px-4 md:px-6 relative overflow-hidden">
            {/* Large Background Logo Watermark */}
            <div className="absolute -left-20 top-40 opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none rotate-12 hidden lg:block">
                <Image src={experience.logo} alt="Company logo watermark" role="presentation" width={500} height={500} className="object-contain grayscale" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Back Button */}
                <RevealOnScroll delay={100}>
                    <div className="flex items-center gap-4 mb-12">
                        <button
                            onClick={() => router.back()}
                            className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand dark:text-gray-400 dark:hover:text-brand transition-colors cursor-pointer"
                        >
                            <div className="p-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:border-brand/30 transition-colors">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            </div>
                            <span>Go Back</span>
                        </button>
                    </div>
                </RevealOnScroll>

                <div className="space-y-12">
                    {/* Header Section */}
                    <RevealOnScroll delay={200}>
                        <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-14 border-b border-slate-200 dark:border-white/10 pb-16">
                            <div className="w-32 h-32 md:w-52 md:h-52 rounded-[2.5rem] overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 md:p-10 shrink-0 flex items-center justify-center shadow-2xl group/logo hover:scale-105 transition-transform duration-500">
                                <Image src={experience.logo} alt={experience.company} width={208} height={208} className="w-full h-full object-contain group-hover/logo:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-widest">
                                    <Clock size={12} /> {experience.period}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                                    {experience.role}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 dark:text-gray-400 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={18} className="text-brand" />
                                        <span className="text-xl">{experience.company}</span>
                                    </div>
                                    {experience.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={18} />
                                            <span>{experience.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </RevealOnScroll>

                    {/* Content Body */}
                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-12">
                            {/* Description */}
                            {experience.description && (
                                <RevealOnScroll>
                                    <section className="space-y-6">
                                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                                            <Briefcase className="text-brand" size={24} />
                                            Job Description
                                        </h2>
                                        <p className="text-lg text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                                            {experience.description}
                                        </p>
                                    </section>
                                </RevealOnScroll>
                            )}

                            {/* Responsibilities */}
                            {experience.responsibilities && experience.responsibilities.length > 0 && (
                                <RevealOnScroll>
                                    <section className="space-y-8 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-8 md:p-10 rounded-[2.5rem]">
                                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                                            <CheckCircle2 className="text-emerald-500" size={24} />
                                            Key Responsibilities
                                        </h2>
                                        <ul className="space-y-4">
                                            {experience.responsibilities.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-4 group">
                                                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-brand shrink-0 group-hover:scale-150 transition-transform" />
                                                    <span className="text-slate-700 dark:text-gray-300 leading-relaxed">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                </RevealOnScroll>
                            )}

                            {/* Achievements */}
                            {experience.achievements && experience.achievements.length > 0 && (
                                <RevealOnScroll>
                                    <section className="space-y-8">
                                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                                            <Award className="text-amber-500" size={24} />
                                            Achievements
                                        </h2>
                                        <div className="grid gap-4">
                                            {experience.achievements.map((achievement, idx) => (
                                                <div key={idx} className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-4 items-start">
                                                    <Award className="text-amber-500 shrink-0 mt-1" size={20} />
                                                    <p className="text-slate-700 dark:text-gray-300 font-medium">{achievement}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </RevealOnScroll>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Skills/Tools */}
                            {(experience.skills?.length > 0 || experience.technologies?.length > 0) && (
                                <RevealOnScroll>
                                    <div className="bg-white dark:bg-[#111] p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl space-y-8">
                                        <div>
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 mb-6 flex items-center gap-2">
                                                <Code2 size={12} /> Core Technologies
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {(experience.technologies?.length > 0 ? experience.technologies : experience.skills).map((tech) => (
                                                    <div
                                                        key={tech}
                                                        className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl text-xs font-bold border border-transparent hover:border-brand/20 transition-all cursor-default"
                                                    >
                                                        {tech}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Company Context */}
                                        <div className="h-px w-full bg-slate-100 dark:bg-white/5" />
                                        <div>
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 mb-6 flex items-center gap-2">
                                                Timeline
                                            </h3>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-brand">
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-500">Duration</span>
                                                    <span className="font-bold">{experience.period}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </RevealOnScroll>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
