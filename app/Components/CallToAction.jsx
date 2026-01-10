import React from 'react';
import AnimatedButton from "./ui/AnimatedButton";
import RevealOnScroll from "./ui/RevealOnScroll";
import SplitText from "./ui/SplitText";
import ShinyText from '../../components/ShinyText';
import Link from 'next/link';

export default function CallToAction() {
    return (
        <section className="py-12 px-6 md:px-12 lg:px-24 bg-slate-50 dark:bg-[#0a0a0a]">

            <div className="max-w-7xl mx-auto">
                <RevealOnScroll>
                    <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-12 md:p-24 text-center relative overflow-hidden shadow-sm dark:shadow-none">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-8">
                            <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
                            <span className="text-sm text-slate-700 dark:text-gray-300 font-medium"><ShinyText speed={2}
                                color="#30af5b"
                                shineColor="#000000" text="Available for work" /></span>
                        </div>

                        {/* Heading */}

                        <SplitText
                            text="Let's create your next big idea."
                            className="text-4xl md:text-6xl lg:text-7xl h-full py-3 font-bold text-slate-900 dark:text-white mb-12 tracking-tight"
                            delay={100}
                            duration={0.6}
                            ease="elastic.out(1, 0.9)"
                            splitType="words"
                            from={{ opacity: 0, y: 40 }}
                            to={{ opacity: 1, y: 0 }}
                            threshold={0.1}
                            rootMargin="-100px"
                            textAlign="center"
                        />

                        {/* Button with Curved Slide Up Animation */}
                        <Link href="/contact">
                            <AnimatedButton>
                                Contact Me
                            </AnimatedButton></Link>
                    </div>
                </RevealOnScroll>
            </div>
        </section>
    );
}
