export const projects = [
    {
        id: "pixel-class",
        title: "Pixel Class",
        tagline: "A revolutionary way to learn coding online.",
        type: "Development",
        year: "2024",
        bannerImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2000&auto=format&fit=crop", // Placeholder
        image: "https://ik.imagekit.io/pxc/mannavlakha/image(1).png",
        logo: "https://ui-avatars.com/api/?name=PC&background=random&size=128", // Placeholder
        color: "bg-[#FFF8D6]",
        category: "Development",
        roles: "Full Stack Developer",
        client: "Personal Project",
        liveLink: "#",
        githubLink: "#",
        description: "Pixel Class is an innovative online learning platform designed to make coding accessible and engaging for everyone. With interactive lessons, real-time feedback, and a supportive community, students can master programming languages at their own pace.",
        overview: "The goal of Pixel Class was to create a learning environment that mimics the experience of a real classroom but with the flexibility of online learning. We focused on creating an intuitive interface that minimizes distractions and maximizes learning retention.",
        tags: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
        techStack: [
            { name: "React", description: "Front-End JavaScript library." },
            { name: "Node.js", description: "JavaScript runtime built on Chrome's V8 JavaScript engine." },
            { name: "MongoDB", description: "NoSQL database for storing application data." },
            { name: "Tailwind CSS", description: "A utility-first CSS framework." }
        ],
        features: [
            "Interactive Coding Environment: Write and execute code directly in the browser.",
            "Progress Tracking: Visual dashboards to track your learning journey.",
            "Community Forums: Connect with other learners and mentors.",
            "Real-time Feedback: Instant code validation and error explanations."
        ],
        buildSteps: [
            { step: "Clone this repo", command: "git clone https://github.com/man-navlakha/pixel-class.git && cd pixel-class" },
            { step: "Install project dependencies", command: "npm install" },
            { step: "Build the project and start a local server", command: "npm run dev" }
        ],
        designScreens: [
            "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        id: "solvinger-ai",
        title: "Solvinger AI",
        tagline: "AI-powered problem solving assistant.",
        type: "Development & Design",
        year: "2024",
        bannerImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop", // Placeholder
        image: "https://ik.imagekit.io/pxc/mannavlakha/Screenshot%202025-08-16%20152513.png",
        logo: "https://ui-avatars.com/api/?name=SA&background=random&size=128", // Placeholder
        color: "bg-[#FAD9E6]",
        category: "Development",
        roles: "AI Engineer & Developer",
        client: "Personal Project",
        liveLink: "#",
        githubLink: "#",
        description: "Solvinger AI leverages advanced machine learning algorithms to assist users in solving complex problems across various domains. From mathematical equations to coding challenges, Solvinger provides step-by-step solutions and explanations.",
        overview: "Solvinger AI was built to bridge the gap between complex AI models and everyday users. We wanted to create a tool that is not only powerful but also easy to use, providing actionable insights and solutions in seconds.",
        tags: ["Python", "TensorFlow", "React", "FastAPI"],
        techStack: [
            { name: "Python", description: "Primary programming language for AI logic." },
            { name: "TensorFlow", description: "Open-source library for machine learning." },
            { name: "React", description: "User interface for interacting with the AI." },
            { name: "FastAPI", description: "High-performance web framework for building APIs." }
        ],
        features: [
            "Smart Query Processing: Understand natural language queries with high accuracy.",
            "Visual Explanations: Generate charts and graphs to explain solutions.",
            "Multi-domain Support: Capable of solving math, physics, and coding problems.",
            "History & Bookmarks: Save and revisit previous solutions."
        ],
        buildSteps: [
            { step: "Clone this repo", command: "git clone https://github.com/man-navlakha/solvinger-ai.git && cd solvinger-ai" },
            { step: "Install dependencies", command: "pip install -r requirements.txt" },
            { step: "Run the server", command: "uvicorn main:app --reload" }
        ],
        designScreens: [
            "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        id: "career-system",
        title: "Career System",
        tagline: "Streamlining the hiring process.",
        type: "Development",
        year: "2025",
        bannerImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2000&auto=format&fit=crop", // Placeholder
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1000&auto=format&fit=crop",
        logo: "https://ui-avatars.com/api/?name=CS&background=random&size=128", // Placeholder
        color: "bg-[#E2E2E2]",
        category: "Development",
        roles: "Backend Developer",
        client: "HarSar Innovations",
        liveLink: "#",
        githubLink: "#",
        description: "A comprehensive career management system designed to help companies manage job postings, applications, and candidate pipelines efficiently.",
        overview: "The Career System simplifies the recruitment workflow. It provides a centralized platform for HR teams to collaborate, track candidates, and schedule interviews, reducing time-to-hire significantly.",
        tags: ["Vue.js", "Firebase", "Tailwind"],
        techStack: [
            { name: "Vue.js", description: "Progressive JavaScript framework." },
            { name: "Firebase", description: "Backend-as-a-Service for realtime data." },
            { name: "Tailwind CSS", description: "Utility-first CSS framework." }
        ],
        features: [
            "Kanban Board: Drag-and-drop candidate management.",
            "Automated Emails: Send status updates to candidates automatically.",
            "Resume Parsing: Automatically extract details from uploaded resumes.",
            "Interview Scheduling: Integrated calendar for scheduling."
        ],
        buildSteps: [
            { step: "Clone this repo", command: "git clone https://github.com/man-navlakha/career-system.git" },
            { step: "Install dependencies", command: "npm install" },
            { step: "Run development server", command: "npm run serve" }
        ],
        designScreens: [
            "https://images.unsplash.com/photo-1586717791821-3f44a5638d0f?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1526045612212-70caf35c14df?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        id: "mechanic-setu",
        title: "Mechanic Setu",
        tagline: "Connecting vehicle owners with mechanics.",
        type: "Development",
        year: "2025",
        bannerImage: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=2000&auto=format&fit=crop", // Placeholder
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
        logo: "https://ui-avatars.com/api/?name=MS&background=random&size=128", // Placeholder
        color: "bg-[#CDEAFA]",
        category: "Development",
        roles: "Mobile Developer",
        client: "Startup",
        liveLink: "#",
        githubLink: "#",
        description: "Mechanic Setu is a hyperlocal service aggregator that connects vehicle owners with nearby mechanics for emergency repairs and regular maintenance.",
        overview: "We aimed to solve the problem of finding reliable mechanics during roadside breakdowns. Mechanic Setu uses geolocation to find the nearest available mechanic and provides transparent pricing.",
        tags: ["React Native", "Node.js", "PostgreSQL"],
        techStack: [
            { name: "React Native", description: "Framework for building native apps." },
            { name: "Node.js", description: "Backend runtime." },
            { name: "PostgreSQL", description: "Relational database system." }
        ],
        features: [
            "Real-time Tracking: Track the mechanic's arrival in real-time.",
            "Service History: Keep track of all your vehicle repairs.",
            "SOS Button: Instant emergency assistance request.",
            "Rating System: Rate and review mechanics."
        ],
        buildSteps: [
            { step: "Clone this repo", command: "git clone https://github.com/man-navlakha/mechanic-setu.git" },
            { step: "Install dependencies", command: "npm install" },
            { step: "Run on Android", command: "npx react-native run-android" }
        ],
        designScreens: [
            "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?q=80&w=1000&auto=format&fit=crop"
        ]
    }
];
