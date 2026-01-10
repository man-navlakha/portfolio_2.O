'use client'
import React, { useState, useEffect } from 'react'
import { ArrowUpRight, Download, Brain, PenTool, Code2, Rocket, ShieldCheck, Sparkles } from 'lucide-react';
import CallToAction from '../Components/CallToAction';
import RevealOnScroll from '../Components/ui/RevealOnScroll';
import AnimatedButton from '../Components/ui/AnimatedButton';
import Scroll from '../Components/Scroll';
import ShinyText from '../../components/ShinyText';
import { Button } from "@/components/ui/button"
import BentoVitals from '../Components/BentoVitals';

import { useExperience } from '../context/ExperienceContext';
import { Loader2 } from 'lucide-react';

const AboutClient = () => {
    const { experiences, loading: expLoading } = useExperience();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    const processSteps = [
        {
            number: '01.',
            title: 'Strategize',
            description: 'To create something awesome, one must first talk about the details. Planning is essential.',
            icon: <Brain className="w-6 h-6 text-brand" />
        },
        {
            number: '02.',
            title: 'Wireframe',
            description: 'After hashing out the details of the website, it\'s easy to throw the ideas onto pen & paper.',
            icon: <PenTool className="w-6 h-6 text-brand" />
        },
        {
            number: '03.',
            title: 'Design',
            description: 'The most fun part of all - adding pizzaz to the wireframes and bring it to life.',
            icon: <Sparkles className="w-6 h-6 text-brand" />
        },
        {
            number: '04.',
            title: 'Development',
            description: 'The design may be final but it needs to be functional and practical. Development is key.',
            icon: <Code2 className="w-6 h-6 text-brand" />
        },
        {
            number: '05.',
            title: 'Quality Assurance',
            description: 'Website load times, SEO, file optimization, etc., weigh in to the quality of the site.',
            icon: <ShieldCheck className="w-6 h-6 text-brand" />
        }
    ];
    return (
        <>
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-secondary selection:bg-brand selection:text-black pt-20">

                {/* Hero Section */}
                <section className="px-6 md:px-12 lg:px-24 py-12 md:py-24">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                        {/* Image Column */}
                        <RevealOnScroll>
                            <div className="relative">
                                <div className="aspect-[3/4] md:aspect-[4/5] max-w-[500px] w-full rounded-[2.5rem] overflow-hidden bg-gray-200 dark:bg-gray-900 relative z-10">
                                    <img
                                        src="https://ik.imagekit.io/pxc/mannavlakha/ps.png"
                                        alt="Profile"
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 bg-[#f0f0f0] dark:bg-[#1a1a1a]"
                                    />
                                </div>

                                {/* Rotating Badge */}
                                <div className="absolute -bottom-12 -right-3 md:right-[11px] z-20 w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center border border-slate-200 dark:border-white/10">
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <svg viewBox="0 0 100 100" className="w-full h-full p-2 animate-spin-slow">
                                            <path
                                                id="curve"
                                                d="M 50 50 m -37 0 a 37 37 0 1 1 74 0 a 37 37 0 1 1 -74 0"
                                                fill="transparent"
                                            />
                                            <text className="text-[8px] md:text-[8px] lg:text-[11px] font-bold uppercase tracking-[0.4em] fill-slate-900 dark:fill-white">
                                                <textPath href="#curve">
                                                    • Lets Talk • Lets Talk • Lets Talk
                                                </textPath>
                                            </text>
                                        </svg>
                                        <ArrowUpRight className="absolute w-8 h-8 text-brand hover:rotate-50 transition-all duration-500" />
                                    </div>
                                </div>
                            </div>
                        </RevealOnScroll>

                        {/* Content Column */}
                        <RevealOnScroll delay={200}>
                            <div className="space-y-8">
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                                    A <span className="text-brand">creative developer</span> & digital designer
                                </h1>
                                <p className="text-slate-600 dark:text-gray-400 text-lg leading-relaxed max-w-xl">
                                    A frontend developer with a strong focus on creating responsive, user-friendly interfaces and smooth digital experiences. I have extensive experience using React.js, building career pages and AI model interfaces.
                                </p>
                                <a href="https://ik.imagekit.io/pxc/mannavlakha/Man%20Navlakha%20Resume.pdf?updatedAt=1755343374880" target="_blank" rel="noopener noreferrer">
                                    <AnimatedButton
                                        hoverColor="bg-slate-900 dark:bg-white"
                                        hoverTextColor="group-hover:text-white dark:group-hover:text-black"
                                    >
                                        My Resume
                                    </AnimatedButton>
                                </a>
                            </div>
                        </RevealOnScroll>
                    </div>
                </section>

                <div className="bg-gray-700/30 dark:bg-gray-700/30 h-[1px] w-full"></div>
                <div className="">
                    <Scroll />
                </div>
                <div className="bg-gray-700/30 dark:bg-gray-700/30 h-[1px] w-full"></div>

                {/* Bento Vitals Section */}
                <section className="px-6 md:px-12 lg:px-24 py-16">
                    <div className="max-w-7xl mx-auto">
                        <RevealOnScroll>
                            <BentoVitals />
                        </RevealOnScroll>
                    </div>
                </section>

                {/* Design Process */}
                <section className="px-6 md:px-12 lg:px-24 py-24">
                    <div className="max-w-7xl mx-auto">
                        <RevealOnScroll>
                            <div className="flex items-center gap-2 text-brand text-sm font-medium tracking-widest mb-4">
                                <ShinyText speed={2}
                                    color="#30af5b"
                                    shineColor="#000000" text="✦ STEPS I FOLLOW" className=' text-xl' />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">My Design Process</h2>
                            <p className="text-slate-600 dark:text-gray-400 mb-16">I follow a structured process to ensure high-quality results.</p>
                        </RevealOnScroll>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {processSteps.map((step, index) => (
                                <RevealOnScroll key={index} delay={index * 100}>
                                    <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-3xl p-8 hover:border-brand/30 transition-colors group shadow-sm dark:shadow-none h-full">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center mb-6 group-hover:bg-brand/10 transition-colors">
                                            {step.icon}
                                        </div>
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <span className="text-slate-900 dark:text-white">{step.number}</span> {step.title}
                                        </h3>
                                        <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </RevealOnScroll>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Experience */}
                <section className="px-6 md:px-12 lg:px-24 py-24 bg-slate-50 dark:bg-[#0a0a0a]">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
                        <RevealOnScroll>
                            <div>
                                <div className="flex items-center gap-2 text-brand text-sm font-medium tracking-widest mb-4">
                                    <ShinyText speed={2}
                                        color="#30af5b"
                                        shineColor="#000000" text="✦ WORK HISTORY" className=' text-xl' />
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold mb-8 text-slate-900 dark:text-white">Experience</h2>
                                <p className="text-slate-600 dark:text-gray-400 leading-relaxed max-w-md">
                                    My professional journey involves working with innovative companies and contributing to impactful projects.
                                </p>
                            </div>
                        </RevealOnScroll>

                        <div className="space-y-8">
                            {!mounted || expLoading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand" />
                                </div>
                            ) : (
                                experiences.map((exp, index) => (
                                    <RevealOnScroll key={exp.id || index} delay={index * 100}>
                                        <div className="group flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-8 last:border-0">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-gray-800">
                                                    <img src={exp.logo} alt={exp.company} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors">{exp.role}</h3>
                                                    <p className="text-slate-600 dark:text-gray-400 text-sm">{exp.company}</p>
                                                </div>
                                            </div>
                                            <span className="text-slate-500 dark:text-gray-500 text-sm">{exp.period}</span>
                                        </div>
                                    </RevealOnScroll>
                                ))
                            )}

                            <RevealOnScroll delay={400}>
                                <div className="pt-8">
                                    <a href="https://www.linkedin.com/in/navlakhaman/" target="_blank" rel="noopener noreferrer">
                                        <Button variant="link" className="text-slate-900 dark:text-white hover:text-brand p-0 h-auto font-medium">
                                            Show More on LinkedIn
                                        </Button>
                                    </a>
                                </div>
                            </RevealOnScroll>
                        </div>
                    </div>
                </section>

            </div>
            <CallToAction />
        </>
    )
}

export default AboutClient;
