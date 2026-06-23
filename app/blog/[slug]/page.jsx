import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Calendar, Clock } from "lucide-react";
import fs from "fs";
import path from "path";
import { BlogBlocks } from "../../../components/BlogBlocks";

// Helper: get blog index
function getBlogIndex() {
  try {
    const filePath = path.join(process.cwd(), "public", "Blog", "blog.json");
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

// Helper: get blog content
function getBlogContent(slug) {
  try {
    const filePath = path.join(process.cwd(), "public", "Blog", `${slug}.json`);
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

// 1. DYNAMIC METADATA FOR SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const allBlogs = getBlogIndex();
  const blogMeta = allBlogs.find((b) => b.slug === resolvedParams.slug);

  if (!blogMeta) {
    return { title: "Post Not Found", robots: { index: false } };
  }

  const meta = blogMeta.meta_details || {};

  return {
    title: blogMeta.title,
    description: blogMeta.short_description,
    keywords: meta.keywords || "",
    alternates: {
      canonical: meta.canonical_link || undefined,
    },
    robots: {
      index: blogMeta.index === "yes",
      follow: blogMeta.index === "yes",
    },
    openGraph: {
      title: `${blogMeta.title} | Man Navlakha`,
      description: blogMeta.short_description,
      type: meta.og_type || "article",
      publishedTime: blogMeta.date,
      images: blogMeta.img_link
        ? [{ url: blogMeta.img_link, width: 1200, height: 630, alt: blogMeta.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: blogMeta.title,
      description: blogMeta.short_description,
      images: blogMeta.img_link ? [blogMeta.img_link] : [],
    },
  };
}

// 2. STATIC PARAMS
export function generateStaticParams() {
  const allBlogs = getBlogIndex();
  return allBlogs.filter(b => b.status).map((blog) => ({ slug: blog.slug }));
}

// 3. PAGE COMPONENT
export default async function BlogPost({ params }) {
  const resolvedParams = await params;
  const allBlogs = getBlogIndex();
  const blogMeta = allBlogs.find((b) => b.slug === resolvedParams.slug);

  if (!blogMeta || !blogMeta.status) notFound();

  const blogContent = getBlogContent(resolvedParams.slug);
  if (!blogContent || !blogContent.blocks) notFound();

  // Get related posts (other active posts, excluding current)
  const relatedPosts = allBlogs
    .filter((b) => b.status === true && b.slug !== resolvedParams.slug)
    .slice(0, 3);

  // JSON-LD structured data for the article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blogMeta.title,
    description: blogMeta.short_description,
    image: blogMeta.img_link || undefined,
    datePublished: blogMeta.date,
    author: {
      "@type": "Person",
      name: "Man Navlakha",
      url: "https://man-navlakha.netlify.app/",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-brand selection:text-black pt-32">
        <article className="px-6 md:px-12 lg:px-24 pb-24">
          <div className="max-w-4xl mx-auto">

            {/* Back Link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 dark:text-gray-500 hover:text-brand transition-colors mb-12 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to all posts
            </Link>

            {/* Header */}
            <header className="mb-16">
              {/* Tags */}
              {blogMeta.tags && (
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  {blogMeta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold uppercase tracking-widest text-brand bg-brand/10 px-3 py-1.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.05] mb-8">
                {blogMeta.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 dark:text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <time dateTime={blogMeta.date}>
                    {new Date(blogMeta.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                {blogMeta.read_time && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{blogMeta.read_time}</span>
                  </div>
                )}
              </div>
            </header>

            {/* Hero Image */}
            {blogMeta.img_link && (
              <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden mb-16 bg-slate-100 dark:bg-white/5 shadow-2xl">
                <Image
                  src={blogMeta.img_link}
                  alt={blogMeta.title}
                  fill
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content Blocks */}
            <BlogBlocks blocks={blogContent.blocks} />

          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="px-6 md:px-12 lg:px-24 pb-24">
            <div className="max-w-7xl mx-auto">
              <div className="border-t border-slate-200 dark:border-white/10 pt-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-px w-8 bg-brand"></div>
                  <span className="text-brand text-xs font-bold uppercase tracking-[0.3em]">Keep Reading</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-16 text-slate-900 dark:text-white">
                  Related Posts
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {relatedPosts.map((post) => (
                    <Link href={`/blog/${post.slug}`} key={post.slug}>
                      <div className="group cursor-pointer">
                        {/* Image */}
                        {post.img_link && (
                          <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-white/5 shadow-lg transition-transform duration-700 group-hover:scale-[1.02] group-hover:-translate-y-1">
                            <Image
                              src={post.img_link}
                              alt={post.title}
                              fill
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute bottom-6 left-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                              <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 text-xs font-medium flex items-center gap-2">
                                Read <ArrowUpRight size={12} />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Content */}
                        <div className="mt-6 px-2">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags?.map((tag) => (
                              <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h3 className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-brand transition-colors duration-300 line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="mt-3 text-slate-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                            {post.short_description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
