'use client';

export default function HtmlContentViewer({ content }: { content: string }) {
  return (
    <div 
      className="html-content prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}