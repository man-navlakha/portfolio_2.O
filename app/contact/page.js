import ContactClient from './ContactClient';

export const metadata = {
  title: "Contact",
  description: "Get in touch with Man Navlakha for collaborations, projects, or just to say hi. Available for full-time opportunities and freelance projects.",
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: "Contact Man Navlakha",
    description: "Let's start a project together. Reach out for collaborations or opportunities.",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
