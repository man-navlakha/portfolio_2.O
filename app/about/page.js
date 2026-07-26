import AboutClient from './AboutClient';

export const metadata = {
  title: "About",
  description: "Learn more about Man Navlakha, a creative developer and digital designer specializing in building high-quality digital experiences.",
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: "About Man Navlakha",
    description: "Creative developer & digital designer crafting impactful digital experiences.",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
