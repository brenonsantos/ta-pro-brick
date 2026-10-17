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

  // 2. Validação de URL do anúncio
  const currentUrl = window.location.href;
  const currentItemIdMatch = currentUrl.match(/marketplace\/item\/(\d+)/);
  const currentItemId = currentItemIdMatch ? currentItemIdMatch[1] : null;

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
    } catch (e) {}
  }

  // 4. Identifica o container exato do anúncio aberto (NUNCA a janela de Notificações)
  function findListingContainer() {
    // Procura em todos os dialogs abertos o que realmente é do anúncio
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    for (const d of dialogs) {
      const text = d.innerText || '';
      const h1Text = (d.querySelector('h1')?.innerText || '').toLowerCase();
      // Ignora caixas de notificação, mensagens ou cabeçalho do facebook
      if (h1Text.includes('notificaç') || h1Text.includes('mensagens') || h1Text.includes('chat')) {
        continue;
      }
      if (text.includes('Descrição do vendedor') || text.includes("Seller's description") || text.includes('Condição') || text.includes('R$')) {
        return d;
      }
    }

    // Se não estiver em um dialog, busca no role="main"
    const mains = Array.from(document.querySelectorAll('div[role="main"]'));
    for (const m of mains) {
      const text = m.innerText || '';
      if (text.includes('Descrição do vendedor') || text.includes("Seller's description") || text.includes('Condição') || text.includes('R$')) {
        return m;
      }
    }

    // Fallback geral
    return document.body;
  }

  const activeContainer = findListingContainer();
  expandTruncatedText(activeContainer);

  const containerText = activeContainer.innerText || document.body.innerText || '';

  // 5. Funções Extratoras

  // A. URL Limpa
  function extractCleanUrl() {
    return currentUrl.split('?')[0];
  }

  // B. Título do Carro (ignora menus como "Notificações")
  function extractTitle() {
    // 1. Procura primeiro H1 no container do anúncio
    const h1Candidates = Array.from(activeContainer.querySelectorAll('h1'))
      .concat(Array.from(document.querySelectorAll('h1')));

    for (const h of h1Candidates) {
      const text = h.innerText?.trim();
      if (
        text &&
        text.length > 2 &&
        !/^(notificaç|marketplace|facebook|mensagens|menu|pesquisar|amigos|feed|configuraç)/i.test(text)
      ) {
        return text;
      }
    }

    // 2. Meta og:title
    const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
    if (ogTitle) {
      const clean = ogTitle.replace(/\s*\|\s*Facebook.*$/i, '').replace(/^Facebook\s*Marketplace:\s*/i, '').trim();
      if (clean && !/notificaç|marketplace/i.test(clean)) return clean;
    }

    // 3. Document Title
    const docTitle = document.title.replace(/\s*\|\s*Facebook.*$/i, '').replace(/^Facebook\s*Marketplace:\s*/i, '').trim();
    if (docTitle && !/notificaç|marketplace/i.test(docTitle)) return docTitle;

    return 'Veículo sem título';
  }

  // C. Preço (ex: R$8.000 ou R$ 45.000)
  function extractPrice() {
    // 1. Procura em elementos específicos de texto
    const elements = Array.from(activeContainer.querySelectorAll('span, div, h2, h3'));
    for (const el of elements) {
      const txt = el.innerText?.trim();
      if (txt && /^R\$\s*[\d\.,]+$/i.test(txt)) {
        const parsed = parseInt(txt.replace(/[^\d]/g, ''), 10);
        if (!isNaN(parsed) && parsed > 500) {
          return parsed;
        }
      }
    }

    // 2. Procura no texto geral
    const match = containerText.match(/R\$\s*([\d\.]+)(?:,\d{2})?/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1].replace(/[^\d]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 500) {
        return parsed;
      }
    }

    return 0;
  }

  // D. Tempo Anunciado e Localização
  function extractTimeAndLocation() {
    // Padrão combinado: "Anunciado há 5 semanas em Ponta Grossa, PR"
    const combinedMatch = containerText.match(/(?:Anunciado|Publicado)\s+há\s+([^·\n\r]+?)\s+em\s+([^·\n\r]+)/i);
    let timePosted = 'Anunciado recentemente';
    let location = 'Brasil';

    if (combinedMatch) {
      timePosted = `Anunciado há ${combinedMatch[1].trim()}`;
      location = combinedMatch[2].trim();
      return { timePosted, location };
    }

    // Fallbacks individuais
    const timeMatch = containerText.match(/(?:Anunciado|Publicado|Listed)\s+há\s+([^·\n\r<]+)/i);
    if (timeMatch) {
      timePosted = (timeMatch[0] || '').trim();
    }

    const cityStatePattern = /([A-Za-zÀ-ÿ\s\.\-]+,\s*(?:AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO))/;
    const locMatch = containerText.match(cityStatePattern);
    if (locMatch) {
      location = locMatch[1].trim();
    }

    return { timePosted, location };
  }

  // E. Descrição Completa do Vendedor
  function extractDescription() {
    // 1. Procura bloco entre "Descrição do vendedor" e próxima seção
    const descMatch = containerText.match(/(?:Descrição do vendedor|Seller['']s description)([\s\S]+?)(?:Informações sobre o vendedor|Seller information|Localização aproximada|Detalhes do vendedor|Itens semelhantes|Classificados|$)/i);
    if (descMatch && descMatch[1]) {
      const desc = descMatch[1].trim();
      if (desc.length > 10) {
        return desc;
      }
    }

    // 2. Elementos com dir="auto"
    const autoDirs = Array.from(activeContainer.querySelectorAll('div[dir="auto"], span[dir="auto"]'));
    for (const el of autoDirs) {
      const text = el.innerText?.trim();
      if (text && text.length > 40 && !text.includes('Marketplace') && !text.includes('Messenger') && !text.includes('Cookies')) {
        return text;
      }
    }

    return 'Sem descrição fornecida pelo vendedor.';
  }

  // F. Fotos do Veículo
  function extractPhotos() {
    let images = Array.from(activeContainer.querySelectorAll('img'));
    if (images.length === 0 || images.every(img => img.naturalWidth < 100)) {
      images = Array.from(document.querySelectorAll('img'));
    }

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
      if (!src || !(src.includes('fbcdn.net') || src.includes('scontent'))) return;

      // Rejeita fotos dentro de links para OUTROS anúncios
      const parentLink = img.closest('a[href*="/marketplace/item/"]');
      if (parentLink && currentItemId) {
        const linkHref = parentLink.getAttribute('href') || '';
        if (!linkHref.includes(currentItemId)) {
          return;
        }
      }

      // Rejeita seções de recomendação
      const parentSection = img.closest('div, section');
      if (parentSection) {
        const sectionText = (parentSection.innerText || '').toLowerCase();
        if (
          sectionText.includes('itens semelhantes') ||
          sectionText.includes('mais deste vendedor') ||
          sectionText.includes('recomendações') ||
          sectionText.includes('patrocinado')
        ) {
          if (parentLink && !parentLink.getAttribute('href')?.includes(currentItemId || '')) {
            return;
          }
        }
      }

      // Filtra fotos de perfil, ícones e emojis
      const isAvatarOrIcon =
        src.includes('/rsrc.php/') ||
        src.includes('/emoji.php/') ||
        src.includes('p50x50') ||
        src.includes('p100x100') ||
        src.includes('150x150') ||
        src.includes('avatar') ||
        (img.alt && /perfil|profile|avatar|ícone|icon|emoji/i.test(img.alt));

      if (isAvatarOrIcon) return;
      if (img.naturalWidth > 0 && (img.naturalWidth < 100 || img.naturalHeight < 100)) return;

      const imgId = getImageId(src);
      if (!seenIds.has(imgId)) {
        seenIds.add(imgId);
        photoUrls.push(upgradeResolution(src));
      }
    });

    return photoUrls;
  }

  // 6. Monta o Objeto de Extração
  const timeAndLoc = extractTimeAndLocation();
  const extracted = {
    title: extractTitle(),
    price: extractPrice(),
    location: timeAndLoc.location,
    timePosted: timeAndLoc.timePosted,
    description: extractDescription(),
    originalUrl: extractCleanUrl(),
    photos: extractPhotos(),
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
    max-width: 620px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
    overflow: hidden;
  `;

  function renderModalContent() {
    const priceFormatted = extracted.price > 0 ? `R$ ${extracted.price.toLocaleString('pt-BR')}` : 'Não detectado';

    const photoThumbnails = extracted.photos.map((url, idx) => `
      <div style="position: relative; width: 68px; height: 68px; border-radius: 10px; overflow: hidden; background: #27272a; flex-shrink: 0; border: 1px solid #3f3f46;">
        <img src="${url}" style="width: 100%; height: 100%; object-fit: cover;" alt="Foto ${idx + 1}" />
        <span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.75); font-size: 9px; text-align: center; color: #f59e0b; font-weight: bold;">
          ${idx === 0 ? 'Capa' : '#' + (idx + 1)}
        </span>
        <button class="tpb-del-photo" data-idx="${idx}" style="position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: rgba(0,0,0,0.85); color: #fff; border: none; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
      </div>
    `).join('');

    modal.innerHTML = `
      <!-- Header -->
      <div style="padding: 16px 20px; border-bottom: 1px solid #27272a; display: flex; align-items: center; justify-content: space-between; background: #121215;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="background: #f59e0b; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; color: #000;">
            🧱
          </div>
          <div>
            <h2 style="margin: 0; font-size: 16px; font-weight: 800; color: #fafafa;">Anúncio Selecionado (1 por 1)</h2>
            <p style="margin: 0; font-size: 12px; color: #a1a1aa;">Pronto para importar no Tá pro Brick</p>
          </div>
        </div>
        <button id="tpb-close-btn" style="background: transparent; border: none; color: #a1a1aa; font-size: 20px; cursor: pointer; padding: 4px 8px;">✕</button>
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
          <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 10px; font-size: 12px; color: #d4d4d8; max-height: 110px; overflow-y: auto; white-space: pre-wrap; line-height: 1.4;">${extracted.description}</div>
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
        } catch (err) {
          const ta = document.createElement('textarea');
          ta.value = json;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        copyBtn.style.background = '#10b981';
        copyBtn.style.color = '#ffffff';
        copyBtn.innerHTML = '<span>✓</span> Copiado para a Área de Transferência!';
        setTimeout(() => {
          closeModal();
        }, 1200);
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
