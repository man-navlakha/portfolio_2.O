import React, { useEffect, useRef, useState } from 'react';

export default function RevealText({ text, className = "" }) {
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
        <p ref={ref} className={`flex flex-wrap gap-x-[0.3em] gap-y-1 ${className}`}>
            {text.split(" ").map((word, i) => (
                <span
                    key={i}
                    className={`transition-all duration-700 ease-[cubic-bezier(0.2,0.65,0.3,0.9)] will-change-[opacity,transform,filter] ${isVisible
                            ? "opacity-100 translate-y-0 blur-0"
                            : "opacity-0 translate-y-8 blur-sm"
                        }`}
                    style={{ transitionDelay: `${i * 25}ms` }}
                >
                    {word}
                </span>
            ))}
        </p>
    );
}
