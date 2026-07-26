import rawProjects from "./data/projects.json";
import experienceData from "./data/experience.json";
import fs from "fs";
import path from "path";
import { normalizeProjects } from "../lib/project-normalizer";

const projects = normalizeProjects(rawProjects);

const BASE_URL = "https://man-navlakha.netlify.app";

export default async function sitemap() {
    const today = new Date().toISOString().split("T")[0];

    // ── Core pages ──────────────────────────────────────────────────────
    const coreRoutes = [
        { url: BASE_URL, priority: 1.0, changeFrequency: "weekly" },
        { url: `${BASE_URL}/about`, priority: 0.8, changeFrequency: "monthly" },
        { url: `${BASE_URL}/projects`, priority: 0.8, changeFrequency: "weekly" },
        { url: `${BASE_URL}/experience`, priority: 0.8, changeFrequency: "monthly" },
        { url: `${BASE_URL}/blog`, priority: 0.8, changeFrequency: "weekly" },
        { url: `${BASE_URL}/contact`, priority: 0.7, changeFrequency: "monthly" },
        { url: `${BASE_URL}/lab`, priority: 0.6, changeFrequency: "monthly" },
    ].map((route) => ({ ...route, lastModified: today }));

    // ── Project detail pages ────────────────────────────────────────────
    const projectRoutes = projects.map((project) => ({
        url: `${BASE_URL}/projects/${project.id}`,
        lastModified: today,
        changeFrequency: "monthly",
        priority: 0.6,
    }));

    // ── Experience detail pages ─────────────────────────────────────────
    const experienceRoutes = experienceData.map((exp) => ({
        url: `${BASE_URL}/experience/${exp.id}`,
        lastModified: today,
        changeFrequency: "monthly",
        priority: 0.6,
    }));

    // ── Blog posts ──────────────────────────────────────────────────────
    let blogRoutes = [];
    try {
        const blogIndexPath = path.join(process.cwd(), "public", "Blog", "blog.json");
        const rawBlogs = fs.readFileSync(blogIndexPath, "utf-8");
        const blogs = JSON.parse(rawBlogs);

        blogRoutes = blogs
            .filter((blog) => blog.status === true && blog.index !== "no")
            .map((blog) => ({
                url: `${BASE_URL}/blog/${blog.slug}`,
                lastModified: blog.updated_date || blog.date || today,
                changeFrequency: "weekly",
                priority: 0.7,
            }));
    } catch (e) {
        console.error("Error reading blogs for sitemap:", e);
    }

    return [...coreRoutes, ...projectRoutes, ...experienceRoutes, ...blogRoutes];
}
