import LoginClient from './LoginClient';
import { Suspense } from 'react';

export const metadata = {
  title: 'Client Portal — Login',
  description: 'Log in to your client portal to view projects, documents, and chat.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050508] flex items-center justify-center">Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}
