'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Calendar, Clock } from 'lucide-react';
import RevealOnScroll from '../Components/ui/RevealOnScroll';
import ShinyText from '../../components/ShinyText';
import CallToAction from '../Components/CallToAction';

export default function BlogClient({ blogs }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Filter only active blogs
    const activeBlogs = blogs.filter((blog) => blog.status === true);

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-brand selection:text-black pt-32">
            <section className="px-6 md:px-12 lg:px-24 pb-24">
                <div className="max-w-7xl mx-auto">
                    <RevealOnScroll>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-px w-8 bg-brand"></div>
                            <span className="text-brand text-xs font-bold uppercase tracking-[0.3em]">Blog</span>
                        </div>

                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-20">
                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                                THOUGHTS & <br /> <span className="text-slate-300 dark:text-white/20">ARTICLES</span>
                            </h1>

                            <p className="text-slate-500 dark:text-gray-400 text-lg max-w-md leading-relaxed">
                                Thoughts, learnings, and tutorials on web development, software engineering, and design.
                            </p>
                        </div>
                    </RevealOnScroll>

                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-24">
                        {activeBlogs.map((blog, index) => (
                            <RevealOnScroll key={blog.slug} delay={index * 100}>
                                <Link href={`/blog/${blog.slug}`}>
                                    <div
                                        className={`group relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-40 grayscale-[0.5]' : ''
                                            }`}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        {/* Image Container */}
                                        {blog.img_link && (
                                            <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-white/5 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02] group-hover:-translate-y-2">
                                                <Image
                                                    src={blog.img_link}
                                                    alt={blog.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                                {/* Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                {/* Read badge on hover */}
                                                <div className="absolute bottom-8 left-8 flex gap-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                                    <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 text-sm font-medium flex items-center gap-2">
                                                        Read Article <ArrowUpRight size={14} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="mt-10 px-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {blog.tags?.map(tag => (
                                                        <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                                                    {blog.read_time && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} /> {blog.read_time}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-brand transition-colors duration-300">
                                                {blog.title}
                                            </h3>

                                            <p className="mt-4 text-slate-500 dark:text-gray-400 text-sm max-w-sm line-clamp-2 leading-relaxed">
                                                {blog.short_description}
                                            </p>

                                            <div className="flex items-center gap-2 mt-6 text-xs text-slate-400 dark:text-gray-500">
                                                <Calendar size={12} />
                                                <time dateTime={blog.date}>
                                                    {new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </time>
                                            </div>
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
