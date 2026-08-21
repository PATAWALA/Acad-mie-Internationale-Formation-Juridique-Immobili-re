// lib/textToHtml.ts

/**
 * Convertit un texte brut en HTML simple pour l'affichage des leçons.
 * Règles :
 * - Ligne vide = séparation de paragraphes
 * - Ligne commençant par '## ' -> <h3>
 * - Ligne commençant par '### ' -> <h4>
 * - Ligne commençant par '- ' ou '* ' -> élément de liste <ul><li>
 * - Autre ligne -> <p>
 * - **gras** -> <strong>gras</strong>
 * - *italique* -> <em>italique</em>
 */
export function textToHtml(text: string): string {
  if (!text) return '';

  const lines = text.split(/\r?\n/);
  const blocks: string[] = [];
  let currentList: string[] = [];
  let inList = false;

  const flushList = () => {
    if (inList && currentList.length > 0) {
      blocks.push(`<ul>${currentList.join('')}</ul>`);
      currentList = [];
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      blocks.push('<p></p>');
      continue;
    }

    // Sous-titre h4
    if (line.startsWith('### ')) {
      flushList();
      const content = inlineFormat(line.slice(4));
      blocks.push(`<h4>${content}</h4>`);
      continue;
    }

    // Sous-titre h3
    if (line.startsWith('## ')) {
      flushList();
      const content = inlineFormat(line.slice(3));
      blocks.push(`<h3>${content}</h3>`);
      continue;
    }

    // Élément de liste
    if (/^[-*]\s+/.test(line)) {
      const content = inlineFormat(line.replace(/^[-*]\s+/, ''));
      currentList.push(`<li>${content}</li>`);
      inList = true;
      continue;
    }

    // Paragraphe
    flushList();
    const content = inlineFormat(line);
    blocks.push(`<p>${content}</p>`);
  }

  flushList();
  return blocks.join('\n');
}

// Convertit **gras** et *italique* en balises HTML
function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}