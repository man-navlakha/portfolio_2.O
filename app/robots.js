export default function robots() {
    return {
        rules: [
            {
                // Allow all public pages to be crawled
                userAgent: '*',
                allow: '/',
                // Block private/API routes — /api/chat XHR is expected to be blocked
                disallow: ['/portal/', '/api/', '/private/'],
            },
        ],
        sitemap: 'https://man-navlakha.netlify.app/sitemap.xml',
    }
}
