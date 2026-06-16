import fs from "fs";
import path from "path";
import HomeClient from './HomeClient';

export const metadata = {
  title: "Full Stack Developer | Node.js & React Expert",
  description:
    "Full-stack developer skilled in Node.js, React, and scalable system design. Building real-world applications and startup products.",
  keywords: [
    "Full stack developer",
    "Node.js developer",
    "React developer",
    "Ahmedabad developer",
    "IT support engineer"
  ],
};

function getTopBlogs() {
  try {
    const filePath = path.join(process.cwd(), "public", "Blog", "blog.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const blogs = JSON.parse(rawData);
    
    // Filter active and index !== no, then sort by date descending, then take top 2
    return blogs
      .filter(b => b.status === true && b.index !== "no")
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 2);
  } catch (e) {
    console.error("Failed to load top blogs for home page:", e);
    return [];
  }
}

export default function Home() {
  const topBlogs = getTopBlogs();
  return <HomeClient topBlogs={topBlogs} />;
}
