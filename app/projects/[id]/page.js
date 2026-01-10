import { projects } from '@/app/data/projects';
import ProjectDetailClient from './ProjectDetailClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: project.title,
    description: project.tagline || project.description?.substring(0, 160),
    openGraph: {
      title: `${project.title} | Man Navlakha`,
      description: project.tagline || project.description?.substring(0, 160),
      images: project.image ? [{ url: project.image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.tagline || project.description?.substring(0, 160),
      images: project.image ? [project.image] : [],
    },
  };
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}

export default async function ProjectPage({ params }) {
  const resolvedParams = await params;
  const project = projects.find((p) => p.id === resolvedParams.id);

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient params={params} />;
}
