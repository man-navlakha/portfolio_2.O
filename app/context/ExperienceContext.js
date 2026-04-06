"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import experienceData from "../data/experience.json";

const ExperienceContext = createContext({
  experiences: [],
  loading: false,
  error: null,
  getExperienceById: () => null,
});

const buildPeriod = (item) => {
  if (typeof item.period === "string" && item.period.trim()) {
    return item.period;
  }

  if (item.duration && typeof item.duration === "object") {
    const start = item.duration.start || "";
    const end = item.duration.end || "";
    const total = item.duration.total || "";
    const range = [start, end].filter(Boolean).join(" - ");
    return total ? `${range} (${total})` : range;
  }

  if (typeof item.date === "string") {
    return item.date;
  }

  return "";
};

const formatExperienceData = (item) => ({
  id: String(item.id),
  role: item.role || item.title || "",
  company: item.company || "",
  period: buildPeriod(item),
  logo: item.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.company || "Company")}&background=random`,
  description: item.description || item.summary || item.company_description || "",
  location: item.location || "",
  skills: Array.isArray(item.skills) ? item.skills : (Array.isArray(item.skills_gained) ? item.skills_gained : []),
  responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities : [],
  technologies: Array.isArray(item.technologies) ? item.technologies : (Array.isArray(item.skills_gained) ? item.skills_gained : []),
  achievements: Array.isArray(item.achievements) ? item.achievements : [],
});

export function ExperienceProvider({ children }) {
  const { experiences, error } = useMemo(() => {
    try {
      return {
        experiences: experienceData.map(formatExperienceData),
        error: null,
      };
    } catch (err) {
      console.error("Failed to load or parse experience.json", err);
      return {
        experiences: [],
        error: "Failed to load experience data.",
      };
    }
  }, []);

  const getExperienceById = useCallback(
    (id) => experiences.find((experience) => experience.id === String(id)) || null,
    [experiences]
  );

  const value = useMemo(
    () => ({
      experiences,
      loading: false,
      error,
      getExperienceById,
    }),
    [experiences, error, getExperienceById]
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperiences() {
  return useContext(ExperienceContext);
}

export function useExperience() {
  return useContext(ExperienceContext);
}
