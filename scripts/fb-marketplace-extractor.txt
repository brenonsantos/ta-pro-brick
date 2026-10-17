/**
 * Tá pro Brick - Extrator de Anúncio Individual do Facebook Marketplace
 * 
 * Modo 1 por 1: O curador navega no Marketplace, abre a página de UM anúncio específico
 * e roda este script para extrair exclusivamente os dados e fotos desse carro.
 */

(function () {
  'use strict';

  // 1. Remove qualquer janela anterior do extrator
  const existingOverlay = document.getElementById('tpb-extractor-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // 2. Validação: Certifica-se de que o usuário está na página de UM anúncio específico
  const currentUrl = window.location.href;
  const isItemPage = currentUrl.includes('/marketplace/item/');
  const currentItemIdMatch = currentUrl.match(/marketplace\/item\/(\d+)/);
  const currentItemId = currentItemIdMatch ? currentItemIdMatch[1] : null;

  if (!isItemPage && !document.querySelector('div[role="dialog"]')) {
    alert(
      '⚠️ Tá pro Brick Extrator:\n\n' +
      'Você ainda está na lista geral de anúncios!\n\n' +
      '👉 Clique primeiro no anúncio do carro que você escolheu para abrir os detalhes dele (fotos grandes, preço e descrição) e aí sim clique no Extrator.'
    );
    return;
  }

  // 3. Expande texto truncado do anúncio ("Ver mais" / "See more")
  function expandTruncatedText(container) {
    try {
      const buttons = Array.from(container.querySelectorAll('div[role="button"], span[role="button"]'));
      buttons.forEach((btn) => {
        const text = btn.innerText?.trim().toLowerCase();
        if (text === 'ver mais' || text === 'see more') {
          btn.click();
        }
      });
    } catch (e) {
      // Continue se o clique falhar
    }
  }

  // 4. Identifica o container exato do anúncio aberto (Modal dialog ou Coluna principal)
  const dialogEl = document.querySelector('div[role="dialog"]');
  const mainEl = document.querySelector('div[role="main"]');
  const activeContainer = dialogEl || mainEl || document.body;

  expandTruncatedText(activeContainer);

  // 5. Funções Extratoras Escopadas (Apenas deste anúncio)

  // A. URL Limpa
  function extractCleanUrl() {
    return currentUrl.split('?')[0];
  }

  // B. Título
  function extractTitle() {
    // Busca o H1 do anúncio aberto
    const h1 = activeContainer.querySelector('h1');
    if (h1 && h1.innerText && h1.innerText.trim().length > 3) {
      return h1.innerText.trim();
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && ogTitle.content) {
      const clean = ogTitle.content.replace(/\s*\|\s*Facebook.*$/i, '').trim();
      if (clean) return clean;
    }

    const docTitle = document.title.replace(/\s*\|\s*Facebook.*$/i, '').trim();
    return docTitle || 'Veículo sem título';
  }

  // C. Preço
  function extractPrice(h1El) {
    if (h1El) {
      // Procura primeiro perto do título no container de detalhes
      const parent = h1El.parentElement?.parentElement || activeContainer;
      const spans = Array.from(parent.querySelectorAll('span, div, h2, h3'));
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

    // Fallback: busca padrão R$ dentro do container do anúncio
    const containerText = activeContainer.innerText || '';
    const match = containerText.match(/R\$\s*([\d\.]+)(?:,\d{2})?/i);
    if (match && match[1]) {
      const digitsOnly = match[1].replace(/[^\d]/g, '');
      const parsed = parseInt(digitsOnly, 10);
      if (!isNaN(parsed) && parsed > 500) {
        return parsed;
      }
    }

    return 0;
  }

  // D. Localização
  function extractLocation() {
    const cityStatePattern = /([A-Za-zÀ-ÿ\s\.\-]+,\s*(?:AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO))/;
    const elements = Array.from(activeContainer.querySelectorAll('span, div, p'));

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

  // E. Tempo de Publicação
  function extractTimePosted() {
    const timeRegex = /(?:Anunciado há|Publicado há|Listed)\s+([^·\n\r<]+)/i;
    const elements = Array.from(activeContainer.querySelectorAll('span, div'));

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

  // F. Descrição
  function extractDescription() {
    const elements = Array.from(activeContainer.querySelectorAll('div, span, section'));

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

    // Fallback: procura elemento com dir="auto" com texto longo no container do anúncio
    const autoDirs = Array.from(activeContainer.querySelectorAll('div[dir="auto"], span[dir="auto"]'));
    for (const el of autoDirs) {
      const text = el.innerText?.trim();
      if (text && text.length > 30 && (text.includes('\n') || text.length > 80)) {
        if (!text.includes('Marketplace') && !text.includes('Messenger') && !text.includes('Cookies')) {
          return text;
        }
      }
    }

    return 'Sem descrição fornecida pelo vendedor.';
  }

  // G. Fotos (EXCLUSIVAMENTE DESTE CARRO)
  function extractPhotos() {
    const images = Array.from(activeContainer.querySelectorAll('img'));
    let photoUrls = [];
    const seenIds = new Set();

    function upgradeResolution(url) {
      try {
        let upgraded = url;
        upgraded = upgraded.replace(/_s\d+x\d+/, '_s960x960');
        upgraded = upgraded.replace(/_p\d+x\d+/, '_p720x720');
        return upgraded;
      } catch (e) {
        return url;
      }
    }

    function getImageId(url) {
      const match = url.match(/([a-zA-Z0-9_\-]+)\.(?:jpg|jpeg|png|webp)/i);
      return match ? match[1] : url.split('?')[0];
    }

    images.forEach((img) => {
      const src = img.src || img.getAttribute('data-src') || '';
      if (!src) return;

      // 1. Deve ser CDN do Facebook
      const isFbCdn = src.includes('fbcdn.net') || src.includes('scontent');
      if (!isFbCdn) return;

      // 2. CRUCIAL: Se a foto estiver dentro de um link para OUTRO anúncio, rejeita!
      const parentLink = img.closest('a[href*="/marketplace/item/"]');
      if (parentLink && currentItemId) {
        const linkHref = parentLink.getAttribute('href') || '';
        if (!linkHref.includes(currentItemId)) {
          return; // Foto pertence a outro anúncio recomendado!
        }
      }

      // 3. Rejeita se estiver dentro de seções de recomendação
      const parentSection = img.closest('div, section');
      if (parentSection) {
        const sectionText = (parentSection.innerText || '').toLowerCase();
        if (
          sectionText.includes('itens semelhantes') ||
          sectionText.includes('mais deste vendedor') ||
          sectionText.includes('recomendações') ||
          sectionText.includes('patrocinado')
        ) {
          // Apenas se o link não for do item atual
          if (parentLink && !parentLink.getAttribute('href')?.includes(currentItemId || '')) {
            return;
          }
        }
      }

      // 4. Rejeita ícones, avatares e emojis
      const isAvatarOrIcon = 
        src.includes('/rsrc.php/') ||
        src.includes('/emoji.php/') ||
        src.includes('p50x50') ||
        src.includes('p100x100') ||
        src.includes('150x150') ||
        src.includes('avatar') ||
        (img.alt && /perfil|profile|avatar|ícone|icon|emoji/i.test(img.alt));

      if (isAvatarOrIcon) return;

      // 5. Rejeita imagens muito pequenas se já estiverem renderizadas
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

  // 6. Executa a extração deste anúncio único
  const h1El = activeContainer.querySelector('h1');
  let currentPhotos = extractPhotos();
  
  const extracted = {
    title: extractTitle(),
    price: extractPrice(h1El),
    location: extractLocation(),
    timePosted: extractTimePosted(),
    description: extractDescription(),
    originalUrl: extractCleanUrl(),
    photos: currentPhotos,
    authorizationNotes: 'Anúncio verificado no Facebook Marketplace',
  };

  // 7. Modal Flutuante com interface do Tá pro Brick
  const overlay = document.createElement('div');
  overlay.id = 'tpb-extractor-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(9, 9, 11, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 9999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #f4f4f5;
    padding: 16px;
    box-sizing: border-box;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: #18181b;
    border: 1px solid #3f3f46;
    border-radius: 18px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
    overflow: hidden;
  `;

  function renderModalContent() {
    const priceFormatted = extracted.price > 0 ? `R$ ${extracted.price.toLocaleString('pt-BR')}` : 'Não detectado';

    const photoThumbnails = extracted.photos.map((url, idx) => `
      <div style="position: relative; width: 64px; height: 64px; border-radius: 10px; overflow: hidden; background: #27272a; flex-shrink: 0; border: 1px solid #3f3f46;">
        <img src="${url}" style="width: 100%; height: 100%; object-fit: cover;" alt="Foto ${idx + 1}" />
        <span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.75); font-size: 9px; text-align: center; color: #f59e0b; font-weight: bold;">
          ${idx === 0 ? 'Capa' : `#${idx + 1}`}
        </span>
        <button class="tpb-del-photo" data-idx="${idx}" style="position: absolute; top: 2px; right: 2px; width: 16px; height: 16px; border-radius: 50%; background: rgba(0,0,0,0.8); color: #fff; border: none; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
      </div>
    `).join('');

    modal.innerHTML = `
      <!-- Header -->
      <div style="padding: 16px 20px; border-bottom: 1px solid #27272a; display: flex; align-items: center; justify-content: space-between; background: #121215;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="background: #f59e0b; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; color: #000;">
            🧱
          </div>
          <div>
            <h2 style="margin: 0; font-size: 16px; font-weight: 800; color: #fafafa;">Anúncio Selecionado (1 por 1)</h2>
            <p style="margin: 0; font-size: 12px; color: #a1a1aa;">Pronto para importar no Tá pro Brick</p>
          </div>
        </div>
        <button id="tpb-close-btn" style="background: transparent; border: none; color: #a1a1aa; font-size: 20px; cursor: pointer; padding: 4px 8px; border-radius: 6px;">✕</button>
      </div>

      <!-- Content -->
      <div style="padding: 18px 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px;">
        <!-- Card Resumo -->
        <div style="background: #27272a; border: 1px solid #3f3f46; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
            <div style="flex: 1;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #f59e0b; letter-spacing: 0.5px;">Carro Selecionado</span>
              <div style="font-size: 15px; font-weight: 700; color: #ffffff; margin-top: 2px;">${extracted.title}</div>
            </div>
            <div style="text-align: right; background: #18181b; padding: 6px 12px; border-radius: 8px; border: 1px solid #3f3f46;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #a1a1aa;">Preço</span>
              <div style="font-size: 16px; font-weight: 800; color: #34d399;">${priceFormatted}</div>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; color: #d4d4d8; margin-top: 4px;">
            <span style="background: #18181b; padding: 3px 8px; border-radius: 6px; border: 1px solid #3f3f46;">📍 ${extracted.location}</span>
            <span style="background: #18181b; padding: 3px 8px; border-radius: 6px; border: 1px solid #3f3f46;">⏱️ ${extracted.timePosted}</span>
            <span style="background: #18181b; padding: 3px 8px; border-radius: 6px; border: 1px solid #3f3f46;">📸 ${extracted.photos.length} fotos</span>
          </div>
        </div>

        <!-- Fotos -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 700; color: #e4e4e7;">Fotos do Veículo (${extracted.photos.length})</span>
            <span style="font-size: 11px; color: #71717a;">Clique no ✕ para remover fotos indesejadas</span>
          </div>
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px;">
            ${photoThumbnails || '<div style="font-size: 12px; color: #ef4444;">Nenhuma foto encontrada. Avance o carrossel no anúncio e tente novamente.</div>'}
          </div>
        </div>

        <!-- Descrição -->
        <div>
          <div style="font-size: 12px; font-weight: 700; color: #e4e4e7; margin-bottom: 6px;">Descrição do Anúncio</div>
          <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 10px; font-size: 12px; color: #d4d4d8; max-height: 90px; overflow-y: auto; white-space: pre-wrap; line-height: 1.4;">${extracted.description}</div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div style="padding: 16px 20px; border-top: 1px solid #27272a; background: #121215; display: flex; gap: 10px; justify-content: flex-end; align-items: center;">
        <button id="tpb-cancel-btn" style="background: #27272a; border: 1px solid #3f3f46; color: #e4e4e7; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
          Fechar
        </button>
        <button id="tpb-copy-btn" style="background: #f59e0b; border: none; color: #18181b; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <span>📋</span> Copiar JSON do Carro
        </button>
      </div>
    `;

    // Listeners do modal
    const closeBtn = modal.querySelector('#tpb-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const cancelBtn = modal.querySelector('#tpb-cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Remoção individual de foto
    modal.querySelectorAll('.tpb-del-photo').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        extracted.photos.splice(idx, 1);
        renderModalContent();
      });
    });

    // Copiar para clipboard
    const copyBtn = modal.querySelector('#tpb-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const json = JSON.stringify(extracted, null, 2);
        try {
          await navigator.clipboard.writeText(json);
          copyBtn.style.background = '#10b981';
          copyBtn.style.color = '#ffffff';
          copyBtn.innerHTML = '<span>✓</span> Copiado para a Área de Transferência!';
          setTimeout(() => {
            closeModal();
          }, 1200);
        } catch (err) {
          const ta = document.createElement('textarea');
          ta.value = json;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copyBtn.style.background = '#10b981';
          copyBtn.style.color = '#ffffff';
          copyBtn.innerHTML = '<span>✓</span> Copiado!';
          setTimeout(() => {
            closeModal();
          }, 1200);
        }
      });
    }
  }

  function closeModal() {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
    }, 150);
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  renderModalContent();
})();
