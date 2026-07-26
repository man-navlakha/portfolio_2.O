import ExperienceDetailClient from './ExperienceDetailClient';
import experienceData from '../../data/experience.json';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

function findExperience(id) {
    return experienceData.find((item) => String(item.id) === String(id)) || null;
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const localExp = findExperience(id);

    if (localExp) {
        const summary =
            localExp.description?.substring(0, 160) ||
            localExp.summary?.substring(0, 160) ||
            localExp.company_description?.substring(0, 160) ||
            "Detailed professional experience, responsibilities, and outcomes.";
        const pagePath = `/experience/${id}`;

        return {
            title: `Experience - ${localExp.role} at ${localExp.company}`,
            description: summary,
            alternates: {
                canonical: pagePath,
            },
            openGraph: {
                title: `${localExp.role} at ${localExp.company} | Man Navlakha`,
                description: summary,
                url: pagePath,
                type: "article",
            },
            twitter: {
                card: "summary_large_image",
                title: `${localExp.role} at ${localExp.company}`,
                description: summary,
            },
        };
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/experience/${id}/`);
        if (!response.ok) throw new Error();
        const exp = await response.json();

        const summary =
            exp.description?.substring(0, 160) ||
            "Detailed professional experience, responsibilities, and outcomes.";
        const pagePath = `/experience/${id}`;

        return {
            title: `Experience - ${exp.role} at ${exp.company}`,
            description: summary,
            alternates: {
                canonical: pagePath,
            },
            openGraph: {
                title: `${exp.role} at ${exp.company} | Man Navlakha`,
                description: summary,
                url: pagePath,
                type: "article",
            },
            twitter: {
                card: "summary_large_image",
                title: `${exp.role} at ${exp.company}`,
                description: summary,
            },
        };
    } catch (error) {
        return {
            title: 'Work Experience | Man Navlakha',
            description: "Detailed professional experience and role breakdown.",
        };
    }
}

export async function generateStaticParams() {
    return experienceData.map((exp) => ({
        id: String(exp.id),
    }));
}

export default async function ExperiencePage({ params }) {
    const { id } = await params;
    const localExp = findExperience(id);

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://man-navlakha.netlify.app",
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Experience",
                item: "https://man-navlakha.netlify.app/experience",
            },
            {
                "@type": "ListItem",
                position: 3,
                name: localExp ? `${localExp.role} at ${localExp.company}` : "Experience Detail",
                item: `https://man-navlakha.netlify.app/experience/${id}`,
            },
        ],
    };

    return (
        <>
            <script
                id="json-ld-breadcrumb"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, '\\u003c') }}
            />
            <ExperienceDetailClient id={id} />
        </>
    );
}
