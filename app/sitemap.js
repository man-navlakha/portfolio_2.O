import { projects } from './data/projects';

export default function sitemap() {
    const baseUrl = 'https://mannavlakha.com';

    const routes = ['', '/about', '/projects', '/contact', '/experience'].map(
        (route) => ({
            url: `${baseUrl}${route}`,
            lastModified: new Date().toISOString().split('T')[0],
            changeFrequency: 'monthly',
            priority: route === '' ? 1 : 0.8,
        })
    );

    const projectRoutes = projects.map((project) => ({
        url: `${baseUrl}/projects/${project.id}`,
        lastModified: new Date().toISOString().split('T')[0],
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [...routes, ...projectRoutes];
}
