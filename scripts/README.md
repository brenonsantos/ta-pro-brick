# Tá pro Brick &bull; Extrator Híbrido do Facebook Marketplace

Utilitário client-side desenvolvido para a curadoria do jogo **Tá pro Brick**, permitindo extrair dados completos de anúncios de veículos no **Facebook Marketplace** com 1 clique diretamente do navegador autenticado do curador.

---

## 💡 Por que uma Abordagem Híbrida (Client-Side / Bookmarklet)?

Scrapers tradicionais de servidor (*headless crawlers* como Puppeteer ou requisições `curl`) enfrentam bloqueios severos ao acessar o Facebook Marketplace:
- Bloqueio por CAPTCHA, Cloudflare/Akamai e tela de login obrigatória.
- Banimento de IP e fingerprinting de bots.
- Impossibilidade de acessar detalhes sem uma sessão humana ativa.

Com o **Extrator Híbrido do Tá pro Brick**:
1. O curador navega normalmente no Facebook Marketplace com sua conta de usuário.
2. Ao encontrar um veículo interessante, executa o extrator (via **Bookmarklet** ou **Console do DevTools**).
3. O script lê a árvore DOM já renderizada e autenticada, expande textos truncados ("Ver mais"), detecta as fotos em alta resolução no carrossel e normaliza o preço em Reais (`BRL`).
4. Uma janela flutuante moderna (no estilo dark-zinc do Tá pro Brick) exibe a prévia dos dados e permite copiar o JSON formatado pronto para o painel administrativo (`/admin`).

---

## 📋 Dados Extraídos e Formato JSON

O extrator gera um payload JSON 100% compatível com a interface `AdminChallengeInput` do Tá pro Brick:

```json
{
  "title": "Volkswagen Gol 1.6 MSI TotalFlex 2018",
  "price": 45000,
  "location": "Curitiba, PR",
  "timePosted": "Anunciado há 3 dias",
  "description": "Gol 1.6 MSI 2018 completo, ar condicionado, direção hidráulica, vidros elétricos nas 4 portas, revisado recentemente.",
  "originalUrl": "https://www.facebook.com/marketplace/item/123456789012345/",
  "photos": [
    "https://scontent.fbfh15-1.fna.fbcdn.net/v/t39.30808-6/...",
    "https://scontent.fbfh15-1.fna.fbcdn.net/v/t39.30808-6/..."
  ],
  "authorizationNotes": "Anúncio verificado no Facebook Marketplace"
}
```

### Heurísticas de Extração Resilientes:
- **Título**: Prioriza o `<h1>` principal do anúncio, recorrendo à meta tag `og:title` ou ao `document.title` limpo.
- **Preço**: Varre elementos ao redor do título buscando o padrão monetário brasileiro (`R$ 44.900`), convertendo com segurança para número inteiro puro (`44900`).
- **Localização**: Identifica municípios e siglas de estados brasileiros (`Curitiba, PR`, `São Paulo, SP`, etc.) ou blocos de "Localização aproximada".
- **Tempo Anunciado**: Detecta padrões como `"Anunciado há 2 dias"` ou `"Publicado há..."`.
- **Descrição**: Localiza o bloco de texto após `"Descrição do vendedor"` e clica automaticamente em botões como `"Ver mais"` / `"See more"` para obter o texto integral sem cortes.
- **Fotos do Veículo**:
  - Filtra e ignora fotos de perfil de usuários, avatares, ícones de interface e emojis.
  - Elimina duplicatas baseando-se no ID único das fotos da CDN do Facebook (`fbcdn.net` / `scontent`).
  - Eleva resoluções de miniaturas (ex: atualiza parâmetros de tamanho para versões de alta fidelidade).

---

## 🚀 Como Usar

### Opção 1: Bookmarklet (Favorito do Navegador) — *Recomendado*

O Bookmarklet fica salvo na sua barra de favoritos. Basta 1 clique enquanto estiver na página do anúncio.

#### Passo a Passo para Instalação:
1. Abra seu navegador (Chrome, Edge, Brave, Firefox ou Safari).
2. Certifique-se de que a **Barra de Favoritos** está visível (`Ctrl+Shift+B` no Windows/Linux ou `Cmd+Shift+B` no macOS).
3. Clique com o botão direito na barra de favoritos e selecione **Adicionar página...** (ou *Adicionar aos favoritos*).
4. No campo **Nome**, digite:
   ```text
   🧱 Extrair Tá pro Brick
   ```
5. No campo **URL** (ou *Endereço*), cole o código do bookmarklet abaixo (ou o conteúdo de `scripts/fb-marketplace-bookmarklet.txt`):

```javascript
javascript:(function(){"use strict";const u=document.getElementById("tpb-extractor-overlay");u&&u.remove();function b(){try{Array.from(document.querySelectorAll('div[role="button"], span[role="button"]')).forEach(r=>{const a=r.innerText?.trim().toLowerCase();(a==="ver mais"||a==="see more")&&r.click()})}catch{}}b();function g(){return window.location.href.split("?")[0]}function y(){const o=document.querySelector("h1");if(o&&o.innerText&&o.innerText.trim().length>3)return o.innerText.trim();const r=document.querySelector('meta[property="og:title"]');if(r&&r.content){const e=r.content.replace(/\s*\|\s*Facebook.*$/i,"").trim();if(e)return e}return document.title.replace(/\s*\|\s*Facebook.*$/i,"").trim()||"Ve\xEDculo sem t\xEDtulo"}function h(o){if(o){const e=o.closest('div[role="main"]')||o.parentElement?.parentElement;if(e){const i=Array.from(e.querySelectorAll("span, div, h2, h3"));for(const n of i){const t=n.innerText?.trim();if(t&&/^R\$\s*[\d\.,]+$/i.test(t)){const x=t.replace(/[^\d]/g,""),p=parseInt(x,10);if(!isNaN(p)&&p>500)return p}}}}const a=(document.body.innerText||"").match(/R\$\s*([\d\.]+)(?:,\d{2})?/i);if(a&&a[1]){const e=a[1].replace(/[^\d]/g,""),i=parseInt(e,10);if(!isNaN(i)&&i>500)return i}return 0}function v(){const o=/\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/,r=/([A-Za-zÀ-ÿ\s\.\-]+,\s*(?:AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO))/,a=Array.from(document.querySelectorAll("span, div, p"));for(const e of a){const i=e.innerText?.trim();if(!(!i||i.length>80)){if(i.includes("Localiza\xE7\xE3o aproximada")||i.includes("Approximate location")){const n=i.match(r);if(n)return n[1].trim()}if(r.test(i)&&!i.includes("\n")){const n=i.match(r);if(n&&n[1].length<50)return n[1].trim()}}}return"Brasil"}function m(){const o=/(?:Anunciado h\xE1|Publicado h\xE1|Listed)\s+([^·\n\r<]+)/i,r=Array.from(document.querySelectorAll("span, div"));for(const a of r){const e=a.innerText?.trim();if(e&&(e.includes("Anunciado h\xE1")||e.includes("Publicado h\xE1")||e.includes("Listed"))){const i=e.match(o);return i?(i[0]||"").trim():e}}return"Anunciado recentemente"}function f(){const o=Array.from(document.querySelectorAll("div, span, section"));for(let a=0;a<o.length;a++){const e=o[a].innerText?.trim().toLowerCase();if(e==="descri\xE7\xE3o do vendedor"||e==="seller's description"||e==="detalhes do ve\xEDculo"){const i=o[a].parentElement;if(i){const n=i.querySelector('div[dir="auto"], span[dir="auto"]')||i.nextElementSibling;if(n&&n.innerText){const t=n.innerText.replace(/^(descrição do vendedor|seller's description)\s*/i,"").trim();if(t.length>5)return t}}}}const r=Array.from(document.querySelectorAll('div[dir="auto"], span[dir="auto"]'));for(const a of r){const e=a.innerText?.trim();if(e&&e.length>40&&(e.includes("\n")||e.length>100)&&!e.includes("Marketplace")&&!e.includes("Messenger")&&!e.includes("Cookies"))return e}return"Sem descri\xE7\xE3o fornecida pelo vendedor."}function c(){const o=Array.from(document.querySelectorAll("img")),r=[],a=new Set;function e(n){try{let t=n;return t=t.replace(/_s\d+x\d+/,"_s960x960"),t=t.replace(/_p\d+x\d+/,"_p720x720"),t}catch{return n}}function i(n){const t=n.match(/([a-zA-Z0-9_\-]+)\.(?:jpg|jpeg|png|webp)/i);return t?t[1]:n.split("?")[0]}return o.forEach(n=>{const t=n.src||n.getAttribute("data-src")||"";if(!t||!(t.includes("fbcdn.net")||t.includes("scontent"))||t.includes("/rsrc.php/")||t.includes("/emoji.php/")||t.includes("p50x50")||t.includes("p100x100")||t.includes("150x150")||t.includes("avatar")||n.alt&&/perfil|profile|avatar|ícone|icon|emoji/i.test(n.alt)||n.naturalWidth>0&&(n.naturalWidth<120||n.naturalHeight<120))return;const x=i(t);a.has(x)||(a.add(x),r.push(e(t)))}),r}const w=document.querySelector("h1"),d={title:y(),price:h(w),location:v(),timePosted:m(),description:f(),originalUrl:g(),photos:c(),authorizationNotes:"An\xFAncio verificado no Facebook Marketplace"},s=document.createElement("div");s.id="tpb-extractor-overlay";s.style.cssText=`
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
  `;const l=document.createElement("div");l.style.cssText=`
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
  `;const p=d.price>0?`R$ ${d.price.toLocaleString("pt-BR")}`:"N\xE3o detectado",k=d.photos.slice(0,6).map(o=>`
    <div style="width: 56px; height: 56px; border-radius: 8px; overflow: hidden; background: #27272a; flex-shrink: 0; border: 1px solid #3f3f46;">
      <img src="${o}" style="width: 100%; height: 100%; object-fit: cover;" alt="Foto" />
    </div>
  `).join("");l.innerHTML=`
    <!-- Header -->
    <div style="padding: 16px 20px; border-bottom: 1px solid #27272a; display: flex; align-items: center; justify-content: space-between; background: #121215;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="background: #f59e0b; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; color: #000;">
          \u{1F9F1}
        </div>
        <div>
          <h2 style="margin: 0; font-size: 16px; font-weight: 700; color: #fafafa;">T\xE1 pro Brick &bull; Extrator de An\xFAncio</h2>
          <p style="margin: 0; font-size: 12px; color: #a1a1aa;">Facebook Marketplace para Curadoria</p>
        </div>
      </div>
      <button id="tpb-close-btn" style="background: transparent; border: none; color: #a1a1aa; font-size: 20px; cursor: pointer; padding: 4px 8px; border-radius: 6px;">\u2715</button>
    </div>

    <!-- Content -->
    <div style="padding: 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- Key Data Preview Card -->
      <div style="background: #27272a; border: 1px solid #3f3f46; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
          <div style="flex: 1;">
            <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #f59e0b; letter-spacing: 0.5px;">T\xEDtulo do An\xFAncio</span>
            <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-top: 2px;">${d.title}</div>
          </div>
          <div style="text-align: right; background: #18181b; padding: 6px 12px; border-radius: 8px; border: 1px solid #3f3f46;">
            <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #a1a1aa;">Pre\xE7o</span>
            <div style="font-size: 16px; font-weight: 800; color: #34d399;">${p}</div>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; color: #d4d4d8;">
          <span style="background: #18181b; padding: 4px 8px; border-radius: 6px; border: 1px solid #3f3f46;">
            \u{1F4CD} ${d.location}
          </span>
          <span style="background: #18181b; padding: 4px 8px; border-radius: 6px; border: 1px solid #3f3f46;">
            \u23F1\uFE0F ${d.timePosted}
          </span>
          <span style="background: #18181b; padding: 4px 8px; border-radius: 6px; border: 1px solid #3f3f46;">
            \u{1F4F7} ${d.photos.length} fotos detectadas
          </span>
        </div>
      </div>

      <!-- Photos Strip Preview -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 12px; font-weight: 600; color: #a1a1aa;">Fotos Extra\xEDdas (${d.photos.length})</span>
          <span style="font-size: 11px; color: #71717a;">Dica: passe pelo carrossel antes de extrair</span>
        </div>
        <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px;">
          ${k||'<div style="font-size: 12px; color: #ef4444;">Nenhuma foto detectada no carrossel.</div>'}
          ${d.photos.length>6?`<div style="width: 56px; height: 56px; border-radius: 8px; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #a1a1aa; flex-shrink: 0; border: 1px solid #3f3f46;">+${d.photos.length-6}</div>`:""}
        </div>
      </div>

      <!-- Description Preview -->
      <div>
        <div style="font-size: 12px; font-weight: 600; color: #a1a1aa; margin-bottom: 6px;">Descri\xE7\xE3o do An\xFAncio</div>
        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 10px; font-size: 12px; color: #d4d4d8; max-height: 100px; overflow-y: auto; white-space: pre-wrap; line-height: 1.4;">${d.description}</div>
      </div>

      <!-- JSON Preview Collapsible -->
      <div>
        <details style="background: #121215; border: 1px solid #27272a; border-radius: 8px; padding: 8px 12px;">
          <summary style="font-size: 12px; font-weight: 600; color: #a1a1aa; cursor: pointer; user-select: none;">
            Ver JSON Completo (compat\xEDvel com Admin do T\xE1 pro Brick)
          </summary>
          <pre style="margin-top: 10px; font-family: monospace; font-size: 11px; color: #a1a1aa; background: #09090b; padding: 10px; border-radius: 6px; overflow-x: auto; max-height: 120px;">${JSON.stringify(d,null,2)}</pre>
        </details>
      </div>

    </div>

    <!-- Footer Actions -->
    <div style="padding: 16px 20px; border-top: 1px solid #27272a; background: #121215; display: flex; gap: 12px; justify-content: flex-end; align-items: center;">
      <button id="tpb-cancel-btn" style="background: #27272a; border: 1px solid #3f3f46; color: #e4e4e7; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;">
        Fechar
      </button>
      <button id="tpb-copy-btn" style="background: #f59e0b; border: none; color: #18181b; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;">
        <span>\u{1F4CB}</span> Copiar JSON para o T\xE1 pro Brick
      </button>
    </div>
  `;s.appendChild(l);document.body.appendChild(s);requestAnimationFrame(()=>{s.style.opacity="1"});function C(){s.style.opacity="0",setTimeout(()=>{s.remove()},200)}document.getElementById("tpb-close-btn").addEventListener("click",C);document.getElementById("tpb-cancel-btn").addEventListener("click",C);s.addEventListener("click",o=>{o.target===s&&C()});const E=document.getElementById("tpb-copy-btn");E.addEventListener("click",async()=>{try{const o=JSON.stringify(d,null,2);await navigator.clipboard.writeText(o),E.style.background="#10b981",E.style.color="#ffffff",E.innerHTML="<span>\u2713</span> Copiado para a \xC1rea de Transfer\xEAncia!",setTimeout(()=>{C()},1500)}catch(o){console.error("Falha ao copiar JSON:",o);const r=document.createElement("textarea");r.value=JSON.stringify(d,null,2),document.body.appendChild(r),r.select(),document.execCommand("copy"),document.body.removeChild(r),E.style.background="#10b981",E.style.color="#ffffff",E.innerHTML="<span>\u2713</span> Copiado com fallback!",setTimeout(()=>{C()},1500)}});console.log("\u2705 T\xE1 pro Brick: Dados extra\xEDdos com sucesso!",d)})();
```

6. Clique em **Salvar**.

---

### Opção 2: Executar no Console de Desenvolvedor (DevTools)

Se preferir não salvar como favorito:
1. Abra qualquer anúncio do Facebook Marketplace (ex: `https://www.facebook.com/marketplace/item/123456789/`).
2. Abra as Ferramentas de Desenvolvedor pressionando `F12` (ou `Cmd + Option + I` no Mac).
3. Vá para a aba **Console**.
4. Copie o código inteiro do arquivo [`scripts/fb-marketplace-extractor.js`](file:///Users/brenoniehues/Breno/ta-pro-brick/scripts/fb-marketplace-extractor.js).
5. Cole no console e pressione `Enter`.

---

## 🎯 Dicas para uma Curadoria Perfeita

1. **Carregamento de Fotos**: No Facebook Marketplace, fotos do carrossel são carregadas sob demanda (*lazy-loaded*). Antes de acionar o extrator, clique na imagem principal ou passe pelas miniaturas do anúncio para garantir que todas as imagens em alta resolução tenham sido baixadas pelo navegador.
2. **Preço Simbólico**: Alguns vendedores anunciam com valores fictícios (como `R$ 1` ou `R$ 1.234`). O extrator filtra valores abaixo de R$ 500, mas sempre revise o preço no modal antes de publicar o desafio.
3. **Importação no Tá pro Brick**:
   - Abra o painel administrativo do Tá pro Brick em [`/admin`](http://localhost:5173/admin).
   - Use o botão **Importar Dados do Anúncio** e cole o JSON copiado.
   - Todos os campos (Título, Preço, Fotos, Localização, Descrição e URL Original) serão preenchidos instantaneamente!
