
import { Github, Linkedin, Mail, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="pt-8 border-t border-slate-200 dark:border-white/10 pb-24 md:pb-24 lg:pb-8 bg-transparent">

            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-slate-500 dark:text-gray-500 text-sm">
                    © 2026 Man Navlakha. All rights reserved.
                </div>

                <div className="flex items-center gap-6">
                    <a href="https://www.linkedin.com/in/navlakhaman/" target="_blank" rel="noopener noreferrer" className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Linkedin size={20} /></a>
                    <a href="https://github.com/man-navlakha" target="_blank" rel="noopener noreferrer" className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Github size={20} /></a>

                    <a href="mailto:mannnavlakha1021@gmail.com" className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Mail size={20} /></a>
                    {/* <a href="#" className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Twitter size={20} /></a> */}
                </div>
            </div>

        </footer>
    );
}
