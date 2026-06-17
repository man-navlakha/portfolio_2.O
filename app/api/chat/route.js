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

// ─── Portfolio Knowledge Base ─────────────────────────────────────────────────
const PORTFOLIO_CONTEXT = `
## ABOUT MAN NAVLAKHA
- Full Name: Man Navlakha
- Location: Ahmedabad, Gujarat, India
- Role: Full Stack Developer (MERN Stack) & IT Support Technician
- Email: mannnavlakha1021@gmail.com
- LinkedIn: https://www.linkedin.com/in/navlakhaman/
- GitHub: https://github.com/man-navlakha
- Website: https://man-navlakha.netlify.app
- Bio: A passionate creative developer specializing in building high-quality, impactful digital experiences. Expert in React.js, Next.js, Node.js. Built the entire career page for HarSar Innovations and an AI model for code review in the Solvinger project. Speaks English, Hindi, and Gujarati.
- Education: BCA/MSc-IT at Shreyarth University
- Available for: Interview, Freelance projects, Collaborations
- Resume: https://drive.google.com/file/d/11z2oLFM9nlOEB4X5IflsfNLAx-qMjlVU/view?usp=sharing (IT support), 

## SKILLS
### Frontend
- React.js, Next.js (App Router & Pages Router), JavaScript (ES2024), TypeScript (basics)
- Tailwind CSS, Framer Motion, HTML5, CSS3, Responsive Design, SEO Optimization
### Backend
- Node.js, Express.js, REST API Design, API Integration
### Databases
- MongoDB, PostgreSQL, Prisma ORM
### Tools & Design
- Git, GitHub, Figma, Adobe Tools, VS Code, Vercel, Netlify
### Specialties
- UI/UX Design, Branding, Digital Marketing, Email Marketing, SEO Automation
### Other
- Google Workspace Administration, IT Support, Microsoft 365

## EXPERIENCE (6 Roles)

### 1. Information Technology Support Technician — Excellent Publicity (April 2026 – Present)
- Full-time | Ahmedabad, Gujarat, India
- Engineered SEO automation workflows for digital visibility
- Administered Google Workspace: users, security, collaborative tools
- Hardware repairs, laptop/desktop maintenance & performance tuning
- Full IT asset lifecycle management
- Outlook configurations with POP services
- Network & peripheral hardware troubleshooting
- Software deployment & security patch management
- Skills: IT Support, System Administration, Microsoft 365, Asset Management

### 2. IT Support Intern — Excellent Publicity (January 2026 – April 2026)
- 4 months | Ahmedabad, Gujarat, India
- Laptop & desktop configuration and setup
- On-call technical support for international employees
- Website data management, inventory management
- Microsoft 365, Windows OS installation & management
- Skills: IT Support, Hardware/Network Basics, User Communication

### 3. Web Developer — HarSar Innovations (March 2025 – April 2025)
- 2 months | Remote | Full-time/Project-based
- Built entire career page using React.js & Tailwind CSS
- Integrated RESTful APIs for dynamic content
- Backend APIs with Node.js, Express.js
- PostgreSQL database integration
- Skills: React.js, Tailwind CSS, Full-Stack, API Development, PostgreSQL, Git

### 4. Information Technology Help Desk Technician — Parshwanath Solutions (February 2024 – October 2024)
- 9 months | Ahmedabad, Gujarat, India
- Desktop/laptop technical support
- OS & software installation & configuration
- Preventive maintenance & system optimization
- Skills: IT Support, Hardware Maintenance, Problem Solving

### 5. Advertising Graphic Designer — Naren Advertising and Marketing (June 2023 – August 2023)
- 3 months (Internship) | Ahmedabad, Gujarat, India
- Designed marketing creatives & promotional graphics
- Branding materials for campaigns
- Digital platform content creation
- Skills: Graphic Design, Branding, Adobe Tools, Creative Thinking

### 6. Email Campaign Manager — Vision World Foundation (June 2023 – August 2023)
- 3 months (Internship) | Ahmedabad, Gujarat, India
- Email marketing campaign management & scheduling
- Contact database maintenance
- Campaign performance analysis & optimization
- Skills: Email Marketing, Campaign Management, Data Management

## PROJECTS (6 Projects)

### 1. Pixel Class — EdTech Platform
- URL: https://pixelclass.netlify.app/
- GitHub: https://github.com/man-navlakha/pxc
- Status: In Development / Active
- A centralized notes-sharing & collaboration platform for BCA and MSc-IT students at Shreyarth University
- Features: Notes repository, assignment sharing, student collaboration, user-friendly interface
- Tech: React.js, Next.js, Node.js, Express.js, MongoDB/PostgreSQL
- Solves: Students struggling to find notes & assignments at last moment

### 2. Portfolio Website — Personal Website
- URL: https://man-navlakha.netlify.app
- Status: Active
- Modern, responsive personal portfolio showcasing projects, skills, experience
- Features: Project showcase, about section, contact form, blog, responsive design
- Tech: Next.js, Tailwind CSS, Framer Motion

### 3. Mechanic Setu — On-Demand Service Platform
- URLs: https://mechanicsetu.tech/, https://mechanic.mechanicsetu.tech/
- GitHub: https://github.com/man-navlakha/mechanic_setu
- Status: In Development / Concept Stage
- On-demand roadside assistance platform connecting vehicle owners with nearby verified mechanics in real-time
- Features: Real-time mechanic discovery, location-based matching, verified profiles, emergency support
- Tech: React.js, Next.js, Node.js, Express.js, MongoDB/PostgreSQL, Maps integration

### 4. Enterprise Ticket System — IT Support & Asset Management
- URL: http://man-support-desk.netlify.app/
- GitHub: https://github.com/man-navlakha/ticket_system
- Status: Completed / In Use (Internship Project)
- Enterprise-grade ticket management for IT support and asset tracking (Vercel-inspired UI)
- Features: Ticket creation, priority-based tracking, asset management, user/admin dashboards
- Tech: Next.js 15, Node.js, PostgreSQL, Prisma ORM
- Built during internship at Excellent Publicity

### 5. EP SEO Audit — Enterprise SEO Platform
- URL: https://seo-audit-rose.vercel.app/
- GitHub: https://github.com/man-navlakha/seo-audit
- Status: In Development
- Built for Excellent Publicity — streamlines SEO auditing into 3 phases: Domain Discovery, Multi-Surface Scoring (250+ signals), Unified Report Delivery
- Features: JS-rendered HTML diffing, Core Web Vitals, Rich Schema Validation, E-E-A-T, Local SEO, AI Search Optimization
- Tech: Next.js, React, Tailwind CSS, Node.js, Express.js, PostgreSQL, Redis

### 6. PixStock — Developer-First Asset Infrastructure
- URL: https://pix-stock.netlify.app/
- Status: Completed / Active
- Comprehensive asset management platform for product teams — dynamic GitHub stat cards, tech stack icons API, stock imagery
- Features: Stable asset identifiers, GitHub Stats API, Pin API, Tech Stack Icons API
- Tech: React, Tailwind CSS, Node.js, Express, Netlify

## BLOG POSTS
1. "Advanced React Patterns in 2026" — React, Architecture | 6 min read | Published: 2026-06-16
   URL: https://man-navlakha.netlify.app/blog/advanced-react-patterns
   Topics: Modern hooks, compound components, render delegation, scalable architecture

2. "My B2B Email Marketing Workflow in 2026" — GTM, Email Marketing, Lead Generation | 8 min read | Published: 2026-06-17
   URL: https://man-navlakha.netlify.app/blog/b2b-email-marketing-workflow
   Topics: Lead generation, data enrichment, email infrastructure, domain management, cold email

## AREAS OF EXPERTISE
1. Full-Stack Web Development — React, Next.js, Node.js, clean code, performance
2. UI/UX Design — Figma, intuitive interfaces, seamless user experiences
3. Branding — Brand identity, logo design, typography, color theory
4. IT Support & System Administration — Hardware, software, network, Microsoft 365
5. Digital Marketing — Email campaigns, SEO, social media
`;

// ─── Hire-Intent Detection ────────────────────────────────────────────────────
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
function buildSystemPrompt() {
  return `You are "Man's AI Assistant" — a smart, friendly, and professional chatbot embedded in Man Navlakha's personal portfolio website.

YOUR ROLE:
You exist ONLY to answer questions about Man Navlakha — his skills, projects, work experience, blog posts, and contact/availability information.

STRICT RULES:
1. ONLY answer questions about Man Navlakha using the knowledge base below.
2. If someone asks about ANYTHING unrelated (other people, general knowledge, coding help, etc.), politely say: "I'm Man's personal assistant and I can only share information about him. Is there something specific about Man's work or background you'd like to know?"
3. Be conversational, enthusiastic about Man's work, and genuinely helpful.
4. Keep responses concise but informative. Use bullet points and markdown for readability.
5. Always be positive and professional — you're representing Man's personal brand.
6. If asked for contact info, provide: mannnavlakha1021@gmail.com and LinkedIn: https://www.linkedin.com/in/navlakhaman/
7. After EVERY response (no exceptions), append exactly 3 relevant follow-up questions in this EXACT format on a new line:
   |||SUGGESTIONS|||["Question 1?", "Question 2?", "Question 3?"]

KNOWLEDGE BASE ABOUT MAN NAVLAKHA:
${PORTFOLIO_CONTEXT}

RESPONSE FORMAT:
- Use clear markdown formatting (bold, bullets, links)
- Keep answers focused and helpful
- End EVERY response with the |||SUGGESTIONS||| line`;
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

  const { message, history = [] } = body;
  if (!message?.trim()) {
    return new Response('Message is required', { status: 400 });
  }

  // Detect hire intent BEFORE calling AI — instant form trigger
  if (detectHireIntent(message)) {
    const hireResponse = `I'd love to connect about a potential opportunity! 🎉

Man is currently **open to freelance projects, collaborations, and full-time opportunities**.

Please fill out the quick form below and Man will get back to you as soon as possible!

[SHOW_HIRE_FORM]|||SUGGESTIONS|||["What is Man's availability?", "What types of projects does Man take on?", "What is Man's tech stack?"]`;

    return new Response(hireResponse, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // Build chat messages in OpenAI format
  const messages = [
    { role: 'system', content: buildSystemPrompt() },
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

  // Try models in order — fallback if one fails
  for (let i = 0; i < MODELS_TO_TRY.length; i++) {
    const modelName = MODELS_TO_TRY[i];
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://man-navlakha.netlify.app',
          'X-Title': 'Man Navlakha Portfolio Chatbot',
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          stream: true,
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1024,
        }),
      });

      // If non-OK status, parse error and maybe try next model
      if (!response.ok) {
        const errorText = await response.text();
        const isQuotaError = response.status === 429 || errorText.includes('rate limit') || errorText.includes('quota');
        const isModelError = response.status === 404 || response.status === 400 || errorText.includes('not available');

        if ((isQuotaError || isModelError) && i < MODELS_TO_TRY.length - 1) {
          console.warn(`Model ${modelName} failed (${response.status}), trying ${MODELS_TO_TRY[i + 1]}...`);
          continue;
        }

        throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
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
      if ((isQuotaError || isModelError) && i < MODELS_TO_TRY.length - 1) {
        console.warn(`Model ${modelName} failed, trying ${MODELS_TO_TRY[i + 1]}...`);
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
