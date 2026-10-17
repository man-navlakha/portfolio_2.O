import React from 'react'
import Image from 'next/image';

// Using cdn.jsdelivr.net (jsDelivr) — battle-tested CDN fully accessible to Googlebot.
// cdn.simpleicons.org returned "Other error" for some icons during Googlebot crawl.
const SKILLS = [
  { name: "HTML",        src: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/html5.svg" },
  { name: "CSS",         src: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/css3.svg" },
  { name: "JavaScript",  src: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/javascript.svg" },
  { name: "TypeScript",  src: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/typescript.svg" },
  { name: "React.js",   src: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/react.svg" },
  { name: "Next.js",    src: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/nextdotjs.svg" },
  { name: "Node.js",    src: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/nodedotjs.svg" },
  { name: "Express.js", src: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/express.svg" },
  { name: "MySQL",       src: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/mysql.svg" },
  { name: "MongoDB",     src: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/mongodb.svg" },
  { name: "PostgreSQL",  src: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/postgresql.svg" },
  { name: "Figma",       src: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/figma.svg" },
  { name: "TailwindCSS", src: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/tailwindcss.svg" },
  { name: "Git",         src: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/git.svg" },
];

// Duplicate for seamless marquee loop
const SKILLS_MARQUEE = [...SKILLS, ...SKILLS];

const Scroll = () => {
  return (
    <div>
      {/* Modern, animated skills marquee */}
      <div className="mx-6 overflow-hidden font-primary h-[100px] py-2 items-center text-sm flex relative">
        {/* Left Gradient Fade */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-[20%] z-10 bg-gradient-to-r from-slate-50 dark:from-[#0a0a0a] to-transparent"></div>

        {/* Marquee */}
        <div className="flex w-max animate-marquee gap-8">
          {SKILLS_MARQUEE.map((skill, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 dark:border-white/10 px-6 py-2 text-sm shadow-sm dark:shadow-none bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white break-keep whitespace-pre transition-colors"
            >
              <div className="relative flex h-6 w-6 whitespace-pre">
                <Image
                  alt={skill.name}
                  sizes="40px"
                  loading="lazy"
                  decoding="async"
                  fill
                  unoptimized
                  // simple-icons SVGs are black by default — invert to white in dark mode
                  className="object-contain h-full w-full dark:invert transition-all duration-300"
                  src={skill.src}
                />
              </div>
              {skill.name}
            </div>
          ))}
        </div>

        {/* Right Gradient Fade */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-[20%] z-10 bg-gradient-to-l from-slate-50 dark:from-[#0a0a0a] to-transparent"></div>
      </div>
    </div>
  )
}

export default Scroll
