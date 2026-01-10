'use client'
import React, { useEffect, useRef, useState } from 'react';

export default function RevealOnScroll({ children, className = "", delay = 0 }) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px"
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out transform ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10 md:translate-y-12"
                } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}
