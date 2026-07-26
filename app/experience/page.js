import ExperienceClient from './ExperienceClient';

export const metadata = {
  title: "Professional Experience",
  description: "Explore Man Navlakha's professional journey — roles, responsibilities, and technical contributions at companies like Excellent Publicity, HarSar Innovations, and more.",
  alternates: {
    canonical: '/experience',
  },
  openGraph: {
    title: "Professional Experience | Man Navlakha",
    description: "A timeline of professional growth, technical contributions, and the companies that shaped my journey as a Full Stack Developer.",
  },
};

export default function ExperiencePage() {
  return <ExperienceClient />;
}
