# Next.js Block-Based JSON Blog System

Welcome to the **Block-Based JSON Blog System**! This system is a powerful, markdown-free blogging engine integrated directly into your Next.js portfolio. It allows you to write, manage, and design rich articles using structured JSON files.

Instead of writing standard Markdown (which limits layout control), this system uses a **JSON-based block architecture** that enables beautiful custom components (such as interactive copyable code blocks, FAQ accordions, internal project links with icons, and image boxes) to be styled perfectly with your site's Tailwind CSS configuration.

---

## Table of Contents
1. [Core Features](#core-features)
2. [Folder & File Structure](#folder--file-structure)
3. [Step-by-Step: Adding a New Post](#step-by-step-adding-a-new-post)
4. [Master Schema & Configuration](#master-schema--configuration)
5. [Complete Block Types Reference](#complete-block-types-reference)
6. [Automated SEO & Integrations](#automated-seo--integrations)

---

## Core Features

- 🚫 **No Markdown Required**: Write posts entirely in highly structured JSON arrays.
- 🎨 **Premium Aesthetic Blocks**: Beautiful styling matching the dark-mode aesthetic with custom animations and hover effects.
- ⚙️ **Automatic SEO & JSON-LD**: Generates keywords, canonical URLs, open-graph types, and structured data schemas automatically for search engines.
- 🗺️ **Dynamic Sitemap**: Integrated with `app/sitemap.js` to automatically list active blog posts.
- 🏠 **Homepage Showcase**: The top 2 active blog posts are automatically pulled and featured on the home page.
- 🔄 **Related Posts**: Suggests related blog posts automatically at the bottom of every blog page.
- 🎯 **State-Aware Navigation**: Active state indicator on the Navbar hides when viewing deep blog posts to keep navigation pristine.

---

## Folder & File Structure

All blog data lives in the `public/Blog/` directory:

```bash
public/
└── Blog/
    ├── blog.json                          # Central Index for all blog posts (Metadata)
    ├── advanced-react-patterns.json        # Post content for slug: "advanced-react-patterns"
    ├── understanding-seo-in-2026.json     # Post content for slug: "understanding-seo-in-2026"
    └── building-portfolio-with-nextjs.json # Post content for slug: "building-portfolio-with-nextjs"
```

---

## Step-by-Step: Adding a New Post

Follow these three steps to publish a new blog post:

### Step 1: Register in the Blog Index
Open `public/Blog/blog.json` and append a new post metadata object at the end of the array:
```json
{
  "slug": "my-awesome-post",
  "title": "How to Build Amazing Interfaces",
  "short_description": "A quick guide to creating stunning, interactive components using Tailwind.",
  "img_link": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80",
  "status": true,
  "index": "yes",
  "date": "2026-06-17",
  "tags": ["Design", "CSS"],
  "read_time": "5 min read",
  "meta_details": {
    "keywords": "UI, Tailwind, Design System, CSS",
    "canonical_link": "https://man-navlakha.netlify.app/blog/my-awesome-post",
    "og_type": "article"
  }
}
```

### Step 2: Create the Content JSON File
Create a new file in `public/Blog/` named after your slug: `public/Blog/my-awesome-post.json`.

### Step 3: Write the Content Blocks
Open the new JSON file and write your content using the blocks array schema:
```json
{
  "blocks": [
    {
      "type": "title-description",
      "data": {
        "title": "Welcome to My Post",
        "description": "This is a paragraph under the title."
      }
    }
  ]
}
```

---

## Master Schema & Configuration

### The Blog Index (`blog.json`) Fields
| Field | Type | Description |
| :--- | :--- | :--- |
| `slug` | `string` | Unique URL path identifier. Must match the JSON filename. |
| `title` | `string` | The main headline of the post. |
| `short_description` | `string` | A snippet used for previews (homepage, blog list, meta description). |
| `img_link` | `string` | Thumbnail image URL (supports Unsplash or local public paths). |
| `status` | `boolean` | `true` to publish; `false` to keep it as a draft (hides from sitemap, listing, & SEO). |
| `index` | `string` | `"yes"` to instruct search engines to index; `"no"` to use `noindex`. |
| `date` | `string` | Publish date formatted as `YYYY-MM-DD`. |
| `tags` | `array` | Category tags/labels shown on preview cards. |
| `read_time` | `string` | Estimated reading duration (e.g. `"5 min read"`). |
| `meta_details` | `object` | SEO specifications: `keywords`, `canonical_link`, and `og_type`. |

---

## Complete Block Types Reference

Use these block definitions inside your `[slug].json` files:

### 1. Title & Description Block
Used for main headings, sub-headings, and body paragraphs.
```json
{
  "type": "title-description",
  "data": {
    "title": "Why Architecture Matters",
    "description": "Good structure makes it easier to scale products over time."
  }
}
```

### 2. Highlight Block
Used to show pull quotes, warnings, or callout blocks.
- Supports colors: `"yellow"`, `"blue"`, `"red"`, or default (empty string).
```json
{
  "type": "highlight",
  "data": {
    "text": "Make sure your component state is isolated as close as possible to the usage.",
    "color": "blue"
  }
}
```

### 3. Code Block
A developer-first code renderer with custom styling and a copy-to-clipboard button.
- Supports any language label (e.g. `"javascript"`, `"json"`, `"html"`, `"css"`).
- Set `show_copy_button` to `false` to disable copy actions.
```json
{
  "type": "code",
  "data": {
    "language": "javascript",
    "code": "const greet = () => {\n  console.log('Hello, world!');\n};",
    "show_copy_button": true
  }
}
```

### 4. Data List Block
Outputs clean lists with bullets or numbered styling.
- `style`: Use `"bullets"` for circular bullets, or `"numbers"` for ordered `01.` styling.
```json
{
  "type": "data-list",
  "data": {
    "style": "numbers",
    "items": [
      "Improve render performance",
      "Simplify unit testing workflows",
      "Establish dry code patterns"
    ]
  }
}
```

### 5. Image Block
Inserts high-quality illustrations or inline diagrams with borders, shadows, and centered italic captions.
```json
{
  "type": "image",
  "data": {
    "src": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80",
    "alt": "Clean architecture diagram",
    "caption": "Figure 1: React component flow with Custom Hooks"
  }
}
```

### 6. FAQ Block
An interactive accordion component that expands on-click.
```json
{
  "type": "faq",
  "data": {
    "question": "Can custom hooks return React UI component elements?",
    "answer": "Technically yes, but it is an anti-pattern. Custom hooks should return pure data or helper functions."
  }
}
```

### 7. Project Link Block
An interactive card showcasing a portfolio project. Includes hover scaling and custom icons.
- `icon` options: `"bot"` (AI/chatbot), `"code"` (programming), `"zap"` (speed/performance).
```json
{
  "type": "project-link",
  "data": {
    "title": "Solvinger AI",
    "description": "An AI-powered automated code review tool for modern projects.",
    "url": "/projects/solvinger",
    "icon": "bot"
  }
}
```

### 8. External Link Block
An inline styled button to link out to documentation or other resources.
```json
{
  "type": "external-link",
  "data": {
    "title": "Official React Hook Documentation",
    "url": "https://react.dev/learn/reusing-logic-with-custom-hooks"
  }
}
```

---

## Automated SEO & Integrations

1. **Sitemap Automation (`app/sitemap.js`)**: 
   Every time the sitemap is queried, it reads `blog.json` and automatically appends any active post (`status: true`).
2. **Metadata Generation**: 
   The dynamic route (`app/blog/[slug]/page.jsx`) processes the post metadata at runtime to set page titles, keywords, canonical URLs, and `noindex` values matching your config.
3. **JSON-LD Schema**: 
   The page automatically mounts a `schema.org/BlogPosting` script block dynamically populated with values like author, cover image, dates, and descriptions, maximizing Google SEO crawling accuracy.
