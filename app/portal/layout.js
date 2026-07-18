import PortalLayoutClient from './PortalLayoutClient';

export const metadata = {
  title: {
    default: 'Client Portal',
    template: '%s | Client Portal',
  },
  description: 'Manage your projects, documents, and communicate with your developer.',
  robots: { index: false, follow: false }, // Don't index portal pages
};

export default function PortalLayout({ children }) {
  return <PortalLayoutClient>{children}</PortalLayoutClient>;
}
