"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Home,
    User,
    Grid,
    Send,
    Moon,
    Sun,
    Command,
    ArrowRight,
    Sparkles,
    Github,
    Linkedin
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useProjects } from '@/app/context/ProjectContext';

const BASE_COMMANDS = [
    {
        id: 'nav-home',
        title: 'Home',
        description: 'Go to laboratory homepage',
        icon: Home,
        shortcut: ['G', 'H'],
        action: (router) => router.push('/'),
        category: 'Navigation'
    },
    {
        id: 'nav-about',
        title: 'About',
        description: 'Learn more about my journey',
        icon: User,
        shortcut: ['G', 'A'],
        action: (router) => router.push('/about'),
        category: 'Navigation'
    },
    {
        id: 'nav-projects',
        title: 'Projects',
        description: 'View my selected works',
        icon: Grid,
        shortcut: ['G', 'P'],
        action: (router) => router.push('/projects'),
        category: 'Navigation'
    },
    {
        id: 'nav-contact',
        title: 'Contact',
        description: 'Reach out for collaborations',
        icon: Send,
        shortcut: ['G', 'C'],
        action: (router) => router.push('/contact'),
        category: 'Navigation'
    },
    {
        id: 'theme-toggle',
        title: 'Toggle Theme',
        description: 'Switch between light and dark mode',
        icon: Sparkles,
        shortcut: ['T', 'T'],
        action: (_, setTheme, theme) => setTheme(theme === 'dark' ? 'light' : 'dark'),
        category: 'System'
    }
];

const socialCommands = [
    {
        id: 'social-github',
        title: 'GitHub',
        description: 'View my open source projects',
        icon: Github,
        action: () => window.open('https://github.com/man-navlakha', '_blank'),
        category: 'Social'
    },
    {
        id: 'social-linkedin',
        title: 'LinkedIn',
        description: 'Connect with me on LinkedIn',
        icon: Linkedin,
        action: () => window.open('https://www.linkedin.com/in/navlakhaman/', '_blank'),
        category: 'Social'
    }
];

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const { projects } = useProjects();
    const inputRef = useRef(null);

    const projectCommands = projects.map(project => ({
        id: `project-${project.id}`,
        title: project.title,
        description: project.tagline,
        icon: Grid,
        action: (router) => router.push(`/projects/${project.id}`),
        category: 'Projects'
    }));

    const ALL_COMMANDS = [...BASE_COMMANDS, ...projectCommands, ...socialCommands];

    const filteredCommands = ALL_COMMANDS.filter(cmd =>
        cmd.title.toLowerCase().includes(search.toLowerCase()) ||
        cmd.category.toLowerCase().includes(search.toLowerCase())
    );

    const executeCommand = useCallback((cmd) => {
        if (cmd.action) {
            cmd.action(router, setTheme, theme);
        }
        setIsOpen(false);
        setSearch('');
    }, [router, setTheme, theme]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Toggle palette
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }

            // Close on escape
            if (e.key === 'Escape') {
                setIsOpen(false);
            }

            if (isOpen) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredCommands[selectedIndex]) {
                        executeCommand(filteredCommands[selectedIndex]);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredCommands, selectedIndex, executeCommand]);

    useEffect(() => {
        if (isOpen) {
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 10);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const categories = Array.from(new Set(filteredCommands.map(cmd => cmd.category)));

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
                    />

                    {/* Palette container */}
                    <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                            className="w-full max-w-2xl bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden pointer-events-auto"
                        >
                            {/* Search input header */}
                            <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                                <Search className="w-5 h-5 text-slate-400 dark:text-gray-500 mr-3" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Type a command or search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 text-base"
                                />
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-slate-400 dark:text-gray-500 font-medium">
                                    <Command size={10} />
                                    <span>K</span>
                                </div>
                            </div>

                            {/* Results area */}
                            <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
                                {filteredCommands.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <p className="text-slate-400 dark:text-gray-500 text-sm">No commands found for "{search}"</p>
                                    </div>
                                ) : (
                                    categories.map(category => (
                                        <div key={category} className="mb-2 last:mb-0">
                                            <h3 className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                                                {category}
                                            </h3>
                                            {filteredCommands
                                                .filter(cmd => cmd.category === category)
                                                .map((cmd) => {
                                                    const globalIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                                                    const isSelected = selectedIndex === globalIndex;
                                                    const Icon = cmd.icon;

                                                    return (
                                                        <div
                                                            key={cmd.id}
                                                            onClick={() => executeCommand(cmd)}
                                                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                            className={`
                                flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 group
                                ${isSelected
                                                                    ? 'bg-brand/10 dark:bg-brand/10'
                                                                    : 'hover:bg-slate-50 dark:hover:bg-white/5'}
                              `}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`
                                  p-2 rounded-lg transition-colors
                                  ${isSelected
                                                                        ? 'bg-brand text-white'
                                                                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 group-hover:bg-slate-200 dark:group-hover:bg-white/10'}
                                `}>
                                                                    <Icon size={18} />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className={`text-sm font-medium ${isSelected ? 'text-brand' : 'text-slate-700 dark:text-gray-200'}`}>
                                                                        {cmd.title}
                                                                    </span>
                                                                    <span className="text-xs text-slate-400 dark:text-gray-500">
                                                                        {cmd.description}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                {isSelected && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, x: -5 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        className="text-brand mr-2"
                                                                    >
                                                                        <ArrowRight size={14} />
                                                                    </motion.div>
                                                                )}
                                                                {cmd.shortcut && (
                                                                    <div className="flex items-center gap-1">
                                                                        {cmd.shortcut.map((s, i) => (
                                                                            <span key={`${s}-${i}`} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-[10px] text-slate-500 dark:text-gray-400 min-w-[16px] text-center">
                                                                                {s}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer info */}
                            <div className="px-4 py-3 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-gray-500">
                                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10">ESC</span>
                                        <span>to close</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-gray-500">
                                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10">↑↓</span>
                                        <span>to navigate</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-gray-500">
                                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10">ENTER</span>
                                        <span>to select</span>
                                    </div>
                                </div>

                                <div className="text-[10px] font-medium text-brand/60 uppercase tracking-widest">
                                    Command Menu
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
