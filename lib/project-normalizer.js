const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
};

const firstLink = (value, fallback = "#") => {
  const links = toArray(value);
  return links[0] || fallback;
};

const extractYear = (value) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const match = value.match(/\b(19|20)\d{2}\b/);
    if (match) {
      return Number(match[0]);
    }
  }

  return new Date().getFullYear();
};

const firstSentence = (text) => {
  if (typeof text !== "string") {
    return "";
  }

  const cleaned = text.trim();
  if (!cleaned) {
    return "";
  }

  const [sentence] = cleaned.split(".");
  return sentence ? `${sentence.trim()}.` : "";
};

const normalizeTechStack = (item) => {
  if (Array.isArray(item.techStack)) {
    return item.techStack;
  }

  if (Array.isArray(item.tech_stack)) {
    return item.tech_stack.map((entry) => {
      if (typeof entry === "string") {
        return { name: entry, description: "" };
      }

      return {
        name: entry.name || "Technology",
        description: entry.description || "",
      };
    });
  }

  if (!isObject(item.technology_stack)) {
    return [];
  }

  const tech = [];
  for (const [group, values] of Object.entries(item.technology_stack)) {
    for (const value of toArray(values)) {
      tech.push({
        name: String(value),
        description: group.replace(/_/g, " "),
      });
    }
  }

  const seen = new Set();
  return tech.filter((entry) => {
    const key = entry.name.toLowerCase();
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export const normalizeProject = (item, index = 0) => {
  const projectLinks = toArray(
    item.project_url || item.live_link || item.liveLink || item.url || item.website
  );
  const repoLinks = toArray(item.repository_url || item.github_url || item.githubLink);
  const techStack = normalizeTechStack(item);
  const category = item.category || item.type || "General";
  const description = item.description || item.overview || item.solution || "";
  const overview =
    item.overview ||
    [item.problem_it_solves, item.solution].filter(Boolean).join(" ").trim() ||
    description;

  const tags = Array.from(
    new Set([
      ...toArray(item.tags),
      ...String(category)
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      ...techStack.slice(0, 3).map((tech) => tech.name),
    ])
  );

  return {
    id: String(item.id ?? index + 1),
    title: item.title || item.project_name || `Project ${index + 1}`,
    tagline: item.tagline || item.unique_value || firstSentence(description),
    description,
    overview,
    category: String(category),
    type: item.type || String(category),
    year: extractYear(item.year || item.date || item.created_at || item.createdAt),
    image: item.image || item.image_url || item.cover_image || item.cover || null,
    logo: item.logo || item.logo_url || null,
    color: item.color || "bg-slate-100 dark:bg-white/5",
    tags,
    features: toArray(item.features || item.key_features),
    techStack,
    teamMembers: toArray(item.teamMembers || item.team_members),
    designScreens: toArray(item.designScreens || item.design_screens),
    buildSteps: toArray(item.buildSteps || item.build_steps),
    relatedProjects: toArray(item.relatedProjects || item.related_projects).map(String),
    languagesDistribution: item.languagesDistribution || item.languages_distribution || {},
    githubStats: item.githubStats ||
      item.github_stats || {
        stars: 0,
        forks: 0,
        updatedAt: null,
      },
    lighthouse: {
      performance: Number(item.lighthouse_performance || item.lighthouse?.performance || 0),
      seo: Number(item.lighthouse_seo || item.lighthouse?.seo || 0),
      accessibility: Number(item.lighthouse_accessibility || item.lighthouse?.accessibility || 0),
      testCoverage: Number(item.test_coverage || item.lighthouse?.testCoverage || 0),
    },
    liveLink: firstLink(projectLinks),
    githubLink: firstLink(repoLinks),
    figma: item.figma || item.figma_url || "#",
    appLink: item.app_link || item.appLink || null,
    apiDocsLink: item.api_docs_link || item.apiDocsLink || null,
    status: item.status || "Active",
    roles: item.roles || item.role || "Full Stack Developer",
    client: item.client || item.business_context || "Personal Project",
    isFeatured: Boolean(item.is_featured ?? item.isFeatured ?? true),
    isLive: Boolean(item.is_live ?? item.isLive ?? projectLinks.length > 0),
    isWebAvailable: Boolean(item.is_web_available ?? item.isWebAvailable ?? projectLinks.length > 0),
    isAppAvailable: Boolean(item.is_app_available ?? item.isAppAvailable ?? (item.app_link || item.appLink)),
    isBackendByMe: Boolean(item.is_backend_by_me ?? item.isBackendByMe ?? true),
    hasFigma: Boolean(item.has_figma ?? item.hasFigma ?? item.figma),
    hasTeam: Boolean(item.has_team ?? item.hasTeam ?? toArray(item.teamMembers || item.team_members).length > 0),
  };
};

export const normalizeProjects = (projects) => {
  if (!Array.isArray(projects)) {
    return [];
  }

  return projects.map((project, index) => normalizeProject(project, index));
};
