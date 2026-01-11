const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export default async function sitemap() {
    const baseUrl = 'https://mannavlakha.com';

    const routes = ['', '/about', '/projects', '/contact', '/experience'].map(
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

    return [...routes, ...projectRoutes];
}
