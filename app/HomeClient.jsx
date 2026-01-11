"use client"
import React, { useState } from 'react';
import { ArrowUpRight, Github, Instagram, Linkedin, Mail, Star, ChevronDown } from 'lucide-react';
import RevealOnScroll from './Components/ui/RevealOnScroll'
import ShinyText from '../components/ShinyText'
import HoverText from './Components/ui/HoverText'
import AnimatedButton from './Components/ui/AnimatedButton'
import RevealText from './Components/ui/RevealText'
import CallToAction from './Components/CallToAction';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Scroll from './Components/Scroll';
import { useProjects } from '@/app/context/ProjectContext';
import Link from 'next/link';

export default function Home() {
  const { projects, loading } = useProjects();

  const displayProjects = projects.filter(p => p.isFeatured);

  const [activeExpertise, setActiveExpertise] = useState("item-1");

  const expertiseImages = {
    "item-1": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop", // Development
    "item-2": "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop", // UI/UX
    "item-3": "https://images.unsplash.com/photo-1626785774573-4b799314346d?q=80&w=1000&auto=format&fit=crop"  // Branding
  };
  return (
    <>
      <div className="min-h-screen text-pretty bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans selection:bg-brand selection:text-black">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-20">
          <div className="max-w-7xl mx-auto w-full">
            <RevealOnScroll>
              <div className="flex items-center gap-2 mb-6 animate-fade-in">
                <span className="text-2xl">👋</span>
                <ShinyText speed={2}
                  shineColor="#30af5b" text="Hey! It's me Man Navlakha." className='text-gray-500 font-medium text-xl' />
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={200}>
              <h1 className="text-5xl font-primary md:text-7xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-12 max-w-5xl text-slate-900 dark:text-white">
                Crafting <span className="text-brand">purpose driven</span> experiences that <span className="text-brand">inspire</span> & engage.
              </h1>
            </RevealOnScroll>

            <RevealOnScroll delay={400}>
              <div className="md:flex-center items-center justify-center mt-8 flex flex-col gap-4 md:flex-row">
                <div className="bg-gray-700/30 dark:bg-gray-700/30 h-[1px] w-full"></div>
                <p className="w-full text-pretty">
                  A frontend developer with a strong focus on creating responsive, user-friendly interfaces and smooth digital experiences.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={400}>
              <div className="flex flex-col md:flex-row justify-between items-end gap-12 mt-12">
                <div className="flex font-secondary gap-6 text-xs font-medium tracking-wider text-slate-900 dark:text-white">
                  <a href="https://www.linkedin.com/in/navlakhaman/" target="_blank" rel="noopener noreferrer" className=" flex items-center gap-1 hover:text-brand transition-colors"><HoverText>LINKEDIN</HoverText> <ArrowUpRight className="w-3 h-3" /></a>
                  <a href="https://github.com/man-navlakha" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-brand transition-colors"><HoverText>GITHUB</HoverText> <ArrowUpRight className="w-3 h-3" /></a>

                  <a href="mailto:mannnavlakha1021@gmail.com" className="flex items-center gap-1 hover:text-brand transition-colors"><HoverText>GMAIL</HoverText> <ArrowUpRight className="w-3 h-3" /></a>
                </div>

                <div className="max-w-md text-slate-600 dark:text-gray-400 text-lg leading-relaxed text-right md:text-left">

                </div>
                <Link href="/about">
                  <AnimatedButton
                    hoverColor="bg-slate-900 dark:bg-white"
                    hoverTextColor="group-hover:text-white dark:group-hover:text-black"
                  >Know me better
                  </AnimatedButton></Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>




        {/* About Section */}
        <section className="py-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <div className="flex items-center justify-center gap-2 text-brand text-sm font-medium tracking-widest mb-12">
                <ShinyText speed={2}
                  color="#30af5b"
                  shineColor="#000000ff" text="✦ ABOUT ME" className='text-brand text-xl' />

              </div>
            </RevealOnScroll>

            <>
              <RevealText
                text="I'm Man Navlakha, a passionate creative developer and digital designer. I specialize in building high-quality, impactful digital experiences that blend aesthetic design with robust engineering. I have extensive experience using React.js, which I used to build the entire career page for HarSar Innovations and the AI model for code review in the Solvinger project."
                className="text-3xl md:text-4xl lg:text-5xl font-medium leading-tight text-slate-800 dark:text-gray-200"
              />
            </>
          </div>
        </section>
        {/* Selected Projects */}
        <section className="py-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <div className="flex items-center gap-2 text-brand text-sm font-medium tracking-widest mb-4">
                <ShinyText speed={2}
                  color="#30af5b"
                  shineColor="#000000" text="✦ MY WORK" className=' text-xl' />
              </div>

              <h2 className="text-5xl md:text-6xl font-bold mb-4 text-slate-900 font-primary dark:text-white">Selected Projects</h2>
              <p className="text-slate-600 dark:text-gray-400 text-lg mb-16">Here's a curated selection showcasing my expertise and the achieved results.</p>
            </RevealOnScroll>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-16">
              {displayProjects.map((project, index) => (
                <RevealOnScroll key={index} delay={index * 100}>
                  <Link href={`/projects/${project.id}`}>
                    <div className="group cursor-pointer">
                      <div className={`aspect-[4/3] rounded-3xl overflow-hidden mb-6 ${project.color} relative`}>
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <h3 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">{project.title}</h3>
                          <p className="text-slate-600 dark:text-gray-400">{project.type}</p>
                        </div>
                        <span className="text-slate-500 dark:text-gray-500">{project.year}</span>
                      </div>
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll>
              <a href="/projects">
                <div className="flex justify-center mt-16">
                  <AnimatedButton
                    hoverColor="bg-slate-900 dark:bg-white"
                    hoverTextColor="group-hover:text-white dark:group-hover:text-black"
                  >
                    View All Projects
                  </AnimatedButton>
                </div>
              </a>
            </RevealOnScroll>
          </div>
        </section>
        {/* Expertise Section */}
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-slate-50 dark:bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <div className="flex items-center gap-2 text-brand text-sm font-medium tracking-widest mb-4">
                <ShinyText speed={2}
                  color="#30af5b"
                  shineColor="#000000" text="✦ SPECIALITY" className=' text-xl' />
              </div>

              <h2 className="text-5xl md:text-6xl font-bold mb-16 text-slate-900 dark:text-white">Areas of Expertise</h2>
            </RevealOnScroll>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <RevealOnScroll>
                <div className="space-y-4">
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    value={activeExpertise}
                    onValueChange={(val) => val && setActiveExpertise(val)}
                  >
                    <AccordionItem value="item-1" className="border-slate-200 dark:border-white/10">
                      <AccordionTrigger className="text-xl md:text-2xl py-6 text-slate-900 dark:text-white hover:text-brand hover:no-underline data-[state=open]:text-brand">
                        &lt;/&gt; Development
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 dark:text-gray-400 text-lg pb-6">
                        I build scalable, robust, and accessible web applications using modern technologies like React, Next.js, and Node.js. Focus on performance and clean code.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-slate-200 dark:border-white/10">
                      <AccordionTrigger className="text-xl md:text-2xl py-6 text-slate-900 dark:text-white hover:text-brand hover:no-underline data-[state=open]:text-brand">
                        🎨 UI/UX Design
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 dark:text-gray-400 text-lg pb-6">
                        Creating intuitive and visually stunning user interfaces that provide seamless user experiences. Proficient in Figma and prototyping.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-slate-200 dark:border-white/10">
                      <AccordionTrigger className="text-xl md:text-2xl py-6 text-slate-900 dark:text-white hover:text-brand hover:no-underline data-[state=open]:text-brand">
                        📐 Branding
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 dark:text-gray-400 text-lg pb-6">
                        Developing unique brand identities that resonate with your target audience. Logo design, typography, and color theory.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={200}>
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-900">
                  <img
                    key={activeExpertise}
                    src={expertiseImages[activeExpertise]}
                    alt="Expertise"
                    className="w-full h-full object-cover opacity-80 animate-fade-in transition-all duration-500"
                  />
                </div>
              </RevealOnScroll>
            </div>

            {/* Tech Stack Marquee */}
            <RevealOnScroll delay={300}>
              <Scroll />
            </RevealOnScroll>
          </div>
        </section>

      </div>
      <CallToAction />
    </>
  )
}


