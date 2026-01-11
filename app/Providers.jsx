"use client";
import React, { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { ProjectProvider } from "./context/ProjectContext";

import { ChatProvider } from "./context/ChatContext";
import { ExperienceProvider } from "./context/ExperienceContext";

export default function Providers({ children }) {
    useEffect(() => {
        // Check if theme is already set in localStorage
        const storedTheme = localStorage.getItem('theme');

        if (!storedTheme) {
            // Check device preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const defaultTheme = prefersDark ? 'dark' : 'light';

            // Save to localStorage
            localStorage.setItem('theme', defaultTheme);
        }
    }, []);

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ChatProvider>
                <ExperienceProvider>
                    <ProjectProvider>
                        {children}
                    </ProjectProvider>
                </ExperienceProvider>
            </ChatProvider>
        </ThemeProvider>
    );
}
