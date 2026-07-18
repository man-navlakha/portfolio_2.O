import Footer from "./Components/Footer";
import Navbar from "./Components/Navbar";
import "./globals.css";
import ProgressBar from "./Components/ProgressBar";
import Providers from "./Providers";
import ChatBot from "@/components/ChatBot";
import CommandPalette from "./Components/CommandPalette";
import localFont from 'next/font/local';
import { Suspense } from 'react';
import ArrowGridBackground from './Components/ArrowGridBackground';
import MainSiteShell from './Components/MainSiteShell';

// Font files are expected in `app/fonts`
const satoshi = localFont({
  src: './fonts/867bce6efedfde96-s.p.ttf',
  display: 'swap',
  variable: '--font-satoshi',
});

const primary = localFont({
  src: './fonts/42cbe77eee9e7152-s.p.ttf',
  display: 'swap',
  variable: '--font-clash-display',
});

export const metadata = {
  title: {
    default: "Full Stack Developer | Node.js & React Expert",
    template: "%s | Full Stack Developer"
  },
  description:
    "Full-stack developer skilled in Node.js, React, and scalable system design. Building real-world applications and startup products.",
  keywords: [
    "Full stack developer",
    "Node.js developer",
    "React developer",
    "Ahmedabad developer",
    "IT support engineer",
  ],
  authors: [{ name: "Man Navlakha" }],
  creator: "Man Navlakha",
  publisher: "Man Navlakha",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://man-navlakha.netlify.app/'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    },
  },
  openGraph: {
    title: "Full Stack Developer | Node.js & React Expert",
    description:
      "Full-stack developer skilled in Node.js, React, and scalable system design. Building real-world applications and startup products.",
    url: 'https://man-navlakha.netlify.app/',
    siteName: 'Man Navlakha Portfolio',
    images: [
      {
        url: '/og-image.png', // You should create this image
        width: 1200,
        height: 630,
        alt: 'Man Navlakha Portfolio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Full Stack Developer | Node.js & React Expert",
    description:
      "Full-stack developer skilled in Node.js, React, and scalable system design. Building real-world applications and startup products.",
    creator: '@navlakha_man', // Assuming a handle or use name
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'android-chrome', url: '/android-chrome-192x192.png' },
    ],
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Man Navlakha',
    url: 'https://man-navlakha.netlify.app/',
    jobTitle: "MERN Stack Developer",
    sameAs: [
      'https://github.com/man-navlakha',
      'https://www.linkedin.com/in/navlakhaman/',
      'https://instagram.com/man_navlakha', // Example handle from context
    ],
    description: 'MERN Stack Developer and UI/UX Designer specialized in React and Next.js.',
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      </head>
      <body className={`${satoshi.variable} ${primary.variable} font-sans`} >
        <Providers>
          <MainSiteShell>
            <ArrowGridBackground />
            <Suspense fallback={null}>
              <ProgressBar />
            </Suspense>
            <Navbar />
          </MainSiteShell>
          {children}
          <MainSiteShell>
            <CommandPalette />
            <ChatBot />
            <Footer />
          </MainSiteShell>
        </Providers>
      </body>
    </html>
  );
}

