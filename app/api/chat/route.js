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
7. After EVERY response (no exceptions), append exactly 3 relevant follow-up questions in this EXACT format on a new line:
   |||SUGGESTIONS|||["Question 1?", "Question 2?", "Question 3?"]

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

  const { message, history = [], isVoiceMode = false, type = 'chat', path = '/' } = body;
  if (type !== 'suggestions' && !message?.trim()) {
    return new Response('Message is required', { status: 400 });
  }

  // Detect hire intent BEFORE calling AI — instant form trigger
  if (type !== 'suggestions' && detectHireIntent(message)) {
    const hireResponse = `I'd love to connect about a potential opportunity! 🎉

Man is currently **open to freelance projects, collaborations, and full-time opportunities**.

Please fill out the quick form below and Man will get back to you as soon as possible!

[SHOW_HIRE_FORM]|||SUGGESTIONS|||["What is Man's availability?", "What types of projects does Man take on?", "What is Man's tech stack?"]`;

    return new Response(hireResponse, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
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
        } catch(e) {
          const match = content.match(/\[.*?\]/s);
          if (match) {
            try { suggestions = JSON.parse(match[0]); } catch(err) {}
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
