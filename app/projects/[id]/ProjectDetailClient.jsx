'use client';

import React, { use } from 'react';
import { useProjects } from '@/app/context/ProjectContext';
import { notFound } from 'next/navigation';
import RevealOnScroll from '@/app/Components/ui/RevealOnScroll';
import Link from 'next/link';
import {
    ArrowLeft,
    ExternalLink,
    Github,
    Figma,
    Calendar,
    User,
    Briefcase,
    CheckCircle2,
    Terminal,
    Layout,
    ArrowRight,
    Code2,
    ChevronRight,
    Star,
    GitFork,
    History,
    Zap
} from 'lucide-react';

export default function ProjectDetailClient({ params }) {
    const { id } = use(params);
    const { projects, loading: contextLoading, getProjectById } = useProjects();
    const [project, setProject] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchProject = async () => {
            setLoading(true);
            const data = await getProjectById(id);
            setProject(data);
            setLoading(false);
        };
        fetchProject();
    }, [id, getProjectById]);

    if (loading || contextLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand"></div>
        </div>
    );

    if (!project) {
        notFound();
    }

    const projectIndex = projects.findIndex((p) => p.id === id);
    const nextProject = projects.length > 0 ? projects[(projectIndex + 1) % projects.length] : null;

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-white pt-32 pb-24 px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
                {/* Back Button & Breadcrumb */}
                <RevealOnScroll delay={100}>
                    <div className="flex items-center gap-4 mb-12">
                        <Link
                            href="/projects"
                            className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand dark:text-gray-400 dark:hover:text-brand transition-colors"
                        >
                            <div className="p-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:border-brand/30 transition-colors">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            </div>
                            <span>Back to Projects</span>
                        </Link>
                    </div>
                </RevealOnScroll>

                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-16">
                        <RevealOnScroll delay={200}>
                            <div className="space-y-6">
                                {project.tags && project.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag) => (
                                            <span key={tag} className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-brand/10 text-brand rounded-full">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    {project.logo && (
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2 shrink-0">
                                            <img src={project.logo} alt={`${project.title} logo`} className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-slate-900 to-slate-500 dark:from-white dark:to-white/40 bg-clip-text text-transparent">
                                        {project.title}
                                    </h1>
                                </div>
                                {project.tagline && (
                                    <p className="text-xl md:text-2xl text-slate-600 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
                                        {project.tagline}
                                    </p>
                                )}
                            </div>
                        </RevealOnScroll>

                        {project.image && (
                            <RevealOnScroll delay={300}>
                                <div className={`w-full aspect-video rounded-[2rem] overflow-hidden ${project.color || 'bg-slate-100 dark:bg-white/5'} relative shadow-2xl group`}>
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </RevealOnScroll>
                        )}

                        {/* Overview & Description */}
                        {(project.overview) && (
                            <div className="grid gap-12">
                                {project.overview && (
                                    <RevealOnScroll>
                                        <section className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                                                    <Layout size={20} />
                                                </div>
                                                <h2 className="text-2xl font-bold tracking-tight">Project Overview</h2>
                                            </div>
                                            <p className="text-lg text-slate-700 dark:text-gray-300 leading-relaxed">
                                                {project.overview}
                                            </p>
                                            <div className="h-px w-full bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent" />
                                        </section>
                                    </RevealOnScroll>
                                )}

                                {project.description && project.description !== project.overview && (
                                    <RevealOnScroll>
                                        <section className="space-y-6">
                                            <h3 className="text-xl font-bold tracking-tight text-slate-400">The Challenge & Solution</h3>
                                            <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                                                {project.description}
                                            </p>
                                        </section>
                                    </RevealOnScroll>
                                )}


                            </div>
                        )}

                        {/* Features */}
                        {project.features && project.features.length > 0 && (
                            <RevealOnScroll>
                                <section className="space-y-8 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-8 md:p-12 rounded-[2.5rem]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight">Key Features</h2>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {project.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                                <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform shrink-0" />
                                                <span className="text-slate-700 dark:text-gray-300 font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </RevealOnScroll>
                        )}

                        {/* Design Screens Gallery */}
                        {project.designScreens && project.designScreens.length > 0 && (
                            <RevealOnScroll>
                                <section className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                            <Layout size={20} />
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight">Design & Interface</h2>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {project.designScreens.map((screen, idx) => (
                                            <div key={idx} className="aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 group">
                                                <img
                                                    src={screen}
                                                    alt={`${project.title} screen ${idx + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </RevealOnScroll>
                        )}

                        {/* Language Distribution */}
                        {project.languagesDistribution && Object.keys(project.languagesDistribution).length > 0 && (
                            <RevealOnScroll>
                                <section className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <Code2 size={20} />
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight">Language Distribution</h2>
                                    </div>
                                    <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-8 rounded-3xl">
                                        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10 mb-6">
                                            {Object.entries(project.languagesDistribution).map(([lang, percentage], idx) => {
                                                const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-emerald-500', 'bg-red-500'];
                                                return (
                                                    <div
                                                        key={lang}
                                                        style={{ width: `${percentage}%` }}
                                                        className={`${colors[idx % colors.length]} h-full`}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div className="flex flex-wrap gap-6">
                                            {Object.entries(project.languagesDistribution).map(([lang, percentage], idx) => {
                                                const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-emerald-500', 'bg-red-500'];
                                                return (
                                                    <div key={lang} className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`} />
                                                        <span className="text-sm font-bold text-slate-700 dark:text-gray-300">{lang}</span>
                                                        <span className="text-sm text-slate-400">{percentage}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </section>
                            </RevealOnScroll>
                        )}

                        {/* Build Steps */}
                        {project.buildSteps && project.buildSteps.length > 0 && (
                            <RevealOnScroll>
                                <section className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                            <Terminal size={20} />
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight">Installation</h2>
                                    </div>
                                    <div className="space-y-4">
                                        {project.buildSteps.map((step, idx) => (
                                            <div key={idx} className="bg-slate-900 rounded-2xl p-6 font-mono text-sm group overflow-hidden relative">
                                                <div className="absolute top-0 right-0 p-4 text-[10px] text-slate-500 uppercase tracking-widest pointer-events-none">
                                                    Step {idx + 1}
                                                </div>
                                                <div className="text-emerald-400 mb-2">// {step.step}</div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <code className="text-slate-300 break-all">{step.command}</code>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </RevealOnScroll>
                        )}

                        {/* Lighthouse & Performance */}
                        {project.lighthouse && (project.lighthouse.performance > 0 || project.lighthouse.testCoverage > 0) && (
                            <RevealOnScroll>
                                <section className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                            <Zap size={20} />
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight">Performance & Quality</h2>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Performance', value: project.lighthouse.performance, color: 'text-emerald-500' },
                                            { label: 'SEO', value: project.lighthouse.seo, color: 'text-blue-500' },
                                            { label: 'Accessibility', value: project.lighthouse.accessibility, color: 'text-orange-500' },
                                            { label: 'Test Coverage', value: project.lighthouse.testCoverage, color: 'text-purple-500' }
                                        ].map((stat) => (
                                            <div key={stat.label} className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-6 rounded-[2rem] text-center space-y-2">
                                                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}%</div>
                                                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-gray-500">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </RevealOnScroll>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
                        <RevealOnScroll delay={400}>
                            <div className="bg-white dark:bg-[#111] p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl space-y-8">
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 mb-6">
                                        Project Details
                                    </h3>

                                    <div className="space-y-6">
                                        {project.year && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-gray-400 group-hover:text-brand transition-colors">
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-500">Year</span>
                                                    <span className="font-semibold">{project.year}</span>
                                                </div>
                                            </div>
                                        )}

                                        {project.roles && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-gray-400 group-hover:text-brand transition-colors">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-500">Role</span>
                                                    <span className="font-semibold">{project.roles}</span>
                                                </div>
                                            </div>
                                        )}

                                        {project.category && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-gray-400 group-hover:text-brand transition-colors">
                                                    <Layout size={18} />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-500">Category</span>
                                                    <span className="font-semibold">{project.category}</span>
                                                </div>
                                            </div>
                                        )}

                                        {project.githubStats && project.githubStats.stars > 0 && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-gray-400 group-hover:text-amber-500 transition-colors">
                                                    <Star size={18} />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-500">GitHub Stars</span>
                                                    <span className="font-semibold">{project.githubStats.stars}</span>
                                                </div>
                                            </div>
                                        )}

                                        {project.githubStats && project.githubStats.forks > 0 && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors">
                                                    <GitFork size={18} />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-500">Forks</span>
                                                    <span className="font-semibold">{project.githubStats.forks}</span>
                                                </div>
                                            </div>
                                        )}

                                        {project.githubStats && project.githubStats.updatedAt && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-gray-400 group-hover:text-emerald-500 transition-colors">
                                                    <History size={18} />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-500">Last Updated</span>
                                                    <span className="font-semibold">{new Date(project.githubStats.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        )}

                                        {project.client && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-gray-400 group-hover:text-brand transition-colors">
                                                    <Briefcase size={18} />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-500">Project Type</span>
                                                    <span className="font-semibold">{project.client}</span>
                                                </div>
                                            </div>
                                        )}

                                        {project.status && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                                                    <CheckCircle2 size={18} />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-500">Status</span>
                                                    <span className="font-semibold">{project.status}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {project.techStack && project.techStack.length > 0 && (
                                    <>
                                        <div className="h-px w-full bg-slate-100 dark:bg-white/5" />
                                        <div>
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 mb-6 flex items-center gap-2">
                                                <Code2 size={12} /> Tech Stack
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {project.techStack.map((tech) => (
                                                    <div
                                                        key={tech.name}
                                                        className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl text-xs font-semibold border border-transparent hover:border-brand/20 transition-all cursor-default"
                                                        title={tech.description}
                                                    >
                                                        {tech.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Team Members */}
                                {project.teamMembers && project.teamMembers.length > 0 && (
                                    <>
                                        <div className="h-px w-full bg-slate-100 dark:bg-white/5" />
                                        <div>
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 mb-6 flex items-center gap-2">
                                                Team
                                            </h3>
                                            <div className="space-y-4">
                                                {project.teamMembers.map((member, idx) => (
                                                    <div key={idx} className="flex items-center justify-between group/member">
                                                        <span className="text-sm font-bold text-slate-700 dark:text-gray-300">{member.Name}<br /> <span className="text-xs text-slate-400 dark:text-gray-500">{member.role}</span></span>
                                                        <div className="flex gap-2">
                                                            {member.GitHub && (
                                                                <a href={member.GitHub} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 hover:text-brand transition-colors">
                                                                    <Github size={14} />
                                                                </a>
                                                            )}
                                                            {member.LinkedIn && (
                                                                <a href={member.LinkedIn} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 hover:text-brand transition-colors">
                                                                    <User size={14} />
                                                                </a>
                                                            )}
                                                            {member.portfolio && (
                                                                <a href={member.portfolio} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 hover:text-brand transition-colors">
                                                                    <User size={14} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Actions */}
                                <div className="pt-4 flex flex-col gap-3">
                                    {(project.isWebAvailable || project.liveLink !== '#') && (
                                        <a
                                            href={project.liveLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-center gap-2 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
                                        >
                                            Visit Website
                                            <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </a>
                                    )}
                                    {project.isAppAvailable && project.appLink && (
                                        <a
                                            href={project.appLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-center gap-2 w-full py-4 bg-brand text-black rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
                                        >
                                            Download App
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    )}
                                    {project.githubLink && project.githubLink !== '#' && (
                                        <a
                                            href={project.githubLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-center gap-2 w-full py-4 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.98]"
                                        >
                                            <Github size={16} />
                                            View Source
                                        </a>
                                    )}
                                    {project.apiDocsLink && (
                                        <a
                                            href={project.apiDocsLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-center gap-2 w-full py-4 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.98]"
                                        >
                                            <Terminal size={16} />
                                            API Documentation
                                        </a>
                                    )}
                                    {project.figma && project.figma !== '#' && (
                                        <a
                                            href={project.figma}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-center gap-2 w-full py-4 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.98]"
                                        >
                                            <Figma size={16} />
                                            View Design
                                        </a>
                                    )}
                                </div>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>

                {/* Related Projects Section */}
                {project.relatedProjects && project.relatedProjects.length > 0 && (
                    <RevealOnScroll>
                        <div className="mt-32 space-y-12">
                            <h2 className="text-3xl font-bold tracking-tight">Related Projects</h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                {projects.filter(p => project.relatedProjects.map(id => String(id)).includes(p.id)).map((relatedP) => (
                                    <Link key={relatedP.id} href={`/projects/${relatedP.id}`} className="group block">
                                        <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 mb-4 relative">
                                            {relatedP.image && (
                                                <img
                                                    src={relatedP.image}
                                                    alt={relatedP.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <ArrowRight className="text-white w-8 h-8 -rotate-45" />
                                            </div>
                                        </div>
                                        <h4 className="font-bold group-hover:text-brand transition-colors">{relatedP.title}</h4>
                                        <p className="text-sm text-slate-500 dark:text-gray-400">{relatedP.type}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </RevealOnScroll>
                )}

                {/* Next Project Footer */}
                <RevealOnScroll>
                    <div className="mt-32 pt-16 border-t border-slate-200 dark:border-white/10">
                        <Link href={`/projects/${nextProject.id}`} className="group block relative">
                            <div className="flex flex-col items-center text-center space-y-6">
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 dark:text-gray-500 group-hover:text-brand transition-colors">
                                    Up Next
                                </span>
                                <h2 className="text-4xl md:text-6xl font-black group-hover:scale-105 transition-transform duration-500 flex items-center gap-6">
                                    {nextProject.title}
                                    <ArrowRight className="w-10 h-10 md:w-16 md:h-16 text-brand -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                                </h2>
                            </div>
                        </Link>
                    </div>
                </RevealOnScroll>
            </div>
        </div>
    );
}
