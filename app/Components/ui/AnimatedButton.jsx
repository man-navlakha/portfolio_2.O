import React from 'react';
import HoverText from './HoverText';

export default function AnimatedButton({
    children,
    className = "",
    onClick,
    hoverColor = "bg-[#25D366]",
    hoverTextColor = "group-hover:text-white",
    ...props
}) {
    return (
        <button
            onClick={onClick}
            className={`group relative inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-medium transition-all duration-300 border border-slate-300 dark:border-white/20 overflow-hidden ${className}`}
            {...props}
        >
            <span className={`absolute w-[150%] h-[250%] ${hoverColor} rounded-[100%] translate-y-[100%] transition-transform duration-2000 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-[-15%] left-1/2 -translate-x-1/2`}></span>
            <span className={`relative z-10 text-slate-900 dark:text-white transition-colors duration-300 ${hoverTextColor}`}>
                <HoverText>{children}</HoverText>
            </span>
        </button>
    );
}
