"use client";
import React, { useState } from 'react'
import { ArrowUpRight, Download, Brain, PenTool, Code2, Rocket, ShieldCheck, Sparkles, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import CallToAction from '../Components/CallToAction';
import RevealOnScroll from '../Components/ui/RevealOnScroll';
import AnimatedButton from '../Components/ui/AnimatedButton';
import Scroll from '../Components/Scroll';
import ShinyText from '../../components/ShinyText';
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Github, Instagram, Linkedin, Mail, Twitter } from 'lucide-react';
import axios from 'axios';

const ContactClient = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState({
        loading: false,
        success: false,
        error: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: null });

        try {
            const response = await axios.post('/api/contact', formData);
            if (response.status === 200 || response.status === 201) {
                setStatus({ loading: false, success: true, error: null });
                setFormData({ name: '', email: '', subject: '', message: '' });
                // Reset success message after 5 seconds
                setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
            }
        } catch (err) {
            console.error('Error sending message:', err);
            let errorMessage = err.response?.data?.message || 'Failed to send message. Please try again later.';

            if (err.response?.status === 429) {
                errorMessage = "You're sending messages a bit too fast! Please wait a moment before trying again.";
            }

            setStatus({
                loading: false,
                success: false,
                error: errorMessage
            });
        }
    };

    const faqs = [
        {
            question: "What is your current role?",
            answer: "I am a Jr. Frontend Developer, currently open to full-time opportunities."
        },
        {
            question: "How much does it cost for a high performing website?",
            answer: "The cost varies depending on the complexity and requirements of the project. Feel free to reach out for a custom quote."
        },
        {
            question: "How long will the work take from start to finish?",
            answer: "Timeline depends on the scope of the project. A typical website can take anywhere from 2-4 weeks."
        },
        {
            question: "Are you available to join as full time?",
            answer: "Yes, I am currently open to discussing full-time opportunities that align with my skills and interests."
        }
    ];

    return (
        <>
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans selection:bg-brand selection:text-black pt-20">

                <section className="px-6 md:px-12 lg:px-24 py-12 md:py-24">
                    <div className="max-w-7xl mx-auto">
                        <RevealOnScroll>
                            <div className="flex items-center gap-2 text-brand text-sm font-medium tracking-widest mb-4">
                                <ShinyText speed={2}
                                    color="#30af5b"
                                    shineColor="#000000" text="✦ CONNECT WITH ME" className=' text-xl' />
                            </div>

                            <h1 className="text-5xl md:text-6xl font-bold mb-16 max-w-2xl leading-tight text-slate-900 dark:text-white">
                                Let's start a project together
                            </h1>
                        </RevealOnScroll>

                        <div className="grid lg:grid-cols-2 gap-16 items-start">
                            {/* Contact Form */}
                            <RevealOnScroll delay={200}>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600 dark:text-gray-400">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="John Doe"
                                            className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-600 dark:text-gray-400">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="john@example.com"
                                                className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-600 dark:text-gray-400">Subject</label>
                                            <input
                                                type="text"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                placeholder="Inquiry about..."
                                                className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600 dark:text-gray-400">Message</label>
                                        <textarea
                                            rows={6}
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            placeholder="Tell me about your project..."
                                            className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand transition-colors resize-none"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <button
                                            type="submit"
                                            disabled={status.loading}
                                            className="w-full md:w-max px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-brand dark:hover:bg-brand hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            {status.loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                    Send Message
                                                </>
                                            )}
                                        </button>

                                        {status.success && (
                                            <div className="flex items-center gap-2 text-green-500 font-medium animate-in fade-in slide-in-from-bottom-2">
                                                <CheckCircle2 className="w-5 h-5" />
                                                Message sent successfully!
                                            </div>
                                        )}

                                        {status.error && (
                                            <div className="flex items-center gap-2 text-red-500 font-medium animate-in fade-in slide-in-from-bottom-2">
                                                <AlertCircle className="w-5 h-5" />
                                                {status.error}
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </RevealOnScroll>

                            {/* Profile Card */}
                            <RevealOnScroll delay={400}>
                                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm dark:shadow-none">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-8">
                                        <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
                                        <span className="text-sm text-slate-700 dark:text-gray-300 font-medium"><ShinyText speed={2}
                                            color="#30af5b"
                                            shineColor="#000000" text="Available for work" /></span>
                                    </div>

                                    <div className="w-20 h-20 rounded-full overflow-hidden mb-6 border-2 border-slate-200 dark:border-white/10">
                                        <img
                                            src="https://ik.imagekit.io/pxc/mannavlakha/t-man-removebg.png?updatedAt=1755338197921"
                                            alt="Profile"
                                            className="w-full h-full object-cover bg-[#f0f0f0] dark:bg-[#1a1a1a]"
                                        />
                                    </div>

                                    <p className="text-slate-600 dark:text-gray-400 leading-relaxed mb-8">
                                        My inbox is always open. Whether you have a project or just want to say Hi. I would love to hear from you. Feel free to contact me and I'll get back to you.
                                    </p>

                                    <div className="flex items-center gap-6">
                                        <a href="https://www.linkedin.com/in/navlakhaman/" target="_blank" rel="noopener noreferrer" className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Linkedin size={20} /></a>
                                        <a href="https://github.com/man-navlakha" target="_blank" rel="noopener noreferrer" className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Github size={20} /></a>

                                        <a href="mailto:mannnavlakha1021@gmail.com" className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Mail size={20} /></a>
                                        {/* <a href="#" className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Twitter size={20} /></a> */}
                                    </div>
                                </div>
                            </RevealOnScroll>
                        </div>
                    </div>
                </section>

                {/* FAQs */}
                <section className="px-6 md:px-12 lg:px-24 py-24 bg-slate-50 dark:bg-[#0a0a0a]">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-16">
                        <RevealOnScroll>
                            <div>
                                <div className="flex items-center gap-2 text-brand text-sm font-medium tracking-widest mb-4">
                                    <ShinyText speed={2}
                                        color="#30af5b"
                                        shineColor="#000000" text="✦ FAQS" className=' text-xl' />
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Have Questions?</h2>
                            </div>
                        </RevealOnScroll>

                        <div className="lg:col-span-2 space-y-4">
                            <Accordion type="single" collapsible className="w-full space-y-4">
                                {faqs.map((faq, index) => (
                                    <RevealOnScroll key={index} delay={index * 100}>
                                        <AccordionItem value={`item-${index}`} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl px-6 shadow-sm dark:shadow-none">
                                            <AccordionTrigger className="text-lg font-medium hover:no-underline py-6 text-slate-900 dark:text-white">
                                                <span className="text-slate-500 dark:text-gray-500 mr-4">0{index + 1}.</span> {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-slate-600 dark:text-gray-400 pb-6 pl-12">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </RevealOnScroll>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

export default ContactClient;

