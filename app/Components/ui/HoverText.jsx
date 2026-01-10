import React from 'react';

export default function HoverText({ children, className = 'group' }) {
    return (
        <div className={`relative overflow-hidden ${className}`}>
            <p className="group-hover:-translate-y-7 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]">
                {children}
            </p>
            <p className="absolute top-7 left-0 group-hover:top-0 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]">
                {children}
            </p>
        </div>
    );
}
