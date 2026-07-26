export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/portal/', '/api/', '/private/'],
        },
        sitemap: 'https://man-navlakha.netlify.app/sitemap.xml',
    }
}
