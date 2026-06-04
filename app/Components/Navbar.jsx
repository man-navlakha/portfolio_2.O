"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Home, User, Grid, Send, Briefcase, Bot } from "lucide-react";
import { useChat } from "../context/ChatContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HoverText from "./ui/HoverText";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { toggleChat, isChatOpen } = useChat();

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Home", to: "/", icon: <Home size={20} /> },
    { name: "About", to: "/about", icon: <User size={20} /> },
    { name: "Projects", to: "/projects", icon: <Grid size={20} /> },
    { name: "Experience", to: "/experience", icon: <Briefcase size={20} /> },
  ];

  return (
    <>
      {/* Top Fade */}
      {/* <div className="fixed top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#f0f0f0a1] dark:from-[#0a0a0a] to-transparent pointer-events-none z-40" /> */}

      {/* Desktop Navbar */}
      <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${isScrolled ? "md:pt-4" : "pt-0"}`}>

        {/* Bottom Fade */}
        {/* <div className="fixed -bottom-20 left-0 right-0 h-40 bg-gradient-to-t from-[#f0f0f0a1] dark:from-[#0a0a0a] to-transparent pointer-events-none z-40" /> */}

        <header
          className={`
          transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isScrolled
              ? "w-[95%] md:w-[45rem] rounded-full bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 px-6 py-3 mt-2 shadow-lg dark:shadow-2xl"
              : "w-full md:w-[80%] bg-transparent px-6 md:px-12 py-6 border-b border-transparent"}
        `}
        >
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold tracking-wide font-primary text-slate-900 dark:text-white tracking-tighter z-10">
              MN
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const isActive = pathname === link.to;

                return (
                  <Link
                    key={link.name}
                    href={link.to}
                    className={`
                    relative px-4 py-2 text-sm font-medium transition-colors rounded-full group
                    ${isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"}
                  `}
                  >
                    {isActive && (
                      <span className="absolute left-0 tracking-wide top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand rounded-full -ml-2"></span>
                    )}
                    <HoverText className="">{link.name}</HoverText>
                  </Link>
                );
              })}
            </nav>

            {/* Utilities */}
            <div className="flex items-center gap-4 z-10">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-colors"
                >
                  {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                </button>
              )}
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 z-50 w-full max-w-lg md:hidden">
        <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md border-t border-slate-200 dark:border-white/10 rounded-t-xl shadow-lg dark:shadow-2xl px-4 py-4 flex justify-between items-center">
          {links.map((link) => {
            const isActive = pathname === link.to;

            return (
              <Link
                key={link.name}
                href={link.to}
                className={`
                  flex flex-col items-center gap-1 transition-colors
                  ${isActive ? "text-brand" : "text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300"}
                `}
              >
                {link.icon}
                <span className="text-[10px] font-medium">{link.name}</span>
              </Link>
            );
          })}
          {/* Chat Button for Mobile */}
          <button
            onClick={toggleChat}
            className={`
              flex flex-col items-center gap-1 transition-colors
              ${isChatOpen ? "text-brand" : "text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300"}
            `}
          >
            <Bot size={20} />
            <span className="text-[10px] font-medium">Chat</span>
          </button>
        </div>
      </div>
    </>
  );
}
