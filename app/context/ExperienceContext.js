"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const ExperienceContext = createContext();

export function ExperienceProvider({ children }) {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/experience/" || "http://127.0.0.1:8000" + "/api/v1/experience/";

    const CACHE_KEY = "experience_cache_v1";
    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

    const formatExperienceData = (item) => ({
        id: String(item.id),
        role: item.role,
        company: item.company,
        period: item.period, // Format: 'Mar 2025 — Apr 2025'
        logo: item.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.company)}&background=random`,
        description: item.description || "",
        location: item.location || "",
        skills: item.skills || [],
        responsibilities: item.responsibilities || [],
        technologies: item.technologies || [],
        achievements: item.achievements || []
    });

    const getExperienceById = async (id) => {
        const CACHE_DETAIL_KEY = `experience_detail_${id}`;

        try {
            // 1. Try context state first
            const existing = experiences.find(e => e.id === String(id));
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"}/api/v1/experience/${id}/`);
            if (!response.ok) throw new Error("Experience not found");
            const data = await response.json();
            const formatted = formatExperienceData(data);

            // Save to cache
            localStorage.setItem(CACHE_DETAIL_KEY, JSON.stringify({
                data: formatted,
                timestamp: Date.now()
            }));

            return formatted;
        } catch (err) {
            console.error(`Error fetching experience ${id}:`, err);
            return null;
        }
    };

    useEffect(() => {
        async function fetchExperiences() {
            try {
                // Try to load from cache first
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const { data, timestamp } = JSON.parse(cachedData);
                    const isExpired = Date.now() - timestamp > CACHE_DURATION;

                    if (!isExpired) {
                        setExperiences(data);
                        setLoading(false);
                        return;
                    }
                }

                const response = await fetch(API_URL);
                if (!response.ok) throw new Error("Failed to fetch experiences");
                const data = await response.json();

                // Map the API data structure
                const formattedData = data.map(formatExperienceData);

                setExperiences(formattedData);

                // Save to cache
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: formattedData,
                    timestamp: Date.now()
                }));
            } catch (err) {
                console.error("Experience Fetch Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchExperiences();
    }, []);

    return (
        <ExperienceContext.Provider value={{ experiences, loading, error, getExperienceById }}>
            {children}
        </ExperienceContext.Provider>
    );
}

export const useExperience = () => {
    const context = useContext(ExperienceContext);
    if (!context) {
        throw new Error('useExperience must be used within an ExperienceProvider');
    }
    return context;
};
