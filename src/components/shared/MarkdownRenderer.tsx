import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@/styles/markdown-editor.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  /** If true, strips markdown syntax and renders as plain text (useful for compact displays) */
  stripMarkdown?: boolean;
}

/**
 * Helper function to clean up invalid/orphaned markdown syntax
 * This handles cases where markdown characters appear but don't form valid patterns
 */
function cleanMarkdown(text: string): string {
  if (!text) return '';

  return text
    // Remove orphaned asterisks at end of lines (like "text***")
    .replace(/\*{1,3}$/gm, '')
    // Remove orphaned asterisks at start of lines (like "***text" without closing)
    .replace(/^(\*{1,3})(?![*\s])/gm, '')
    // Remove orphaned underscores at end of lines
    .replace(/_{1,3}$/gm, '')
    // Remove orphaned underscores at start of lines
    .replace(/^(_{1,3})(?![_\s])/gm, '')
    // Clean up multiple consecutive asterisks in the middle of text that don't form valid bold/italic
    .replace(/(\S)\*{3,}(\S)/g, '$1 $2')
    // Clean up lines that are just asterisks or underscores (malformed horizontal rules)
    .replace(/^[\s]*[\*_]{1,2}[\s]*$/gm, '')
    // Trim extra whitespace
    .trim();
}

/**
 * Helper function to strip markdown syntax from text
 */
function stripMarkdownSyntax(text: string): string {
  if (!text) return '';

  return text
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic (valid patterns)
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/___(.+?)___/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove orphaned asterisks (invalid patterns like "text***" or "***")
    .replace(/\*{1,3}$/gm, '')
    .replace(/^(\*{1,3})(?!\*)/gm, '')
    .replace(/_{1,3}$/gm, '')
    .replace(/^(_{1,3})(?!_)/gm, '')
    // Remove strikethrough
    .replace(/~~(.+?)~~/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`(.+?)`/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove horizontal rules
    .replace(/^[\*\-_]{3,}$/gm, '')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove list markers
    .replace(/^[\*\-+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function MarkdownRenderer({ content, className = '', stripMarkdown = false }: MarkdownRendererProps) {
  // Detect if we're in dark mode
  const isDarkMode = document.documentElement.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  // If stripMarkdown is true, render as plain text
  if (stripMarkdown) {
    const plainText = stripMarkdownSyntax(content);
    return (
      <span className={className}>
        {plainText}
      </span>
    );
  }

  // Clean up invalid markdown patterns before rendering
  const cleanedContent = cleanMarkdown(content);

  return (
    <div className={`markdown-content ${className}`}>
      <MDEditor.Markdown
        source={cleanedContent}
        data-color-mode={isDarkMode ? "dark" : "light"}
        style={{
          backgroundColor: 'transparent',
          color: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit'
        }}
      />
    </div>
  );
}
