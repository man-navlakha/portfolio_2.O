"use client";
import React from 'react';
import { useExperience } from '../context/ExperienceContext';
import RevealOnScroll from '../Components/ui/RevealOnScroll';
import { Loader2 } from 'lucide-react';

const ExperiencePage = () => {
  const { experiences, loading, error } = useExperience();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <RevealOnScroll>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-slate-900 dark:text-white">Experience</h1>
          <p className="text-slate-600 dark:text-gray-400 text-lg mb-16 max-w-2xl">
            My professional journey involves working with innovative companies and contributing to impactful projects.
          </p>
        </RevealOnScroll>

        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <RevealOnScroll key={exp.id} delay={index * 100}>
              <div className="group relative pl-8 md:pl-0">
                {/* Timeline Line */}
                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-slate-200 dark:bg-white/10 md:hidden"></div>

                <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12">
                  {/* Date Column */}
                  <div className="md:w-1/4 pt-1">
                    <span className="text-sm font-medium text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                      {exp.period}
                    </span>
                  </div>

                  {/* Content Column */}
                  <div className="md:w-3/4 pb-12 border-b border-slate-200 dark:border-white/10 last:border-0">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-2">
                        <img src={exp.logo} alt={exp.company} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors">
                          {exp.role}
                        </h3>
                        <p className="text-brand font-medium">{exp.company}</p>
                      </div>
                    </div>

                    {exp.description && (
                      <p className="text-slate-600 dark:text-gray-400 leading-relaxed mb-6">
                        {exp.description}
                      </p>
                    )}

                    {exp.skills && exp.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {exp.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 rounded-full border border-slate-200 dark:border-white/10"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperiencePage;
