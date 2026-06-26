export const runtime = 'nodejs';
export const maxDuration = 30;

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 25;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - record.start > RATE_LIMIT_WINDOW_MS) {
    record.count = 0;
    record.start = now;
  }
  record.count++;
  rateLimitMap.set(ip, record);
  return record.count <= RATE_LIMIT_MAX;
}

// ─── Local Data Imports (Single Source of Truth) ──────────────────────────────
import profile from '@/app/data/profile.json';
import experienceData from '@/app/data/experience.json';
import projectsData from '@/app/data/projects.json';
import blogData from '@/public/Blog/blog.json';
import aiSkills from '@/app/data/ai-skills.json';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://man-navlakha.netlify.app';

function getPortfolioContext() {
  let context = `## ABOUT MAN NAVLAKHA\n`;

  if (profile.fullName) context += `- Full Name: ${profile.fullName}\n`;
  if (profile.location) context += `- Location: ${profile.location}\n`;
  if (profile.role) context += `- Role: ${profile.role}\n`;
  if (profile.email) context += `- Email: ${profile.email}\n`;
  if (profile.linkedin) context += `- LinkedIn: ${profile.linkedin}\n`;
  if (profile.github) context += `- GitHub: ${profile.github}\n`;
  if (profile.website) context += `- Website: ${profile.website}\n`;
  if (profile.bio) context += `- Bio: ${profile.bio}\n`;
  if (profile.education) context += `- Education: ${profile.education}\n`;
  if (profile.availableFor) context += `- Available for: ${profile.availableFor}\n`;
  if (profile.skills) {
    context += `\n## SKILLS\n${profile.skills}\n`;
  }

  if (experienceData && experienceData.length > 0) {
    context += `\n## EXPERIENCE (${experienceData.length} Roles)\n`;
    experienceData.forEach((exp, i) => {
      context += `\n### ${i + 1}. ${exp.role} — ${exp.company} (${exp.duration.start} – ${exp.duration.end})\n`;
      context += `- ${exp.work_type} | ${exp.location}\n`;
      if (exp.logo) {
        const logoUrl = exp.logo.startsWith('http') ? exp.logo : `${SITE_URL}${exp.logo}`;
        context += `- Company Logo: ${logoUrl}\n`;
      }
      if (exp.responsibilities) {
        exp.responsibilities.forEach(desc => {
          context += `- ${desc}\n`;
        });
      }
      if (exp.skills_gained) {
        context += `- Skills: ${exp.skills_gained.join(', ')}\n`;
      }
    });
  }

  if (projectsData && projectsData.length > 0) {
    context += `\n## PROJECTS (${projectsData.length} Projects)\n`;
    projectsData.forEach((proj, i) => {
      context += `\n### ${i + 1}. ${proj.project_name} — ${proj.status}\n`;
      context += `- Category: ${proj.category}\n`;
      if (proj.image_url) {
        const imgUrl = proj.image_url.startsWith('http') ? proj.image_url : `${SITE_URL}${proj.image_url}`;
        context += `- Screenshot: ${imgUrl}\n`;
      }
      if (proj.project_url) {
        const urls = Array.isArray(proj.project_url) ? proj.project_url.join(', ') : proj.project_url;
        context += `- URL: ${urls}\n`;
      }
      if (proj.repository_url) {
        const repos = Array.isArray(proj.repository_url) ? proj.repository_url.join(', ') : proj.repository_url;
        context += `- GitHub: ${repos}\n`;
      }
      if (proj.description) context += `- Description: ${proj.description}\n`;
      if (proj.key_features) context += `- Features: ${proj.key_features.join(', ')}\n`;
      if (proj.technology_stack) {
        const tech = Object.values(proj.technology_stack).flat().join(', ');
        context += `- Tech: ${tech}\n`;
      }
      if (proj.problem_it_solves) context += `- Solves: ${proj.problem_it_solves}\n`;
    });
  }

  if (blogData && blogData.length > 0) {
    const publishedBlogs = blogData.filter(b => b.status === true);
    context += `\n## BLOG POSTS (${publishedBlogs.length} Articles)\n`;
    publishedBlogs.forEach((blog, i) => {
      context += `\n### ${i + 1}. ${blog.title}\n`;
      context += `- Published: ${blog.date}\n`;
      context += `- Read time: ${blog.read_time}\n`;
      context += `- Tags: ${blog.tags.join(', ')}\n`;
      context += `- Description: ${blog.short_description}\n`;
      context += `- Link: ${SITE_URL}/blog/${blog.slug}\n`;
      if (blog.img_link) {
        const blogImg = blog.img_link.startsWith('http') ? blog.img_link : `${SITE_URL}${blog.img_link}`;
        context += `- Cover Image: ${blogImg}\n`;
      }
    });
  }

  return context;
}

// ─── Portfolio Knowledge Base ─────────────────────────────────────────────────

// ─── Predefined Responses (Skip API for common questions) ─────────────────────
const PREDEFINED_RESPONSES = [
  // 1. Greetings
  {
    keywords: ['hello', 'hi', 'hey', 'howdy', 'hola', 'good morning', 'good afternoon', 'good evening', 'sup', 'yo', 'greetings'],
    exactMatch: true,
    response: `Hey there! 👋 Welcome to Man's portfolio!

I'm Man's AI assistant — I can tell you all about his **skills**, **projects**, **experience**, and how to **get in touch**. What would you like to know?|||SUGGESTIONS|||["What are Man's skills?", "Tell me about Man's projects", "How can I contact Man?"]`,
  },
  // 2. Thank You / Goodbye
  {
    keywords: ['thanks', 'thank you', 'thankyou', 'thx', 'bye', 'goodbye', 'good bye', 'see you', 'take care', 'later', 'cheers'],
    exactMatch: true,
    response: `You're welcome! 😊 It was great chatting with you.

If you ever want to know more about Man's work or want to collaborate, feel free to come back anytime. Have a great day! 🙌|||SUGGESTIONS|||["What are Man's skills?", "Tell me about Man's projects", "How can I contact Man?"]`,
  },
  // 3. Contact Info
  {
    keywords: ['contact', 'reach', 'get in touch', 'email', 'mail', 'connect', 'message him', 'talk to man'],
    excludeKeywords: ['hire', 'freelance'],
    response: `You can reach Man through any of these channels! 📬

- **Email:** [mannnavlakha1021@gmail.com](mailto:mannnavlakha1021@gmail.com)
- **LinkedIn:** [navlakhaman](https://www.linkedin.com/in/navlakhaman/)
- **GitHub:** [man-navlakha](https://github.com/man-navlakha)
- **Website:** [man-navlakha.netlify.app](https://man-navlakha.netlify.app)

Feel free to drop a message — Man is always happy to connect! 😊|||SUGGESTIONS|||["What are Man's skills?", "Tell me about Man's projects", "Is Man available for freelance?"]`,
  },
  // 4. Social Links
  {
    keywords: ['github', 'linkedin', 'social media', 'socials', 'social links', 'social profiles', 'online presence'],
    response: `Here are Man's social profiles! 🔗

- **LinkedIn:** [navlakhaman](https://www.linkedin.com/in/navlakhaman/) — Professional network & endorsements
- **GitHub:** [man-navlakha](https://github.com/man-navlakha) — Open source projects & code
- **Website:** [man-navlakha.netlify.app](https://man-navlakha.netlify.app) — Full portfolio

Feel free to connect on any platform! 🤝|||SUGGESTIONS|||["What are Man's skills?", "Tell me about Man's projects", "How can I contact Man?"]`,
  },
  // 5. Skills / Tech Stack
  {
    keywords: ['skills', 'tech stack', 'technologies', 'tools', 'what can you do', 'what does man know', 'programming languages', 'frameworks', 'languages'],
    excludeKeywords: ['hire', 'freelance', 'project'],
    response: `Man has a versatile full-stack skill set! 💻

**Frontend:**
- React.js, Next.js, TypeScript, Tailwind CSS, Framer Motion, HTML/CSS

**Backend:**
- Node.js, Express.js, Prisma

**Databases:**
- PostgreSQL, MongoDB

**Other:**
- Git & GitHub, Figma, SEO, Google Workspace Administration, IT Support & Troubleshooting

He specializes in the **MERN stack** and loves building high-quality, impactful digital experiences! 🚀|||SUGGESTIONS|||["Tell me about Man's projects", "What is Man's experience?", "Is Man available for freelance?"]`,
  },
  // 6. Experience / Work History
  {
    keywords: ['experience', 'work history', 'career', 'worked', 'companies', 'jobs', 'roles', 'professional background', 'where have you worked'],
    excludeKeywords: ['hire', 'freelance'],
    response: `Man has a diverse professional journey across 6 roles! 💼

1. **IT Support Technician** at Excellent Publicity _(Apr 2026 – Present)_ — SEO automation, Google Workspace admin, hardware repairs
2. **IT Support Intern** at Excellent Publicity _(Jan – Apr 2026)_ — System setup, troubleshooting, Microsoft 365
3. **Web Developer** at HarSar Innovations _(Mar – Apr 2025)_ — React.js, Node.js, PostgreSQL full-stack development
4. **IT Help Desk Technician** at Parshwanath Solutions _(Feb – Oct 2024)_ — Desktop/laptop support, OS installation
5. **Graphic Designer** at Naren Advertising _(Jun – Aug 2023)_ — Marketing creatives & branding
6. **Email Campaign Manager** at Vision World Foundation _(Jun – Aug 2023)_ — Email marketing & analytics

Check out the **[Experience Page](${SITE_URL}/experience)** for full details! 📄|||SUGGESTIONS|||["What are Man's skills?", "Tell me about Man's projects", "How can I contact Man?"]`,
  },
  // 7. Current Role
  {
    keywords: ['current job', 'currently working', 'current role', 'where do you work', 'present role', 'right now', 'current company', 'working at'],
    response: `Man is currently working as an **Information Technology Support Technician** at **Excellent Publicity** in Ahmedabad! 🏢

He's been in this role since **April 2026** and handles:
- 🛠️ SEO automation workflows
- 🔐 Google Workspace administration
- 💻 Hardware repairs & system maintenance
- 📦 IT asset lifecycle management
- 🌐 Network troubleshooting & software deployment

Alongside this, he continues building full-stack projects independently! 🚀|||SUGGESTIONS|||["What are Man's skills?", "Tell me about Man's projects", "Is Man available for freelance?"]`,
  },
  // 8. Education
  {
    keywords: ['education', 'degree', 'university', 'college', 'qualification', 'studied', 'academic', 'school', 'bca', 'msc'],
    response: `Man holds a solid academic background! 🎓

- **BCA** (Bachelor of Computer Applications) — Shreyarth University
- **MSc-IT** (Master of Science in Information Technology) — Shreyarth University

His academic foundation in computer science combined with hands-on industry experience makes him a well-rounded developer! 📚|||SUGGESTIONS|||["What are Man's skills?", "Tell me about Man's experience", "How can I contact Man?"]`,
  },
  // 9. Resume / CV
  {
    keywords: ['resume', 'cv', 'download resume', 'download cv', 'curriculum vitae'],
    response: `You can download Man's latest resume here! 📄

📥 **[Download Man's Resume (PDF)](https://drive.google.com/file/d/1PmhKbUHWzxaZEv3PfyoJMcxXG_8TFn5-/view)**

It includes his complete work experience, skills, education, and projects. Feel free to reach out after reviewing! 😊|||SUGGESTIONS|||["What are Man's skills?", "Tell me about Man's experience", "How can I contact Man?"]`,
  },
  // 10. Location
  {
    keywords: ['where are you from', 'location', 'based', 'city', 'country', 'where do you live', 'where is man from', 'hometown'],
    excludeKeywords: ['hire', 'job'],
    response: `Man is based in **Ahmedabad, Gujarat, India** 🇮🇳

He's open to both **local** and **remote** opportunities worldwide. Whether it's an on-site role in India or a remote collaboration across the globe — he's flexible! 🌍|||SUGGESTIONS|||["Is Man available for freelance?", "What are Man's skills?", "How can I contact Man?"]`,
  },
  // 11. About / Who is Man
  {
    keywords: ['who is man', 'who are you', 'tell me about man', 'about you', 'about man', 'introduce', 'introduction', 'yourself', 'what do you do'],
    excludeKeywords: ['built this', 'made this', 'ai', 'chatbot'],
    response: `Great question! Let me introduce Man 👋

**Man Navlakha** is a passionate **Full Stack Developer (MERN Stack)** and digital designer based in Ahmedabad, India.

He specializes in building high-quality, impactful digital experiences that blend **aesthetic design** with **robust engineering**. With expertise in React.js, Next.js, Node.js, and the entire MERN stack, he creates everything from portfolio websites to enterprise-grade platforms.

He's currently working as an **IT Support Technician** at Excellent Publicity while building innovative side projects like **Mechanic Setu** and **EP SEO Audit**! 🚀|||SUGGESTIONS|||["What are Man's skills?", "Tell me about Man's projects", "Is Man available for hire?"]`,
  },
  // 14. Availability
  {
    keywords: ['available', 'availability', 'free', 'open to work', 'open for work', 'taking on', 'accepting'],
    excludeKeywords: ['hire', 'freelance', 'pricing', 'cost', 'rate'],
    response: `Yes! Man is currently **open and available** for new opportunities! ✅

He's accepting:
- 🤝 **Freelance projects** — Web apps, dashboards, tools
- 🏢 **Full-time positions** — On-site or remote
- 🚀 **Collaborations** — Open source, startups, side projects

If you have something in mind, feel free to reach out at **mannnavlakha1021@gmail.com** or fill out the hire form! 📬|||SUGGESTIONS|||["How can I contact Man?", "What are Man's skills?", "What types of projects does Man take on?"]`,
  },
  // 15. Who Built This / About the AI
  {
    keywords: ['who built this', 'who made this', 'who created this', 'what ai', 'how does this work', 'what model', 'which ai', 'chatbot', 'this website', 'how was this made'],
    response: `This portfolio and AI assistant were built by **Man Navlakha** himself! 🛠️

**The Portfolio:**
- Built with **Next.js**, **Tailwind CSS**, and **Framer Motion**
- Features smooth animations, dark mode, and a responsive design

**This AI Assistant:**
- Powered by **Man Navlakha**
- Built with Next.js API routes & streaming responses
- Includes voice mode, smart suggestions, and a hire form

Man loves building these kinds of interactive experiences! ✨|||SUGGESTIONS|||["What are Man's skills?", "Tell me about Man's projects", "How can I contact Man?"]`,
  },
  // 16. Hire / Freelance
  {
    keywords: ['hire', 'hiring', 'freelance', 'contract', 'collaborate', 'collaboration', 'recruit', 'recruiting', 'job', 'work with', 'work together', 'opportunity', 'opportunities', 'position', 'looking for developer', 'project inquiry', 'project proposal', 'quote', 'pricing', 'cost', 'rate', 'want to hire', 'interested in hiring', 'looking to hire'],
    response: `I'd love to connect about a potential opportunity! 🎉

Man is currently **open to freelance projects, collaborations, and full-time opportunities**.

Please fill out the quick form below and Man will get back to you as soon as possible!

[SHOW_HIRE_FORM]|||SUGGESTIONS|||["What is Man's availability?", "What types of projects does Man take on?", "What is Man's tech stack?"]`,
    isHireIntent: true,
  },
];

function matchPredefinedResponse(message) {
  const lower = message.trim().toLowerCase().replace(/[^\w\s]/g, '');

  // First pass: check non-exactMatch (specific topic) entries
  for (const entry of PREDEFINED_RESPONSES) {
    if (entry.exactMatch) continue;

    if (entry.excludeKeywords && entry.excludeKeywords.some(ek => lower.includes(ek))) {
      continue;
    }

    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry;
    }
  }

  // Second pass: check exactMatch entries (greetings, goodbye) — only if no topic matched
  for (const entry of PREDEFINED_RESPONSES) {
    if (!entry.exactMatch) continue;

    const words = lower.split(/\s+/);
    if (words.length <= 3) {
      // Use word-boundary regex so "hi" doesn't match inside "this"
      const matched = entry.keywords.some(kw => {
        const regex = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`);
        return regex.test(lower);
      });
      if (matched) return entry;
    }
  }

  return null;
}

// ─── Hire-Intent Detection (kept as fallback) ─────────────────────────────────
const HIRE_KEYWORDS = [
  'hire', 'hiring', 'recruit', 'recruiting', 'job', 'work with', 'work together',
  'freelance', 'contract', 'collaborate', 'collaboration', 'opportunity', 'opportunities',
  'position', 'join your team', 'available', 'open to work', 'looking for developer',
  'project inquiry', 'project proposal', 'quote', 'pricing', 'cost', 'rate',
  'want to hire', 'interested in hiring', 'looking to hire'
];

function detectHireIntent(message) {
  const lower = message.toLowerCase();
  return HIRE_KEYWORDS.some(kw => lower.includes(kw));
}

// ─── System Prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(context, isVoiceMode = false) {
  let enhancedBehaviors = '';
  if (aiSkills) {
    enhancedBehaviors += `\nPERSONA: ${aiSkills.persona}\n`;
    enhancedBehaviors += `TONE: ${aiSkills.tone}\n\n`;

    if (aiSkills.ai_skills && aiSkills.ai_skills.length > 0) {
      enhancedBehaviors += `YOUR CAPABILITIES & SKILLS:\n`;
      aiSkills.ai_skills.forEach(skill => {
        enhancedBehaviors += `- [${skill.name}]: ${skill.instruction}\n`;
      });
    }

    if (aiSkills.custom_rules && aiSkills.custom_rules.length > 0) {
      enhancedBehaviors += `\nBEHAVIORAL RULES:\n`;
      aiSkills.custom_rules.forEach(rule => {
        enhancedBehaviors += `- ${rule}\n`;
      });
    }

    if (isVoiceMode && aiSkills.voice_mode_rules && aiSkills.voice_mode_rules.length > 0) {
      enhancedBehaviors += `\nVOICE MODE OVERRIDES:\n`;
      aiSkills.voice_mode_rules.forEach(rule => {
        enhancedBehaviors += `- ${rule}\n`;
      });
    }
  }

  return `You are "Man's AI Assistant" — a smart, friendly, and professional chatbot embedded in Man Navlakha's personal portfolio website.
${enhancedBehaviors}

YOUR ROLE:
You exist ONLY to answer questions about Man Navlakha — his skills, projects, work experience, blog posts, and contact/availability information.

STRICT RULES:
1. ONLY answer questions about Man Navlakha using the knowledge base below.
2. If someone asks about ANYTHING unrelated (other people, general knowledge, coding help, etc.), politely say: "I'm Man's personal assistant and I can only share information about him. Is there something specific about Man's work or background you'd like to know?"
3. Be conversational, enthusiastic about Man's work, and genuinely helpful.
4. Keep responses concise but informative. Use bullet points and markdown for readability. NEVER use or format your response as a markdown table.
5. Always be positive and professional — you're representing Man's personal brand.
6. If asked for contact info, provide: mannnavlakha1021@gmail.com and LinkedIn: https://www.linkedin.com/in/navlakhaman/
${!isVoiceMode ? '7. After EVERY response (no exceptions), append exactly 3 relevant follow-up questions in this EXACT format on a new line:\n   |||SUGGESTIONS|||["Question 1?", "Question 2?", "Question 3?"]' : '7. DO NOT generate follow-up questions or |||SUGGESTIONS||| blocks in your response.'}

IMAGE & MEDIA RULES:
- When showing projects, include their screenshot using markdown image syntax: ![Project Name](screenshot_url)
- When showing experience/companies, include the company logo: ![Company Name](logo_url)
- When showing blog posts, include the cover image: ![Blog Title](cover_image_url)
- Only use image URLs provided in the knowledge base — never fabricate URLs.
- When linking to blog posts, use the provided blog link URL.

KNOWLEDGE BASE ABOUT MAN NAVLAKHA:
${context}

RESPONSE FORMAT:
- Use clear markdown formatting (bold, bullets, links, images)
- Include relevant images when discussing projects, experience, or blogs
- Keep answers focused and helpful
${!isVoiceMode ? '- End EVERY response with the |||SUGGESTIONS||| line' : '- CRITICAL VOICE RULE: You are communicating via VOICE. ALL of your responses MUST be strictly a single, very short 1-liner sentence. Maximum 15 words. DO NOT elaborate. DO NOT use lists. DO NOT over-explain. Be as brief as humanly possible.'}`;
}

// ─── OpenRouter API Configuration ─────────────────────────────────────────────
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Models to try in order (fallback chain)
const MODELS_TO_TRY = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-31b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'openrouter/free',
];

// ─── Main API Handler ─────────────────────────────────────────────────────────
export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return new Response(
      '⚠️ Chatbot is not configured yet. Please add your OPENROUTER_API_KEY to .env.local to enable the AI assistant.|||SUGGESTIONS|||["How can I contact Man?", "Where can I see Man\'s projects?", "What is Man\'s tech stack?"]',
      { status: 200, headers: { 'Content-Type': 'text/plain' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { message, history = [], isVoiceMode = false, type = 'chat', path = '/' } = body;
  if (type !== 'suggestions' && !message?.trim()) {
    return new Response('Message is required', { status: 400 });
  }

  // Detect simple greetings in Voice Mode to return instantly and save LLM tokens/latency
  if (isVoiceMode && type !== 'suggestions') {
    const cleanMsg = message.trim().toLowerCase().replace(/[^a-z\s]/g, '');
    const greetings = ['hi', 'hello', 'hey', 'hi there', 'hello there', 'hey there', 'good morning', 'good afternoon', 'good evening'];
    if (greetings.includes(cleanMsg)) {
      return new Response("Hello! How can I help you?", {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  }

  // ── Predefined responses — skip API for common/simple questions ──
  if (type !== 'suggestions') {
    const predefined = matchPredefinedResponse(message);
    if (predefined) {
      return new Response(predefined.response, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  }

  const portfolioContext = getPortfolioContext();

  let messages = [];

  if (type === 'suggestions') {
    messages = [
      {
        role: 'system',
        content: `You are generating suggested questions for Man Navlakha's portfolio AI assistant. 
The user is currently on the page path: "${path}".
Generate exactly 4 short, engaging questions the user could ask you based on this page context.
If it's a blog page, ask about the blog content. If it's a projects page, ask about projects.
Context about Man Navlakha:
${portfolioContext}
Return ONLY a valid JSON array of 4 strings. No markdown formatting outside the JSON array.
Example: ["What is this blog about?", "How long did this project take?", "What is your role?", "Are you available to hire?"]`
      }
    ];
  } else {
    // Build chat messages in OpenAI format
    messages = [
      { role: 'system', content: buildSystemPrompt(portfolioContext, isVoiceMode) },
    ];

    // Add conversation history
    const recentHistory = history
      .filter(msg => msg.sender === 'user' || msg.sender === 'bot')
      .slice(-10);

    for (const msg of recentHistory) {
      const cleanText = typeof msg.text === 'string'
        ? msg.text.split('|||SUGGESTIONS|||')[0].replace('[SHOW_HIRE_FORM]', '').trim()
        : '';
      if (cleanText) {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: cleanText,
        });
      }
    }

    // Add current user message
    messages.push({ role: 'user', content: message.trim() });
  }

  // Try models in order — fallback if one fails
  const useGeminiNative = isVoiceMode && !!process.env.GEMINI_API_KEY;

  // Try models in order — fallback if one fails
  const modelsToUse = type === 'suggestions'
    ? ['meta-llama/llama-3.2-3b-instruct:free', ...MODELS_TO_TRY]
    : useGeminiNative
      ? ['gemini-2.5-flash', 'gemini-1.5-flash', ...MODELS_TO_TRY] // Gemini native first
      : MODELS_TO_TRY;

  for (let i = 0; i < modelsToUse.length; i++) {
    const modelName = modelsToUse[i];
    const isGeminiNative = useGeminiNative && modelName.startsWith('gemini-');

    const apiUrl = isGeminiNative
      ? 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
      : OPENROUTER_API_URL;

    const currentApiKey = isGeminiNative ? process.env.GEMINI_API_KEY : apiKey;

    try {
      const headers = {
        'Authorization': `Bearer ${currentApiKey}`,
        'Content-Type': 'application/json',
      };

      // Only add OpenRouter-specific headers when using OpenRouter
      if (!isGeminiNative) {
        headers['HTTP-Referer'] = 'https://man-navlakha.netlify.app';
        headers['X-Title'] = 'Man Navlakha Portfolio Chatbot';
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: modelName,
          messages,
          stream: type !== 'suggestions',
          temperature: isVoiceMode ? 0.6 : 0.7,
          top_p: 0.9,
          max_tokens: isVoiceMode ? 400 : 1024,
        }),
      });

      // If non-OK status, parse error and maybe try next model
      if (!response.ok) {
        const errorText = await response.text();
        const isQuotaError = response.status === 429 || response.status === 402 || errorText.includes('rate limit') || errorText.includes('quota');
        const isModelError = response.status === 404 || response.status === 400 || errorText.includes('not available');

        if ((isQuotaError || isModelError) && i < modelsToUse.length - 1) {
          console.warn(`Model ${modelName} failed (${response.status}), trying ${modelsToUse[i + 1]}...`);
          continue;
        }

        throw new Error(`API error (${isGeminiNative ? 'Gemini' : 'OpenRouter'}): ${response.status} ${errorText}`);
      }

      if (type === 'suggestions') {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '[]';
        let suggestions = [];
        try {
          suggestions = JSON.parse(content);
        } catch (e) {
          const match = content.match(/\[.*?\]/s);
          if (match) {
            try { suggestions = JSON.parse(match[0]); } catch (err) { }
          }
        }
        if (!suggestions || suggestions.length === 0) {
          suggestions = ["What are your skills?", "Tell me about your projects", "What's your experience?", "Are you available to hire?"];
        }
        return new Response(JSON.stringify({ suggestions }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Stream the SSE response back as plain text
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const stream = new ReadableStream({
        async start(controller) {
          try {
            const reader = response.body.getReader();
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });

              // Process SSE lines
              const lines = buffer.split('\n');
              buffer = lines.pop() || ''; // Keep incomplete line in buffer

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;

                const data = trimmed.slice(6); // Remove 'data: '
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch {
                  // Skip unparseable chunks
                }
              }
            }

            controller.close();
          } catch (err) {
            console.error('Stream error:', err);
            controller.error(err);
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'X-Accel-Buffering': 'no',
        },
      });
    } catch (error) {
      const errorMsg = error?.message || '';
      const isQuotaError = errorMsg.includes('429') || errorMsg.includes('rate limit') || errorMsg.includes('quota');
      const isModelError = errorMsg.includes('404') || errorMsg.includes('not available') || errorMsg.includes('not found');

      // If quota or model error and we have more models to try, continue
      if ((isQuotaError || isModelError) && i < modelsToUse.length - 1) {
        console.warn(`Model ${modelName} failed, trying ${modelsToUse[i + 1]}...`);
        continue;
      }

      console.error('OpenRouter API error:', error);

      // Friendly user-facing error messages
      let userErrorMsg;
      if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('invalid')) {
        userErrorMsg = '🔑 Invalid API key. Please check your OPENROUTER_API_KEY in .env.local|||SUGGESTIONS|||["How can I contact Man?", "What projects has Man built?", "What are Man\'s skills?"]';
      } else if (isQuotaError) {
        userErrorMsg = `⏳ Man's AI assistant is temporarily busy due to high demand! While I recharge, here's a quick summary:\n\n**Man Navlakha** is a Full Stack Developer (MERN Stack) based in Ahmedabad, India.\n\n- 💻 **Skills:** React, Next.js, Node.js, TypeScript, PostgreSQL, MongoDB\n- 🏢 **Current Role:** IT Support Technician at Excellent Publicity\n- 🚀 **Top Projects:** Mechanic Setu, Pixel Class, EP SEO Audit\n- 📧 **Contact:** mannnavlakha1021@gmail.com\n- 🔗 **LinkedIn:** [navlakhaman](https://linkedin.com/in/navlakhaman)\n\nPlease try again in a minute — I'll be back! 🔄|||SUGGESTIONS|||["What are Man's top projects?", "Tell me about Man's experience", "How can I contact Man?"]`;
      } else {
        userErrorMsg = '⚠️ Something went wrong. Please try again in a moment!|||SUGGESTIONS|||["What are Man\'s skills?", "Tell me about Man\'s projects", "How can I contact Man?"]';
      }

      return new Response(userErrorMsg, {
        status: isQuotaError ? 200 : 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }
}
