"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL =  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000" + "/api/v1/projects/";

    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error("Failed to fetch projects");
                const data = await response.json();

                // Map the API data structure to match our existing component's expected structure
                const formattedData = data.map(item => ({
                    id: String(item.id),
                    title: item.title,
                    tagline: item.description?.split('.')[0] + ".", // First sentence as tagline
                    type: item.category || "Web App",
                    year: item.date || "",
                    image: item.main_image || item.screenshots?.[0] || "",
                    color: "bg-brand/10",
                    category: item.category || "Development",
                    roles: item.role || "Developer",
                    client: item.built_during ? (item.built_during.charAt(0).toUpperCase() + item.built_during.slice(1)) : "Personal",
                    liveLink: item.website || "#",
                    githubLink: item.github || "#",
                    description: item.description,
                    overview: item.description,
                    tags: item.tech_stack || [],
                    techStack: (item.tech_stack || []).map(t => ({ name: t, description: `${t} technology` })),
                    features: item.key_features || [],
                    buildSteps: [], // Keep empty for now or map if API adds it
                    designScreens: item.screenshots || [],
                    teamMembers: item.team_members || [],
                    status: item.status,
                    languagesDistribution: item.languages_distribution,
                    logo: item.logo,
                    relatedProjects: item.related_projects || [],
                    githubStats: {
                        stars: item.github_stars || 0,
                        forks: item.github_forks || 0,
                        updatedAt: item.github_updated_at || ""
                    },
                    category: item.category || "Web App",
                    isFeatured: !!item.is_featured,
                    isLive: !!item.is_live,
                    hasFigma: !!item.has_figma,
                    isBackendByMe: !!item.is_backend_by_me,
                }));

                setProjects(formattedData);
            } catch (err) {
                console.error("Project Fetch Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, []);

    return (
        <ProjectContext.Provider value={{ projects, loading, error }}>
            {children}
        </ProjectContext.Provider>
    );
}

export const useProjects = () => useContext(ProjectContext);
