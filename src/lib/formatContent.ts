// lib/formatContent.ts

/**
 * Transforme les URLs de documents en éléments visuels intégrés :
 * - Images -> <img>
 * - PDF -> <iframe> avec lien de secours
 * - Word, Excel, PowerPoint, archives -> liens de téléchargement
 * - Autres URLs -> liens cliquables
 */
export function formatContentWithImagesAndPdfs(content: string): string {
  if (!content) return '';

  const urlRegex = /(https?:\/\/[^\s"'<>]+)/g;

  return content.replace(urlRegex, (url) => {
    const cleanUrl = url.replace(/[.,;:]+$/, '');

    // Images
    if (/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(cleanUrl)) {
      return `<img src="${cleanUrl}" alt="Document" loading="lazy" style="max-width:100%; height:auto; border-radius:8px; margin:12px 0; display:block;" />`;
    }

    // PDF : lecture intégrée avec iframe + lien de secours
    if (/\.pdf(\?.*)?$/i.test(cleanUrl)) {
      return `
        <div style="margin:16px 0; border:1px solid #1e293b; border-radius:12px; overflow:hidden; background:#0f172a;">
          <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 16px; background:#1e293b;">
            <span style="color:#e2e8f0; font-weight:500;">📄 Aperçu du PDF</span>
            <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color:#60a5fa; text-decoration:underline; font-size:14px;">
              Ouvrir dans un nouvel onglet
            </a>
          </div>
          <iframe
            src="${cleanUrl}"
            style="width:100%; height:600px; border:none; display:block;"
            title="Aperçu PDF"
            loading="lazy"
          ></iframe>
        </div>
      `;
    }

    // Documents Word
    if (/\.(doc|docx)(\?.*)?$/i.test(cleanUrl)) {
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin:6px 0; padding:8px 16px; background-color:#1e293b; color:#60a5fa; border-radius:8px; text-decoration:none; font-weight:500;">📝 Télécharger le document Word</a>`;
    }

    // Excel
    if (/\.(xls|xlsx|csv)(\?.*)?$/i.test(cleanUrl)) {
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin:6px 0; padding:8px 16px; background-color:#1e293b; color:#60a5fa; border-radius:8px; text-decoration:none; font-weight:500;">📊 Télécharger le fichier Excel</a>`;
    }

    // PowerPoint
    if (/\.(ppt|pptx)(\?.*)?$/i.test(cleanUrl)) {
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin:6px 0; padding:8px 16px; background-color:#1e293b; color:#60a5fa; border-radius:8px; text-decoration:none; font-weight:500;">📑 Télécharger la présentation</a>`;
    }

    // Archives
    if (/\.(zip|rar|7z)(\?.*)?$/i.test(cleanUrl)) {
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin:6px 0; padding:8px 16px; background-color:#1e293b; color:#60a5fa; border-radius:8px; text-decoration:none; font-weight:500;">📦 Télécharger l'archive</a>`;
    }

    // Autres URLs : lien générique
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color:#60a5fa; text-decoration:underline;">${cleanUrl}</a>`;
  });
}