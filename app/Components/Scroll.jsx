import React from 'react'
import Image from 'next/image';

// Using cdn.simpleicons.org — a public CDN with no robots.txt crawler restrictions,
// replacing devrajchatribin.com whose robots.txt blocked Googlebot from loading icons.
const SKILLS = [
  { name: "HTML",        src: "https://cdn.simpleicons.org/html5/E34F26" },
  { name: "CSS",         src: "https://cdn.simpleicons.org/css3/1572B6" },
  { name: "JavaScript",  src: "https://cdn.simpleicons.org/javascript/F7DF1E" },
  { name: "TypeScript",  src: "https://cdn.simpleicons.org/typescript/3178C6" },
  { name: "React.js",   src: "https://cdn.simpleicons.org/react/61DAFB" },
  { name: "Next.js",    src: "https://cdn.simpleicons.org/nextdotjs/000000/ffffff" },
  { name: "Node.js",    src: "https://cdn.simpleicons.org/nodedotjs/339933" },
  { name: "Express.js", src: "https://cdn.simpleicons.org/express/000000/ffffff" },
  { name: "MySQL",       src: "https://cdn.simpleicons.org/mysql/4479A1" },
  { name: "MongoDB",     src: "https://cdn.simpleicons.org/mongodb/47A248" },
  { name: "PostgreSQL",  src: "https://cdn.simpleicons.org/postgresql/4169E1" },
  { name: "Figma",       src: "https://cdn.simpleicons.org/figma/F24E1E" },
  { name: "TailwindCSS", src: "https://cdn.simpleicons.org/tailwindcss/06B6D4" },
  { name: "Git",         src: "https://cdn.simpleicons.org/git/F05032" },
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
                  className="object-contain h-full w-full"
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
