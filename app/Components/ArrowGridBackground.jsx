"use client";

import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";

export default function ArrowGridBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    let animationFrameId;
    let time = 0;

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      return { width: rect.width, height: rect.height };
    };

    let { width, height } = setCanvasSize();

    const handleResize = () => {
      const dimensions = setCanvasSize();
      width = dimensions.width;
      height = dimensions.height;
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const isDark = resolvedTheme === "dark";

    const drawArrow = (x, y, opacity) => {
      const size = 6;
      ctx.beginPath();
      ctx.moveTo(x - size / 2, y + size / 2);
      ctx.lineTo(x + size / 2, y - size / 2);
      ctx.moveTo(x + size / 2 - size * 0.8, y - size / 2);
      ctx.lineTo(x + size / 2, y - size / 2);
      ctx.lineTo(x + size / 2, y - size / 2 + size * 0.8);

      ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    };

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      const spacing = 22;
      const cols = Math.ceil(width / spacing);
      const rows = Math.ceil(height / spacing);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing + (spacing / 2);
          const y = j * spacing + (spacing / 2);

          const wave = Math.sin(x * 0.01 + y * 0.01 - time * 2) * 0.5 + 0.5;
          const dx = x - mouseRef.current.x;
          const dy = y - mouseRef.current.y;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);
          const mouseGlow = Math.max(0, 1 - distToMouse / 150);

          const baseOpacity = 0;
          const waveOpacity = wave * 0.2;
          const interactionOpacity = mouseGlow * 0.15;

          const finalOpacity = (baseOpacity + waveOpacity + interactionOpacity);

          if (finalOpacity > 0.01) {
            drawArrow(x, y, finalOpacity);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted, resolvedTheme]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-50 font-sans">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-100 to-white dark:from-[#000000] dark:via-[#0a0a0a] dark:to-[#000000] -z-20 transition-colors duration-500" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 mix-blend-multiply dark:mix-blend-screen opacity-60 dark:opacity-80 -z-10"
      />
    </div>
  );
}
