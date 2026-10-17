/**
 * Tá pro Brick - Facebook Marketplace Hybrid Extractor
 * 
 * Standalone JavaScript utility to extract vehicle listing data directly
 * from Facebook Marketplace and format it for Tá pro Brick's admin curation panel.
 * 
 * Can be run directly in DevTools Console or installed as a Browser Bookmarklet.
 * Compatible with modern Chromium (Chrome/Edge/Brave), Firefox, and Safari.
 */

(function () {
  'use strict';

  // 1. Remove any previous instance of the extractor UI
  const existingOverlay = document.getElementById('tpb-extractor-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // 2. Expand truncated text (Click "Ver mais" / "See more" if present)
  function expandTruncatedText() {
    try {
      const buttons = Array.from(document.querySelectorAll('div[role="button"], span[role="button"]'));
      buttons.forEach((btn) => {
        const text = btn.innerText?.trim().toLowerCase();
        if (text === 'ver mais' || text === 'see more') {
          btn.click();
        }
      });
    } catch (e) {
      // Best effort, continue if click fails
    }
  }
  expandTruncatedText();

  // 3. Extraction Helper Functions

  // A. URL
  function extractOriginalUrl() {
    return window.location.href.split('?')[0];
  }

  // B. Title
  function extractTitle() {
    // Attempt 1: Main H1 tag inside the listing
    const h1 = document.querySelector('h1');
    if (h1 && h1.innerText && h1.innerText.trim().length > 3) {
      return h1.innerText.trim();
    }

    // Attempt 2: OpenGraph title meta tag
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && ogTitle.content) {
      const clean = ogTitle.content.replace(/\s*\|\s*Facebook.*$/i, '').trim();
      if (clean) return clean;
    }

    // Attempt 3: Document title fallback
    const docTitle = document.title.replace(/\s*\|\s*Facebook.*$/i, '').trim();
    return docTitle || 'Veículo sem título';
  }

  // C. Price
  function extractPrice(h1Element) {
    // Priority: Look in elements adjacent or close to H1
    if (h1Element) {
      const container = h1Element.closest('div[role="main"]') || h1Element.parentElement?.parentElement;
      if (container) {
        const spans = Array.from(container.querySelectorAll('span, div, h2, h3'));
        for (const el of spans) {
          const txt = el.innerText?.trim();
          if (txt && /^R\$\s*[\d\.,]+$/i.test(txt)) {
            const digitsOnly = txt.replace(/[^\d]/g, '');
            const parsed = parseInt(digitsOnly, 10);
            if (!isNaN(parsed) && parsed > 500) {
              return parsed;
            }
          }
        }
      }
    }

    // Fallback: Scan entire document for currency pattern
    const bodyText = document.body.innerText || '';
    const match = bodyText.match(/R\$\s*([\d\.]+)(?:,\d{2})?/i);
    if (match && match[1]) {
      const digitsOnly = match[1].replace(/[^\d]/g, '');
      const parsed = parseInt(digitsOnly, 10);
      if (!isNaN(parsed) && parsed > 500) {
        return parsed;
      }
    }

    return 0;
  }

  // D. Location
  function extractLocation() {
    // Brazilian State Acronyms
    const stateRegex = /\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/;
    const cityStatePattern = /([A-Za-zÀ-ÿ\s\.\-]+,\s*(?:AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO))/;

    // Look for approximate location label or text
    const elements = Array.from(document.querySelectorAll('span, div, p'));
    for (const el of elements) {
      const txt = el.innerText?.trim();
      if (!txt || txt.length > 80) continue;

      if (txt.includes('Localização aproximada') || txt.includes('Approximate location')) {
        const match = txt.match(cityStatePattern);
        if (match) return match[1].trim();
      }

      if (cityStatePattern.test(txt) && !txt.includes('\n')) {
        const match = txt.match(cityStatePattern);
        if (match && match[1].length < 50) {
          return match[1].trim();
        }
      }
    }

    return 'Brasil';
  }

  // E. Time Posted
  function extractTimePosted() {
    const timeRegex = /(?:Anunciado há|Publicado há|Listed)\s+([^·\n\r<]+)/i;
    const elements = Array.from(document.querySelectorAll('span, div'));

    for (const el of elements) {
      const txt = el.innerText?.trim();
      if (txt && (txt.includes('Anunciado há') || txt.includes('Publicado há') || txt.includes('Listed'))) {
        const match = txt.match(timeRegex);
        if (match) {
          return (match[0] || '').trim();
        }
        return txt;
      }
    }

    return 'Anunciado recentemente';
  }

  // F. Description
  function extractDescription() {
    const elements = Array.from(document.querySelectorAll('div, span, section'));
    
    // Look for heading "Descrição do vendedor" / "Seller's description"
    for (let i = 0; i < elements.length; i++) {
      const txt = elements[i].innerText?.trim().toLowerCase();
      if (txt === 'descrição do vendedor' || txt === "seller's description" || txt === 'detalhes do veículo') {
        const parent = elements[i].parentElement;
        if (parent) {
          const contentEl = parent.querySelector('div[dir="auto"], span[dir="auto"]') || parent.nextElementSibling;
          if (contentEl && contentEl.innerText) {
            const cleanText = contentEl.innerText.replace(/^(descrição do vendedor|seller's description)\s*/i, '').trim();
            if (cleanText.length > 5) return cleanText;
          }
        }
      }
    }

    // Fallback: search for dir="auto" elements with significant text content
    const autoDirs = Array.from(document.querySelectorAll('div[dir="auto"], span[dir="auto"]'));
    for (const el of autoDirs) {
      const text = el.innerText?.trim();
      if (text && text.length > 40 && (text.includes('\n') || text.length > 100)) {
        // Exclude system notices or navigation
        if (!text.includes('Marketplace') && !text.includes('Messenger') && !text.includes('Cookies')) {
          return text;
        }
      }
    }

    return 'Sem descrição fornecida pelo vendedor.';
  }

  // G. Photos
  function extractPhotos() {
    const images = Array.from(document.querySelectorAll('img'));
    const photoUrls = [];
    const seenIds = new Set();

    // Helper to upgrade thumbnail URLs to higher resolution
    function upgradeResolution(url) {
      try {
        let upgraded = url;
        // Replace small thumbnail sizes with larger ones
        upgraded = upgraded.replace(/_s\d+x\d+/, '_s960x960');
        upgraded = upgraded.replace(/_p\d+x\d+/, '_p720x720');
        return upgraded;
      } catch (e) {
        return url;
      }
    }

    // Helper to extract a unique image ID from FB CDN url to prevent duplicates
    function getImageId(url) {
      const match = url.match(/([a-zA-Z0-9_\-]+)\.(?:jpg|jpeg|png|webp)/i);
      return match ? match[1] : url.split('?')[0];
    }

    images.forEach((img) => {
      const src = img.src || img.getAttribute('data-src') || '';
      if (!src) return;

      // Filter: Must be from Facebook CDN
      const isFbCdn = src.includes('fbcdn.net') || src.includes('scontent');
      if (!isFbCdn) return;

      // Filter: Reject UI icons, emojis, badges, and user avatars
      const isAvatarOrIcon = 
        src.includes('/rsrc.php/') ||
        src.includes('/emoji.php/') ||
        src.includes('p50x50') ||
        src.includes('p100x100') ||
        src.includes('150x150') ||
        src.includes('avatar') ||
        (img.alt && /perfil|profile|avatar|ícone|icon|emoji/i.test(img.alt));

      if (isAvatarOrIcon) return;

      // Filter: Reject tiny icon dimensions if already loaded
      if (img.naturalWidth > 0 && (img.naturalWidth < 120 || img.naturalHeight < 120)) {
        return;
      }

      const imgId = getImageId(src);
      if (!seenIds.has(imgId)) {
        seenIds.add(imgId);
        photoUrls.push(upgradeResolution(src));
      }
    });

    return photoUrls;
  }

  // 4. Run Extraction
  const h1El = document.querySelector('h1');
  const extractedData = {
    title: extractTitle(),
    price: extractPrice(h1El),
    location: extractLocation(),
    timePosted: extractTimePosted(),
    description: extractDescription(),
    originalUrl: extractOriginalUrl(),
    photos: extractPhotos(),
    authorizationNotes: 'Anúncio verificado no Facebook Marketplace'
  };

  // 5. Create Modern UI Overlay (Matching Tá pro Brick zinc/amber styling)
  const overlay = document.createElement('div');
  overlay.id = 'tpb-extractor-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(9, 9, 11, 0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 9999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #f4f4f5;
    padding: 16px;
    box-sizing: border-box;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: #18181b;
    border: 1px solid #3f3f46;
    border-radius: 16px;
    width: 100%;
    max-width: 620px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    overflow: hidden;
  `;

  // Format currency preview
  const formattedPrice = extractedData.price > 0
    ? `R$ ${extractedData.price.toLocaleString('pt-BR')}`
    : 'Não detectado';

  // Build Thumbnail strip
  const photoThumbnailsHtml = extractedData.photos.slice(0, 6).map((url) => `
    <div style="width: 56px; height: 56px; border-radius: 8px; overflow: hidden; background: #27272a; flex-shrink: 0; border: 1px solid #3f3f46;">
      <img src="${url}" style="width: 100%; height: 100%; object-fit: cover;" alt="Foto" />
    </div>
  `).join('');

  modal.innerHTML = `
    <!-- Header -->
    <div style="padding: 16px 20px; border-bottom: 1px solid #27272a; display: flex; align-items: center; justify-content: space-between; background: #121215;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="background: #f59e0b; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; color: #000;">
          🧱
        </div>
        <div>
          <h2 style="margin: 0; font-size: 16px; font-weight: 700; color: #fafafa;">Tá pro Brick &bull; Extrator de Anúncio</h2>
          <p style="margin: 0; font-size: 12px; color: #a1a1aa;">Facebook Marketplace para Curadoria</p>
        </div>
      </div>
      <button id="tpb-close-btn" style="background: transparent; border: none; color: #a1a1aa; font-size: 20px; cursor: pointer; padding: 4px 8px; border-radius: 6px;">✕</button>
    </div>

    <!-- Content -->
    <div style="padding: 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- Key Data Preview Card -->
      <div style="background: #27272a; border: 1px solid #3f3f46; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
          <div style="flex: 1;">
            <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #f59e0b; letter-spacing: 0.5px;">Título do Anúncio</span>
            <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-top: 2px;">${extractedData.title}</div>
          </div>
          <div style="text-align: right; background: #18181b; padding: 6px 12px; border-radius: 8px; border: 1px solid #3f3f46;">
            <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #a1a1aa;">Preço</span>
            <div style="font-size: 16px; font-weight: 800; color: #34d399;">${formattedPrice}</div>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; color: #d4d4d8;">
          <span style="background: #18181b; padding: 4px 8px; border-radius: 6px; border: 1px solid #3f3f46;">
            📍 ${extractedData.location}
          </span>
          <span style="background: #18181b; padding: 4px 8px; border-radius: 6px; border: 1px solid #3f3f46;">
            ⏱️ ${extractedData.timePosted}
          </span>
          <span style="background: #18181b; padding: 4px 8px; border-radius: 6px; border: 1px solid #3f3f46;">
            📷 ${extractedData.photos.length} fotos detectadas
          </span>
        </div>
      </div>

      <!-- Photos Strip Preview -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 12px; font-weight: 600; color: #a1a1aa;">Fotos Extraídas (${extractedData.photos.length})</span>
          <span style="font-size: 11px; color: #71717a;">Dica: passe pelo carrossel antes de extrair</span>
        </div>
        <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px;">
          ${photoThumbnailsHtml || '<div style="font-size: 12px; color: #ef4444;">Nenhuma foto detectada no carrossel.</div>'}
          ${extractedData.photos.length > 6 ? `<div style="width: 56px; height: 56px; border-radius: 8px; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #a1a1aa; flex-shrink: 0; border: 1px solid #3f3f46;">+${extractedData.photos.length - 6}</div>` : ''}
        </div>
      </div>

      <!-- Description Preview -->
      <div>
        <div style="font-size: 12px; font-weight: 600; color: #a1a1aa; margin-bottom: 6px;">Descrição do Anúncio</div>
        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 10px; font-size: 12px; color: #d4d4d8; max-height: 100px; overflow-y: auto; white-space: pre-wrap; line-height: 1.4;">${extractedData.description}</div>
      </div>

      <!-- JSON Preview Collapsible -->
      <div>
        <details style="background: #121215; border: 1px solid #27272a; border-radius: 8px; padding: 8px 12px;">
          <summary style="font-size: 12px; font-weight: 600; color: #a1a1aa; cursor: pointer; user-select: none;">
            Ver JSON Completo (compatível com Admin do Tá pro Brick)
          </summary>
          <pre style="margin-top: 10px; font-family: monospace; font-size: 11px; color: #a1a1aa; background: #09090b; padding: 10px; border-radius: 6px; overflow-x: auto; max-height: 120px;">${JSON.stringify(extractedData, null, 2)}</pre>
        </details>
      </div>

    </div>

    <!-- Footer Actions -->
    <div style="padding: 16px 20px; border-top: 1px solid #27272a; background: #121215; display: flex; gap: 12px; justify-content: flex-end; align-items: center;">
      <button id="tpb-cancel-btn" style="background: #27272a; border: 1px solid #3f3f46; color: #e4e4e7; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;">
        Fechar
      </button>
      <button id="tpb-copy-btn" style="background: #f59e0b; border: none; color: #18181b; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;">
        <span>📋</span> Copiar JSON para o Tá pro Brick
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Animate Entrance
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });

  // UI Event Handlers
  function closeModal() {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
    }, 200);
  }

  document.getElementById('tpb-close-btn').addEventListener('click', closeModal);
  document.getElementById('tpb-cancel-btn').addEventListener('click', closeModal);

  // Close when clicking outside modal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Copy Action
  const copyBtn = document.getElementById('tpb-copy-btn');
  copyBtn.addEventListener('click', async () => {
    try {
      const jsonStr = JSON.stringify(extractedData, null, 2);
      await navigator.clipboard.writeText(jsonStr);

      copyBtn.style.background = '#10b981';
      copyBtn.style.color = '#ffffff';
      copyBtn.innerHTML = '<span>✓</span> Copiado para a Área de Transferência!';

      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      console.error('Falha ao copiar JSON:', err);
      // Fallback if clipboard API is restricted
      const textarea = document.createElement('textarea');
      textarea.value = JSON.stringify(extractedData, null, 2);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      copyBtn.style.background = '#10b981';
      copyBtn.style.color = '#ffffff';
      copyBtn.innerHTML = '<span>✓</span> Copiado com fallback!';

      setTimeout(() => {
        closeModal();
      }, 1500);
    }
  });

  console.log('✅ Tá pro Brick: Dados extraídos com sucesso!', extractedData);
})();
