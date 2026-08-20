// lib/formatContent.ts

export function formatContentWithImagesAndPdfs(content: string): string {
  if (!content) return '';

  const urlRegex = /(https?:\/\/[^\s"'<>]+)/g;

  return content.replace(urlRegex, (url) => {
    // Nettoyer l'URL des caractères de ponctuation finaux
    const cleanUrl = url.replace(/[.,;:]+$/, '');

    // Si c'est une image
    if (/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(cleanUrl)) {
      return `<img src="${cleanUrl}" alt="Document" loading="lazy" style="max-width:100%; height:auto; border-radius:8px; margin:12px 0; display:block;" />`;
    }

    // Si c'est un PDF
    if (/\.pdf(\?.*)?$/i.test(cleanUrl)) {
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin:6px 0; padding:8px 16px; background-color:#1e293b; color:#60a5fa; border-radius:8px; text-decoration:none; font-weight:500;">📄 Ouvrir le PDF</a>`;
    }

    // Documents Word, Excel, PowerPoint, archives
    if (/\.(docx?|xlsx?|pptx?|zip|rar|7z)(\?.*)?$/i.test(cleanUrl)) {
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin:6px 0; padding:8px 16px; background-color:#1e293b; color:#60a5fa; border-radius:8px; text-decoration:none; font-weight:500;">📎 Télécharger le fichier</a>`;
    }

    // URL générique -> lien cliquable
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color:#60a5fa; text-decoration:underline;">${cleanUrl}</a>`;
  });
}