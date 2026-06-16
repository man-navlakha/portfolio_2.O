import fs from "fs";
import path from "path";
import BlogClient from "./BlogClient";

export const metadata = {
  title: "Blog",
  description: "Read my latest articles about web development, design, SEO, and software engineering.",
  openGraph: {
    title: "Blog | Man Navlakha",
    description: "Thoughts, learnings, and tutorials on web development and design.",
  },
};

export default async function BlogPage() {
  const blogIndexPath = path.join(process.cwd(), "public", "Blog", "blog.json");
  const rawData = fs.readFileSync(blogIndexPath, "utf-8");
  const blogs = JSON.parse(rawData);

  return <BlogClient blogs={blogs} />;
}
