import ProjectsClient from './ProjectsClient';

export const metadata = {
  title: "Projects",
  description: "A curation of my best work in web development and design. Showcasing expertise in React, Next.js, and modern UI/UX principles.",
  openGraph: {
    title: "Projects | Man Navlakha",
    description: "Explore my latest projects and digital creations.",
  },
};

export default function ProjectsPage() {
  return <ProjectsClient />;
}