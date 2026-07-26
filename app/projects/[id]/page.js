import { notFound } from "next/navigation";
import ProjectDetailClient from "./ProjectDetailClient";
import rawProjects from "../../data/projects.json";
import { normalizeProjects } from "../../../lib/project-normalizer";

const projects = normalizeProjects(rawProjects);

function getProject(id) {
  return projects.find((project) => project.id === String(id)) || null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = getProject(id);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  const summary =
    project.tagline ||
    project.description?.substring(0, 160) ||
    "Detailed project explanation and implementation overview.";
  const projectPath = `/projects/${project.id}`;

  return {
    title: `Project - ${project.title}`,
    description: summary,
    alternates: {
      canonical: projectPath,
    },
    openGraph: {
      title: `${project.title} | Man Navlakha`,
      description: summary,
      url: projectPath,
      images: project.image ? [{ url: project.image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: summary,
      images: project.image ? [project.image] : [],
    },
  };
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}

export default async function ProjectDetailPage({ params }) {
  const { id } = await params;
  const project = getProject(id);

  if (!project) {
    notFound();
  }

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
        name: "Projects",
        item: "https://man-navlakha.netlify.app/projects",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: `https://man-navlakha.netlify.app/projects/${project.id}`,
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
      <ProjectDetailClient project={project} />
    </>
  );
}
