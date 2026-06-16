import rawProjects from "./data/projects.json";
import fs from "fs";
import path from "path";
import { normalizeProjects } from "../lib/project-normalizer";

const projects = normalizeProjects(rawProjects);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export default async function sitemap() {
    const baseUrl = 'https://man-navlakha.netlify.app/';

    const routes = ['', '/about', '/projects', '/contact', '/experience', '/blog'].map(
        (route) => ({
            url: `${baseUrl}${route}`,
            lastModified: new Date().toISOString().split('T')[0],
            changeFrequency: 'monthly',
            priority: route === '' ? 1 : 0.8,
        })
    );

    let projectRoutes = [];
    try {
        const res = await fetch(`${BACKEND_URL}/api/v1/projects/`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        if (res.ok) {
            const projects = await res.json();
            projectRoutes = projects.map((project) => ({
                url: `${baseUrl}/projects/${project.id}`,
                lastModified: new Date().toISOString().split('T')[0],
                changeFrequency: 'monthly',
                priority: 0.6,
            }));
        }
    } catch (error) {
        console.error("Error fetching projects for sitemap:", error);
    }

    // Read blogs index
    let blogRoutes = [];
    try {
        const blogIndexPath = path.join(process.cwd(), "public", "Blog", "blog.json");
        const rawBlogs = fs.readFileSync(blogIndexPath, "utf-8");
        const blogs = JSON.parse(rawBlogs);
        
        blogRoutes = blogs
            .filter(blog => blog.status === true && blog.index !== "no")
            .map((blog) => ({
                url: `${baseUrl}/blog/${blog.slug}`,
                lastModified: blog.date || new Date().toISOString().split('T')[0],
                changeFrequency: 'monthly',
                priority: 0.7,
            }));
    } catch (e) {
        console.error("Error reading blogs for sitemap:", e);
    }

    return [...routes, ...projectRoutes, ...blogRoutes];
}
