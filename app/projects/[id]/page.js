import ProjectDetailClient from './ProjectDetailClient';
import { notFound } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

async function getProject(id) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/projects/${id}/`, {
      next: { revalidate: 600 } // Cache for 10 minutes
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  const tagline = project.description?.split('.')[0] + ".";

  return {
    title: project.title,
    description: tagline || project.description?.substring(0, 160),
    openGraph: {
      title: `${project.title} | Man Navlakha`,
      description: tagline || project.description?.substring(0, 160),
      images: project.main_image ? [{ url: project.main_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: tagline || project.description?.substring(0, 160),
      images: project.main_image ? [project.main_image] : [],
    },
  };
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/projects/`);
    if (!res.ok) return [];
    const projects = await res.json();
    return projects.map((project) => ({
      id: String(project.id),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function ProjectPage({ params }) {
  return <ProjectDetailClient params={params} />;
}
