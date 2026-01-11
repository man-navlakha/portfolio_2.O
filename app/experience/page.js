"use client";
import React from 'react';
import Link from 'next/link';
import { Loader2, ChevronRight } from 'lucide-react';
import { useExperience } from '../context/ExperienceContext';
import RevealOnScroll from '../Components/ui/RevealOnScroll';

const ExperiencePage = () => {
  const { experiences, loading, error } = useExperience();
  const [hoveredLogo, setHoveredLogo] = React.useState(null);

  React.useEffect(() => {
    if (experiences.length > 0 && !hoveredLogo) {
      setHoveredLogo(experiences[0].logo);
    }
  }, [experiences]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Dynamic Background Watermark */}
      <div className="absolute -left-20 top-60 opacity-[0.02] dark:opacity-[0.04] pointer-events-none select-none rotate-12 hidden lg:block transition-all duration-1000">
        {hoveredLogo && (
          <img key={hoveredLogo} src={hoveredLogo} alt="" className="w-[600px] h-[600px] object-contain grayscale animate-fade-in" />
        )}
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <RevealOnScroll>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-brand"></div>
            <span className="text-brand text-xs font-bold uppercase tracking-[0.3em]">Career Path</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white">Experience</h1>
          <p className="text-slate-600 dark:text-gray-400 text-lg md:text-xl mb-24 max-w-2xl font-medium">
            A timeline of my professional growth, technical contributions, and the companies that shaped my journey.
          </p>
        </RevealOnScroll>

        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <RevealOnScroll key={exp.id} delay={index * 100}>
              <Link
                href={`/experience/${exp.id}`}
                className="block group"
                onMouseEnter={() => setHoveredLogo(exp.logo)}
              >
                <div className="relative pl-8 md:pl-0 p-8 md:p-12 rounded-[2.5rem] hover:bg-white dark:hover:bg-white/[0.02] border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all duration-500 shadow-none hover:shadow-2xl dark:hover:shadow-none">
                  {/* Timeline Line (Mobile) */}
                  <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-slate-200 dark:bg-white/10 md:hidden"></div>

                  <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
                    {/* Much Bigger Logo Column */}
                    <div className="md:w-1/4 shrink-0">
                      <div className="w-24 h-24 md:w-40 md:h-40 rounded-[2rem] overflow-hidden bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-4 md:p-8 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-500 group-hover:shadow-xl">
                        <img src={exp.logo} alt={exp.company} className="w-full h-full object-contain" />
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="md:w-3/4">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                          <span className="text-sm font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-2">
                            {exp.period}
                          </span>
                          <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-brand transition-colors">
                            {exp.role}
                          </h3>
                          <p className="text-slate-500 dark:text-gray-400 font-bold text-xl md:text-2xl">{exp.company}</p>
                        </div>
                        <div className="p-4 rounded-full bg-slate-50 dark:bg-white/5 text-slate-300 group-hover:bg-brand/10 group-hover:text-brand transition-all -rotate-45 group-hover:rotate-0 hidden sm:flex">
                          <ChevronRight size={24} />
                        </div>
                      </div>

                      {exp.description && (
                        <p className="text-slate-600 dark:text-gray-400 leading-relaxed mb-8 font-medium line-clamp-2 text-lg">
                          {exp.description}
                        </p>
                      )}

                      {exp.skills && exp.skills.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {exp.skills.slice(0, 6).map((skill) => (
                            <span
                              key={skill}
                              className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 rounded-xl border border-transparent group-hover:border-brand/20 transition-all font-mono"
                            >
                              {skill}
                            </span>
                          ))}
                          {exp.skills.length > 6 && (
                            <span className="px-3 py-1.5 text-xs font-bold text-slate-400">+ {exp.skills.length - 6} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperiencePage;
