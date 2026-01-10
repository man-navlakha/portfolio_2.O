"use client";

import { ThemeProvider } from "next-themes";
import { ProjectProvider } from "./context/ProjectContext";

import { ChatProvider } from "./context/ChatContext";
import { ExperienceProvider } from "./context/ExperienceContext";

export default function Providers({ children }) {
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
