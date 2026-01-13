import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@/styles/markdown-editor.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Detect if we're in dark mode
  const isDarkMode = document.documentElement.classList.contains('dark') || 
                     window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div className={`markdown-content ${className}`}>
      <MDEditor.Markdown 
        source={content} 
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
