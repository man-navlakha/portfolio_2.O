import AboutClient from './AboutClient';

const BASE_URL = 'https://man-navlakha.netlify.app';

export const metadata = {
  title: "About Man Navlakha | MERN Stack Developer & UI/UX Designer",
  description:
    "Learn about Man Navlakha — a MERN stack developer and UI/UX designer from Ahmedabad, India. Specializing in React, Next.js, Node.js and building high-quality digital experiences.",
  keywords: [
    "Man Navlakha",
    "MERN stack developer",
    "React developer Ahmedabad",
    "Next.js developer India",
    "UI UX designer",
    "Full stack developer",
  ],
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  openGraph: {
    title: "About Man Navlakha | MERN Stack Developer & UI/UX Designer",
    description:
      "MERN stack developer and UI/UX designer from Ahmedabad, India — crafting impactful and high-quality digital experiences.",
    url: `${BASE_URL}/about`,
    siteName: "Man Navlakha Portfolio",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Man Navlakha — MERN Stack Developer",
      },
    ],
    locale: "en_US",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Man Navlakha | MERN Stack Developer",
    description:
      "MERN stack developer and UI/UX designer from Ahmedabad — crafting impactful digital experiences.",
    images: [`${BASE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function AboutPage() {
  // Server-side JSON-LD structured data — visible to Googlebot before JS hydration
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${BASE_URL}/about#webpage`,
        url: `${BASE_URL}/about`,
        name: "About Man Navlakha",
        description:
          "Learn about Man Navlakha — a MERN stack developer and UI/UX designer from Ahmedabad, India.",
        isPartOf: { "@id": `${BASE_URL}/#website` },
        about: { "@id": `${BASE_URL}/#person` },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
            { "@type": "ListItem", position: 2, name: "About", item: `${BASE_URL}/about` },
          ],
        },
      },
      {
        "@type": "Person",
        "@id": `${BASE_URL}/#person`,
        name: "Man Navlakha",
        url: BASE_URL,
        jobTitle: "MERN Stack Developer & UI/UX Designer",
        worksFor: {
          "@type": "Organization",
          name: "Freelance",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Ahmedabad",
          addressRegion: "Gujarat",
          addressCountry: "IN",
        },
        knowsAbout: [
          "React.js", "Next.js", "Node.js", "MongoDB", "Express.js",
          "TypeScript", "PostgreSQL", "UI/UX Design", "Figma",
        ],
        sameAs: [
          "https://github.com/man-navlakha",
          "https://www.linkedin.com/in/navlakhaman/",
          "https://instagram.com/man_navlakha",
        ],
      },
    ],
  };

  return (
    <>
      <script
        id="about-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <AboutClient />
    </>
  );
}

