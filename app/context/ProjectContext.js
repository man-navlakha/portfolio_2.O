"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/projects/" || "http://127.0.0.1:8000" + "/api/v1/projects/";

    const CACHE_KEY = "projects_cache_v1";
    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

    const formatProjectData = (item) => ({
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
        figma: item.figma || "#",
        description: item.description,
        overview: item.overview || item.description,
        tags: item.tech_stack || [],
        techStack: (item.tech_stack || []).map(t => ({ name: t, description: `${t} technology` })),
        features: item.key_features || [],
        buildSteps: [], // Keep empty for now or map if API adds it
        designScreens: item.screenshots || [],
        teamMembers: item.team_members || [],
        status: item.status,
        order: item.order || 0,
        views: item.views || 0,
        languagesDistribution: item.languages_distribution,
        logo: item.logo,
        relatedProjects: item.related_projects || [],
        githubStats: {
            stars: item.github_stars || 0,
            forks: item.github_forks || 0,
            updatedAt: item.github_updated_at || ""
        },
        lighthouse: {
            performance: item.lighthouse_performance || 0,
            seo: item.lighthouse_seo || 0,
            accessibility: item.lighthouse_accessibility || 0,
            testCoverage: item.test_coverage || 0
        },
        appLink: item.app_link || null,
        apiDocsLink: item.api_docs_link || null,
        isFeatured: !!item.is_featured,
        isLive: !!item.is_live,
        isAppAvailable: !!item.is_app_available,
        isWebAvailable: !!item.is_web_available,
        isBackendByMe: !!item.is_backend_by_me,
        hasFigma: !!item.has_figma || !!item.figma,
        hasTeam: !!item.has_team,
    });

    const getProjectById = async (id) => {
        const CACHE_DETAIL_KEY = `project_detail_${id}`;

        try {
            // 1. Try context state first
            const existing = projects.find(p => p.id === String(id));
            if (existing) return existing;

            // 2. Try cache
            const cachedData = localStorage.getItem(CACHE_DETAIL_KEY);
            if (cachedData) {
                const { data, timestamp } = JSON.parse(cachedData);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    return data;
                }
            }

            // 3. Fetch from API
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"}/api/v1/projects/${id}/`);
            if (!response.ok) throw new Error("Project not found");
            const data = await response.json();
            const formatted = formatProjectData(data);

            // Save to cache
            localStorage.setItem(CACHE_DETAIL_KEY, JSON.stringify({
                data: formatted,
                timestamp: Date.now()
            }));

            // Optionally update projects list if it's not already there
            setProjects(prev => {
                if (prev.find(p => p.id === formatted.id)) return prev;
                return [...prev, formatted];
            });

            return formatted;
        } catch (err) {
            console.error(`Error fetching project ${id}:`, err);
            return null;
        }
    };

    useEffect(() => {
        async function fetchProjects() {
            try {
                // Try to load from cache first
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const { data, timestamp } = JSON.parse(cachedData);
                    const isExpired = Date.now() - timestamp > CACHE_DURATION;

                    if (!isExpired) {
                        setProjects(data);
                        setLoading(false);
                        return;
                    }
                }

                const response = await fetch(API_URL);
                if (!response.ok) throw new Error("Failed to fetch projects");
                const data = await response.json();

                // Map the API data structure to match our existing component's expected structure
                const formattedData = data.map(formatProjectData);

                setProjects(formattedData);

                // Save to cache
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: formattedData,
                    timestamp: Date.now()
                }));
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
        <ProjectContext.Provider value={{ projects, loading, error, getProjectById }}>
            {children}
        </ProjectContext.Provider>
    );
}

export const useProjects = () => useContext(ProjectContext);
