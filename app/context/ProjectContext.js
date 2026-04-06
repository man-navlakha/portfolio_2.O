"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import projectsData from "../data/projects.json";
import { normalizeProjects } from "../../lib/project-normalizer";

const ProjectContext = createContext({
  projects: [],
  loading: false,
  error: null,
  getProjectById: () => null,
});

export function ProjectProvider({ children }) {
  const { projects, error } = useMemo(() => {
    try {
      return {
        projects: normalizeProjects(projectsData),
        error: null,
      };
    } catch (err) {
      console.error("Failed to load or parse projects.json", err);
      return {
        projects: [],
        error: "Failed to load projects data.",
      };
    }
  }, []);

  const getProjectById = useCallback(
    (id) => projects.find((project) => project.id === String(id)) || null,
    [projects]
  );

  const value = useMemo(
    () => ({
      projects,
      loading: false,
      error,
      getProjectById,
    }),
    [projects, error, getProjectById]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  return useContext(ProjectContext);
}
