
export const metadata = {
  title: "Projects",
  description: "A curated selection of web development projects by Man Navlakha — featuring React, Next.js, Node.js, and modern UI/UX implementations.",
};

export default function RootLayout({ children }) {
  return (
    <main className="min-h-screen">
      {children}
    </main>
  );
}
