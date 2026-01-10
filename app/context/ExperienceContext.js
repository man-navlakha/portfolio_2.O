"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const ExperienceContext = createContext();

export function ExperienceProvider({ children }) {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = "http://127.0.0.1:8000/api/v1/experience/";

    useEffect(() => {
        async function fetchExperiences() {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error("Failed to fetch experiences");
                const data = await response.json();

                // Map the API data structure
                const formattedData = data.map(item => ({
                    id: String(item.id),
                    role: item.role,
                    company: item.company,
                    period: item.period, // Format: 'Mar 2025 — Apr 2025'
                    logo: item.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.company)}&background=random`,
                    description: item.description || "",
                    location: item.location || "",
                    skills: item.skills || []
                }));

                setExperiences(formattedData);
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
        <ExperienceContext.Provider value={{ experiences, loading, error }}>
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
