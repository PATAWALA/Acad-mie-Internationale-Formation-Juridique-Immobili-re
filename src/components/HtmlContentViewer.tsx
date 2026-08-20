'use client';

import { formatContentWithImagesAndPdfs } from '@/lib/formatContent';

export default function HtmlContentViewer({ content }: { content: string }) {
  const formattedContent = formatContentWithImagesAndPdfs(content);

  return (
    <div
      className="html-content prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
}