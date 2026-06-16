"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink, ChevronDown, Bot, Code, Zap, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function BlogBlocks({ blocks }) {
  if (!blocks || !Array.isArray(blocks)) return null;

  return (
    <div className="flex flex-col gap-10 w-full">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "title-description":
            return <TitleDescriptionBlock key={index} data={block.data} />;
          case "highlight":
            return <HighlightBlock key={index} data={block.data} />;
          case "code":
            return <CodeBlock key={index} data={block.data} />;
          case "data-list":
            return <DataListBlock key={index} data={block.data} />;
          case "image":
            return <ImageBlock key={index} data={block.data} />;
          case "faq":
            return <FaqBlock key={index} data={block.data} />;
          case "project-link":
            return <ProjectLinkBlock key={index} data={block.data} />;
          case "external-link":
            return <ExternalLinkBlock key={index} data={block.data} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

function TitleDescriptionBlock({ data }) {
  return (
    <div className="flex flex-col gap-4">
      {data.title && (
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {data.title}
        </h2>
      )}
      {data.description && (
        <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-lg">
          {data.description}
        </p>
      )}
    </div>
  );
}

function HighlightBlock({ data }) {
  const colorMap = {
    yellow: "border-brand bg-brand/5",
    blue: "border-blue-500 bg-blue-500/5",
    red: "border-red-500 bg-red-500/5",
  };
  const borderClass = colorMap[data.color] || "border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]";

  return (
    <blockquote className={`p-6 md:p-8 border-l-4 rounded-r-2xl ${borderClass}`}>
      <p className="text-lg font-medium text-slate-800 dark:text-gray-200 leading-relaxed italic">
        &ldquo;{data.text}&rdquo;
      </p>
    </blockquote>
  );
}

function CodeBlock({ data }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-[#0d1117] shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-900/80 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            {data.language || "code"}
          </span>
        </div>
        {data.show_copy_button !== false && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-all rounded-lg hover:bg-white/10"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-brand" />
                <span className="text-brand">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>
      {/* Code Body */}
      <div className="p-5 overflow-x-auto">
        <pre className="text-sm font-mono text-slate-200 leading-relaxed">
          <code>{data.code}</code>
        </pre>
      </div>
    </div>
  );
}

function DataListBlock({ data }) {
  const ListTag = data.style === "numbers" ? "ol" : "ul";

  return (
    <ListTag className="space-y-3 pl-2">
      {data.items.map((item, index) => (
        <li key={index} className="flex items-start gap-4 group">
          {data.style === "numbers" ? (
            <span className="mt-0.5 text-sm font-bold text-brand tabular-nums shrink-0">
              {String(index + 1).padStart(2, "0")}.
            </span>
          ) : (
            <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0 group-hover:scale-150 transition-transform" />
          )}
          <span className="text-slate-700 dark:text-gray-300 leading-relaxed text-lg">
            {item}
          </span>
        </li>
      ))}
    </ListTag>
  );
}

function ImageBlock({ data }) {
  return (
    <div className="flex flex-col gap-3 my-4">
      <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10">
        <img
          src={data.src}
          alt={data.alt || "Blog Image"}
          className="w-full h-auto object-cover"
        />
      </div>
      {data.caption && (
        <p className="text-center text-sm text-slate-500 dark:text-gray-500 italic">
          {data.caption}
        </p>
      )}
    </div>
  );
}

function FaqBlock({ data }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#111]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
      >
        <span className="text-lg font-bold text-slate-900 dark:text-white pr-8">
          {data.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-slate-500 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="p-6 pt-0 text-slate-600 dark:text-gray-400 text-lg leading-relaxed">
            {data.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProjectLinkBlock({ data }) {
  // Render an icon dynamically if provided
  const renderIcon = () => {
    switch (data.icon) {
      case "bot": return <Bot className="w-6 h-6 text-brand" />;
      case "code": return <Code className="w-6 h-6 text-brand" />;
      case "zap": return <Zap className="w-6 h-6 text-brand" />;
      default: return <div className="w-2 h-2 rounded-full bg-brand" />;
    }
  };

  return (
    <Link href={data.url} className="block group my-4">
      <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 hover:border-brand dark:hover:border-brand transition-all duration-300">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            {renderIcon()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors">
              {data.title}
            </h3>
            {data.description && (
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 line-clamp-1">
                {data.description}
              </p>
            )}
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-brand transition-colors duration-300">
          <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-black transition-colors" />
        </div>
      </div>
    </Link>
  );
}

function ExternalLinkBlock({ data }) {
  return (
    <a href={data.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 font-medium transition-colors my-2 border border-slate-200 dark:border-white/10 w-fit">
      <span>{data.title}</span>
      <ExternalLink className="w-4 h-4 text-slate-500" />
    </a>
  );
}
