'use client';

import { usePathname } from 'next/navigation';

export default function MainSiteShell({ children }) {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith('/portal');

  // Don't render main site components (navbar, footer, chatbot, etc.) on portal pages
  if (isPortal) return null;

  return <>{children}</>;
}
