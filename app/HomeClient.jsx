"use client"
import React, { useState } from 'react';
import { ArrowUpRight, MapPin, CheckCircle2, Building2, Clock } from 'lucide-react';
import RevealOnScroll from './Components/ui/RevealOnScroll'
import ShinyText from '../components/ShinyText'
import HoverText from './Components/ui/HoverText'
import AnimatedButton from './Components/ui/AnimatedButton'
import RevealText from './Components/ui/RevealText'
import CallToAction from './Components/CallToAction';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Scroll from './Components/Scroll';
import { useProjects } from '@/app/context/ProjectContext';
import { useExperience } from '@/app/context/ExperienceContext';
import Link from 'next/link';
import Image from 'next/image';

export default function Home({ topBlogs = [] }) {
  const { projects, loading } = useProjects();
  const { experiences } = useExperience();

  const displayProjects = projects.filter(p => p.isFeatured).slice(0, 4);
  const currentExperience = experiences && experiences.length > 0 ? experiences[0] : null;

  const [activeExpertise, setActiveExpertise] = useState("item-1");

  const expertiseImages = {
    "item-1": "/project/portfolio.png",
    "item-2": "/project/pixel.png",
    "item-3": "/project/seo.png",
  };
  return (
    <>
      <div className="min-h-screen text-pretty bg-transparent text-slate-900 dark:text-white font-sans selection:bg-brand selection:text-black">
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
                  A MERN stack developer with a strong focus on creating responsive, user-friendly interfaces and smooth digital experiences.
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

        {/* Currently Working Experience */}
        {currentExperience && (
          <section className="py-24 px-6 md:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto">
              <RevealOnScroll>
                <div className="flex items-center gap-2 text-brand text-sm font-medium tracking-widest mb-4">
                  <ShinyText speed={2} color="#30af5b" shineColor="#000000" text="✦ CURRENT EXPERIENCE" className=' text-xl' />
                </div>
                <h2 className="text-5xl md:text-6xl font-bold mb-16 text-slate-900 font-primary dark:text-white">Currently Working</h2>
              </RevealOnScroll>

              <div className="relative z-10 w-full mb-12">
                <RevealOnScroll delay={200}>
                  <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-14 border-b border-slate-200 dark:border-white/10 pb-16 pt-6">
                    <div className="w-32 h-32 md:w-52 md:h-52 rounded-[2.5rem] overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 md:p-10 shrink-0 flex items-center justify-center shadow-2xl group/logo hover:scale-105 transition-transform duration-500">
                      <Image src={currentExperience.logo} alt={currentExperience.company} width={128} height={128} className="w-full h-full object-contain group-hover/logo:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-widest">
                        <Clock size={12} /> {currentExperience.period || 'Ongoing'}
                      </div>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                        {currentExperience.role}
                      </h1>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 dark:text-gray-400 font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 size={18} className="text-brand" />
                          <span className="text-xl">{currentExperience.company}</span>
                        </div>
                        {currentExperience.location && (
                          <div className="flex items-center gap-2">
                            <MapPin size={18} />
                            <span>{currentExperience.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>

                <div className="mt-12">
                  <RevealOnScroll>
                    <section className="space-y-8 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-8 md:p-10 rounded-[2.5rem]">
                      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" size={24} />
                        Key Responsibilities
                      </h2>
                      <ul className="space-y-4">
                        {currentExperience.responsibilities?.slice(0, 4).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-4 group">
                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-brand shrink-0 group-hover:scale-150 transition-transform" />
                            <span className="text-slate-700 dark:text-gray-300 leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-6 flex justify-start items-center gap-4">
                        <Link href="/experience">
                          <AnimatedButton
                            hoverColor="bg-slate-900 dark:bg-white"
                            hoverTextColor="group-hover:text-white dark:group-hover:text-black"
                          >
                            Show All Experience
                          </AnimatedButton>
                        </Link>
                        <Link href={`/experience/${currentExperience.id}`} className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand transition-colors ml-4 cursor-pointer">
                          <span>View Details</span>
                          <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                      </div>
                    </section>
                  </RevealOnScroll>
                </div>
              </div>
            </div>
          </section>
        )}

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
              <p className="text-slate-600 dark:text-gray-400 text-lg mb-16">Here&apos;s a curated selection showcasing my expertise and the achieved results.</p>
            </RevealOnScroll>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-16">
              {displayProjects.map((project, index) => (
                <RevealOnScroll key={index} delay={index * 100}>
                  <Link href={`/projects/${project.id}`}>
                    <div className="group cursor-pointer">
                      <div className={`aspect-[4/3] rounded-3xl overflow-hidden mb-6 ${project.color} relative`}>
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
              <Link href="/projects">
                <div className="flex justify-center mt-16">
                  <AnimatedButton
                    hoverColor="bg-slate-900 dark:bg-white"
                    hoverTextColor="group-hover:text-white dark:group-hover:text-black"
                  >
                    View All Projects
                  </AnimatedButton>
                </div>
              </Link>
            </RevealOnScroll>
          </div>
        </section>
        {/* Expertise Section */}
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-transparent">
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
                  <Image
                    key={activeExpertise}
                    src={expertiseImages[activeExpertise]}
                    alt="Expertise"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
        {/* Latest Articles Section */}
        {topBlogs && topBlogs.length > 0 && (
          <section className="py-24 px-6 md:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto">
              <RevealOnScroll>
                <div className="flex items-center gap-2 text-brand text-sm font-medium tracking-widest mb-4">
                  <ShinyText speed={2}
                    color="#30af5b"
                    shineColor="#000000" text="✦ WRITINGS" className=' text-xl' />
                </div>
                <h2 className="text-5xl md:text-6xl font-bold mb-4 text-slate-900 font-primary dark:text-white">Latest Articles</h2>
                <p className="text-slate-600 dark:text-gray-400 text-lg mb-16">Thoughts, learnings, and tutorials on web development.</p>
              </RevealOnScroll>

              <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
                {topBlogs.map((blog, index) => (
                  <RevealOnScroll key={blog.slug} delay={index * 100}>
                    <Link href={`/blog/${blog.slug}`}>
                      <div className="group relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
                        {blog.img_link && (
                          <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-white/5 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02] group-hover:-translate-y-2">
                            <Image
                              src={blog.img_link}
                              alt={blog.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute bottom-8 left-8 flex gap-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                              <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 text-sm font-medium flex items-center gap-2">
                                Read Article <ArrowUpRight size={14} />
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="mt-8 px-4">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-wrap gap-2">
                              {blog.tags?.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                              {blog.read_time && (
                                <span className="flex items-center gap-1">
                                  <Clock size={12} /> {blog.read_time}
                                </span>
                              )}
                            </div>
                          </div>
                          <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-brand transition-colors duration-300 line-clamp-2">
                            {blog.title}
                          </h3>
                          <p className="mt-4 text-slate-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                            {blog.short_description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </RevealOnScroll>
                ))}
              </div>

              <RevealOnScroll>
                <div className="flex justify-center mt-16">
                  <Link href="/blog">
                    <AnimatedButton
                      hoverColor="bg-slate-900 dark:bg-white"
                      hoverTextColor="group-hover:text-white dark:group-hover:text-black"
                    >
                      Read All Articles
                    </AnimatedButton>
                  </Link>
                </div>
              </RevealOnScroll>
            </div>
          </section>
        )}

      </div>
      <CallToAction />
    </>
  )
}

