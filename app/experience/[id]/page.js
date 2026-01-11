import ExperienceDetailClient from './ExperienceDetailClient';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function generateMetadata({ params }) {
    const { id } = await params;

    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/experience/${id}/`);
        if (!response.ok) throw new Error();
        const exp = await response.json();

        return {
            title: `${exp.role} at ${exp.company} | Man Navlakha`,
            description: exp.description?.substring(0, 160),
        };
    } catch (error) {
        return {
            title: 'Work Experience | Man Navlakha',
        };
    }
}

export async function generateStaticParams() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/experience/`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        return data.map((exp) => ({
            id: String(exp.id),
        }));
    } catch (error) {
        return [];
    }
}

export default async function ExperiencePage({ params }) {
    return <ExperienceDetailClient params={params} />;
}
