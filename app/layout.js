import Footer from "./Components/Footer";
import Navbar from "./Components/Navbar";
import "./globals.css";
import ProgressBar from "./Components/ProgressBar";
import Providers from "./Providers";
import ChatBot from "@/components/ChatBot";
import CommandPalette from "./Components/CommandPalette";
import localFont from 'next/font/local';
import { Suspense } from 'react';

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
    default: "Man Navlakha | Full Stack Developer & Designer",
    template: "%s | Man Navlakha"
  },
  description: "Passionate full-stack developer and UI/UX designer crafting purpose-driven digital experiences with React, Next.js, and modern web technologies.",
  keywords: ["Man Navlakha", "Frontend Developer", "Full Stack Developer", "UI/UX Designer", "Portfolio", "React Developer", "Next.js", "Web Development"],
  authors: [{ name: "Man Navlakha" }],
  creator: "Man Navlakha",
  publisher: "Man Navlakha",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mannavlakha.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    },
  },
  openGraph: {
    title: "Man Navlakha | Full Stack Developer & Designer",
    description: "Crafting purpose-driven experiences that inspire & engage.",
    url: 'https://mannavlakha.com',
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
    title: "Man Navlakha | Full Stack Developer & Designer",
    description: "Crafting purpose-driven experiences that inspire & engage.",
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
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
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
    url: 'https://mannavlakha.com',
    jobTitle: 'Full Stack Developer',
    sameAs: [
      'https://github.com/man-navlakha',
      'https://www.linkedin.com/in/navlakhaman/',
      'https://instagram.com/man_navlakha', // Example handle from context
    ],
    description: 'Full Stack Developer and UI/UX Designer specialized in React and Next.js.',
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${satoshi.variable} ${primary.variable} font-sans`} >
        <Providers>
          <Suspense fallback={null}>
            <ProgressBar />
          </Suspense>
          <Navbar />
          {children}
          <CommandPalette />
          <ChatBot />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
