export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/private/',
        },
        sitemap: 'https://man-navlakha.netlify.app/sitemap.xml',
    }
}
