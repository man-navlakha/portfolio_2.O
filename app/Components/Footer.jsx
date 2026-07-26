
import { Github, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="pt-12 border-t border-slate-200 dark:border-white/10 pb-24 md:pb-24 lg:pb-8 bg-transparent">

            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
                {/* Internal Navigation Links */}
                <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-8" aria-label="Footer navigation">
                    <Link href="/about" className="text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-brand transition-colors">About</Link>
                    <Link href="/projects" className="text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-brand transition-colors">Projects</Link>
                    <Link href="/experience" className="text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-brand transition-colors">Experience</Link>
                    <Link href="/blog" className="text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-brand transition-colors">Blog</Link>
                    <Link href="/contact" className="text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-brand transition-colors">Contact</Link>
                    <Link href="/lab" className="text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-brand transition-colors">Lab</Link>
                </nav>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-slate-500 dark:text-gray-500 text-sm">
                        © 2026 Man Navlakha. All rights reserved.
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="https://www.linkedin.com/in/navlakhaman/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Linkedin size={20} /></a>
                        <a href="https://github.com/man-navlakha" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Github size={20} /></a>

                        <a href="mailto:mannnavlakha1021@gmail.com" aria-label="Send Email" className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Mail size={20} /></a>
                    </div>
                </div>
            </div>

        </footer>
    );
}
