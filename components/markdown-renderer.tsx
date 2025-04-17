"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`markdown-renderer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold my-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold my-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold my-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-base font-bold my-2" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-sm font-bold my-1" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-xs font-bold my-1" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="my-2" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-primary hover:underline" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 my-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 my-2" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="my-1" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 italic my-2" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-4 border-border" {...props} />
          ),
          img: ({ node, ...props }) => (
            <img className="max-w-full h-auto my-2 rounded-md" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-border" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted/50" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-border" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-muted/20 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="rounded-md my-2"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className={`${
                  inline ? "bg-muted px-1 py-0.5 rounded text-sm" : "block bg-muted p-4 rounded-md overflow-x-auto"
                } ${className || ""}`}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
