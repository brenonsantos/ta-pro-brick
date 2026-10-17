# Tá pro Brick • Extrator Híbrido do Facebook Marketplace (1 por 1)

Utilitário de curadoria desenvolvido para o jogo **Tá pro Brick**, permitindo extrair dados e fotos de veículos no **Facebook Marketplace** anúncio por anúncio, isolando estritamente o carro escolhido pelo curador.

---

## 🎯 Como Funciona o Modo 1 por 1

O extrator foi projetado para curadoria seletiva de alta qualidade:
1. Você navega normalmente no Facebook Marketplace com seu navegador e perfil.
2. Ao encontrar um carro interessante, você clica nele para **abrir a janela de detalhes do anúncio** (`/marketplace/item/...`).
3. Com o anúncio aberto na tela, você executa o extrator (via **Favorito/Bookmarklet** ou colando no Console).
4. O extrator detecta o ID único do anúncio atual e:
   - Extrai o **Título** exato do veículo.
   - Extrai o **Preço** em Reais.
   - Extrai a **Localização** (Cidade, Estado).
   - Extrai o **Tempo Anunciado** e a **Descrição Completa** (expandindo o botão "Ver mais").
   - Filtra estritamente as fotos pertencentes ao carro aberto (ignorando anúncios semelhantes recomendados no rodapé, banners ou perfil do vendedor).
5. Abre uma janela flutuante onde você pode:
   - Ver a contagem e miniaturas das fotos.
   - **Remover qualquer foto indesejada clicando no ✕** (ex: fotos repetidas ou de baixa qualidade).
   - Clicar em **📋 Copiar JSON do Carro**.
6. No painel `/admin` do Tá pro Brick, basta clicar em **Importar Dados do Anúncio** e colar o JSON. Todos os campos são preenchidos instantaneamente!

---

## 🚀 Como Instalar o Bookmarklet (Favorito do Navegador)

### Passo a Passo:
1. Abra seu navegador (Chrome, Edge, Brave, Firefox ou Safari).
2. Deixe a **Barra de Favoritos** visível (`Cmd+Shift+B` no Mac ou `Ctrl+Shift+B` no Windows).
3. Clique com o botão direito na barra de favoritos e selecione **Adicionar página...** (ou *Adicionar favorito*).
4. No campo **Nome**, digite:
   ```text
   🧱 Extrair Tá pro Brick
   ```
5. No campo **URL** (ou *Endereço*), cole o código javascript abaixo (ou copie do arquivo `scripts/fb-marketplace-bookmarklet.txt`):

```javascript
javascript:(function(){"use strict";const b=document.getElementById("tpb-extractor-overlay");b&&b.remove();const x=window.location.href,w=x.includes("/marketplace/item/"),g=x.match(/marketplace\/item\/(\d+)/),m=g?g[1]:null;if(!w&&!document.querySelector('div[role="dialog"]')){alert(`\u26A0\uFE0F T\xE1 pro Brick Extrator:

Voc\xEA ainda est\xE1 na lista geral de an\xFAncios!

\u{1F449} Clique primeiro no an\xFAncio do carro que voc\xEA escolheu para abrir os detalhes dele (fotos grandes, pre\xE7o e descri\xE7\xE3o) e a\xED sim clique no Extrator.`);return}function T(i){try{Array.from(i.querySelectorAll('div[role="button"], span[role="button"]')).forEach(t=>{const e=t.innerText?.trim().toLowerCase();(e==="ver mais"||e==="see more")&&t.click()})}catch{}}const A=document.querySelector('div[role="dialog"]'),S=document.querySelector('div[role="main"]'),c=A||S||document.body;T(c);function E(){return x.split("?")[0]}function C(){const i=c.querySelector("h1");if(i&&i.innerText&&i.innerText.trim().length>3)return i.innerText.trim();const a=document.querySelector('meta[property="og:title"]');if(a&&a.content){const e=a.content.replace(/\s*\|\s*Facebook.*$/i,"").trim();if(e)return e}return document.title.replace(/\s*\|\s*Facebook.*$/i,"").trim()||"Ve\xEDculo sem t\xEDtulo"}function z(i){if(i){const e=i.parentElement?.parentElement||c,o=Array.from(e.querySelectorAll("span, div, h2, h3"));for(const n of o){const r=n.innerText?.trim();if(r&&/^R\$\s*[\d\.,]+$/i.test(r)){const y=r.replace(/[^\d]/g,""),l=parseInt(y,10);if(!isNaN(l)&&l>500)return l}}}const t=(c.innerText||"").match(/R\$\s*([\d\.]+)(?:,\d{2})?/i);if(t&&t[1]){const e=t[1].replace(/[^\d]/g,""),o=parseInt(e,10);if(!isNaN(o)&&o>500)return o}return 0}function I(){const i=/([A-Za-zÀ-ÿ\s\.\-]+,\s*(?:AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO))/,a=Array.from(c.querySelectorAll("span, div, p"));for(const t of a){const e=t.innerText?.trim();if(!(!e||e.length>80)){if(e.includes("Localiza\xE7\xE3o aproximada")||e.includes("Approximate location")){const o=e.match(i);if(o)return o[1].trim()}if(i.test(e)&&!e.includes(`
`)){const o=e.match(i);if(o&&o[1].length<50)return o[1].trim()}}}return"Brasil"}function $(){const i=/(?:Anunciado há|Publicado há|Listed)\s+([^·\n\r<]+)/i,a=Array.from(c.querySelectorAll("span, div"));for(const t of a){const e=t.innerText?.trim();if(e&&(e.includes("Anunciado h\xE1")||e.includes("Publicado h\xE1")||e.includes("Listed"))){const o=e.match(i);return o?(o[0]||"").trim():e}}return"Anunciado recentemente"}function q(){const i=Array.from(c.querySelectorAll("div, span, section"));for(let t=0;t<i.length;t++){const e=i[t].innerText?.trim().toLowerCase();if(e==="descri\xE7\xE3o do vendedor"||e==="seller's description"||e==="detalhes do ve\xEDculo"){const o=i[t].parentElement;if(o){const n=o.querySelector('div[dir="auto"], span[dir="auto"]')||o.nextElementSibling;if(n&&n.innerText){const r=n.innerText.replace(/^(descrição do vendedor|seller's description)\s*/i,"").trim();if(r.length>5)return r}}}}const a=Array.from(c.querySelectorAll('div[dir="auto"], span[dir="auto"]'));for(const t of a){const e=t.innerText?.trim();if(e&&e.length>30&&(e.includes(`
`)||e.length>80)&&!e.includes("Marketplace")&&!e.includes("Messenger")&&!e.includes("Cookies"))return e}return"Sem descri\xE7\xE3o fornecida pelo vendedor."}function P(){const i=Array.from(c.querySelectorAll("img"));let a=[];const t=new Set;function e(n){try{let r=n;return r=r.replace(/_s\d+x\d+/,"_s960x960"),r=r.replace(/_p\d+x\d+/,"_p720x720"),r}catch{return n}}function o(n){const r=n.match(/([a-zA-Z0-9_\-]+)\.(?:jpg|jpeg|png|webp)/i);return r?r[1]:n.split("?")[0]}return i.forEach(n=>{const r=n.src||n.getAttribute("data-src")||"";if(!r||!(r.includes("fbcdn.net")||r.includes("scontent")))return;const l=n.closest('a[href*="/marketplace/item/"]');if(l&&m&&!(l.getAttribute("href")||"").includes(m))return;const v=n.closest("div, section");if(v){const u=(v.innerText||"").toLowerCase();if((u.includes("itens semelhantes")||u.includes("mais deste vendedor")||u.includes("recomenda\xE7\xF5es")||u.includes("patrocinado"))&&l&&!l.getAttribute("href")?.includes(m||""))return}if(r.includes("/rsrc.php/")||r.includes("/emoji.php/")||r.includes("p50x50")||r.includes("p100x100")||r.includes("150x150")||r.includes("avatar")||n.alt&&/perfil|profile|avatar|ícone|icon|emoji/i.test(n.alt)||n.naturalWidth>0&&(n.naturalWidth<120||n.naturalHeight<120))return;const k=o(r);t.has(k)||(t.add(k),a.push(e(r)))}),a}const L=c.querySelector("h1");let j=P();const s={title:C(),price:z(L),location:I(),timePosted:$(),description:q(),originalUrl:E(),photos:j,authorizationNotes:"An\xFAncio verificado no Facebook Marketplace"},d=document.createElement("div");d.id="tpb-extractor-overlay",d.style.cssText=`
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
  `;const f=document.createElement("div");f.style.cssText=`
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
  `;function h(){const i=s.price>0?`R$ ${s.price.toLocaleString("pt-BR")}`:"N\xE3o detectado",a=s.photos.map((e,o)=>`
      <div style="position: relative; width: 64px; height: 64px; border-radius: 10px; overflow: hidden; background: #27272a; flex-shrink: 0; border: 1px solid #3f3f46;">
        <img src="${e}" style="width: 100%; height: 100%; object-fit: cover;" alt="Foto ${o+1}" />
        <span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.75); font-size: 9px; text-align: center; color: #f59e0b; font-weight: bold;">
          ${o===0?"Capa":`#${o+1}`}
        </span>
        <button class="tpb-del-photo" data-idx="${o}" style="position: absolute; top: 2px; right: 2px; width: 16px; height: 16px; border-radius: 50%; background: rgba(0,0,0,0.8); color: #fff; border: none; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">\u2715</button>
      </div>
    `).join("");f.innerHTML=`
      <!-- Header -->
      <div style="padding: 16px 20px; border-bottom: 1px solid #27272a; display: flex; align-items: center; justify-content: space-between; background: #121215;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="background: #f59e0b; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; color: #000;">
            \u{1F9F1}
          </div>
          <div>
            <h2 style="margin: 0; font-size: 16px; font-weight: 800; color: #fafafa;">An\xFAncio Selecionado (1 por 1)</h2>
            <p style="margin: 0; font-size: 12px; color: #a1a1aa;">Pronto para importar no T\xE1 pro Brick</p>
          </div>
        </div>
        <button id="tpb-close-btn" style="background: transparent; border: none; color: #a1a1aa; font-size: 20px; cursor: pointer; padding: 4px 8px; border-radius: 6px;">\u2715</button>
      </div>

      <!-- Content -->
      <div style="padding: 18px 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px;">
        <!-- Card Resumo -->
        <div style="background: #27272a; border: 1px solid #3f3f46; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
            <div style="flex: 1;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #f59e0b; letter-spacing: 0.5px;">Carro Selecionado</span>
              <div style="font-size: 15px; font-weight: 700; color: #ffffff; margin-top: 2px;">${s.title}</div>
            </div>
            <div style="text-align: right; background: #18181b; padding: 6px 12px; border-radius: 8px; border: 1px solid #3f3f46;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #a1a1aa;">Pre\xE7o</span>
              <div style="font-size: 16px; font-weight: 800; color: #34d399;">${i}</div>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; color: #d4d4d8; margin-top: 4px;">
            <span style="background: #18181b; padding: 3px 8px; border-radius: 6px; border: 1px solid #3f3f46;">\u{1F4CD} ${s.location}</span>
            <span style="background: #18181b; padding: 3px 8px; border-radius: 6px; border: 1px solid #3f3f46;">\u23F1\uFE0F ${s.timePosted}</span>
            <span style="background: #18181b; padding: 3px 8px; border-radius: 6px; border: 1px solid #3f3f46;">\u{1F4F8} ${s.photos.length} fotos</span>
          </div>
        </div>

        <!-- Fotos -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 700; color: #e4e4e7;">Fotos do Ve\xEDculo (${s.photos.length})</span>
            <span style="font-size: 11px; color: #71717a;">Clique no \u2715 para remover fotos indesejadas</span>
          </div>
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px;">
            ${a||'<div style="font-size: 12px; color: #ef4444;">Nenhuma foto encontrada. Avance o carrossel no an\xFAncio e tente novamente.</div>'}
          </div>
        </div>

        <!-- Descri\xE7\xE3o -->
        <div>
          <div style="font-size: 12px; font-weight: 700; color: #e4e4e7; margin-bottom: 6px;">Descri\xE7\xE3o do An\xFAncio</div>
          <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 10px; font-size: 12px; color: #d4d4d8; max-height: 90px; overflow-y: auto; white-space: pre-wrap; line-height: 1.4;">${s.description}</div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div style="padding: 16px 20px; border-top: 1px solid #27272a; background: #121215; display: flex; gap: 10px; justify-content: flex-end; align-items: center;">
        <button id="tpb-cancel-btn" style="background: #27272a; border: 1px solid #3f3f46; color: #e4e4e7; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
          Fechar
        </button>
        <button id="tpb-copy-btn" style="background: #f59e0b; border: none; color: #18181b; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <span>\u{1F4CB}</span> Copiar JSON do Carro
        </button>
      </div>
    `,document.getElementById("tpb-close-btn").addEventListener("click",p),document.getElementById("tpb-cancel-btn").addEventListener("click",p),f.querySelectorAll(".tpb-del-photo").forEach(e=>{e.addEventListener("click",o=>{const n=parseInt(o.currentTarget.getAttribute("data-idx"),10);s.photos.splice(n,1),h()})});const t=document.getElementById("tpb-copy-btn");t.addEventListener("click",async()=>{const e=JSON.stringify(s,null,2);try{await navigator.clipboard.writeText(e),t.style.background="#10b981",t.style.color="#ffffff",t.innerHTML="<span>\u2713</span> Copiado para a \xC1rea de Transfer\xEAncia!",setTimeout(()=>{p()},1200)}catch{const n=document.createElement("textarea");n.value=e,document.body.appendChild(n),n.select(),document.execCommand("copy"),document.body.removeChild(n),t.style.background="#10b981",t.style.color="#ffffff",t.innerHTML="<span>\u2713</span> Copiado!",setTimeout(()=>{p()},1200)}})}function p(){d.style.opacity="0",setTimeout(()=>{d.remove()},150)}d.addEventListener("click",i=>{i.target===d&&p()}),h(),d.appendChild(f),document.body.appendChild(d)})();
```

6. Clique em **Salvar**.

---

## 💻 Alternativa: Executar via DevTools Console

Se não quiser criar o favorito:
1. Abra a página do anúncio de um veículo no Facebook Marketplace.
2. Abra as Ferramentas do Desenvolvedor (`F12` ou `Cmd + Option + I` no Mac).
3. Vá na aba **Console**.
4. Copie todo o código do arquivo [`scripts/fb-marketplace-extractor.js`](file:///Users/brenoniehues/Breno/ta-pro-brick/scripts/fb-marketplace-extractor.js).
5. Cole no console e pressione `Enter`.

---

## 💡 Dicas de Curadoria
- **Fotos do Carrossel**: Navegue pelas fotos do carrossel no anúncio antes de extrair, para que o navegador baixe todas as imagens em alta resolução.
- **Remover fotos no Modal**: O modal do extrator possui um botão `✕` em cima de cada miniatura. Se houver alguma foto desfocada ou repetida, basta removê-la antes de copiar!
- **Importação**: No painel admin (`https://taprobrick.com.br/admin`), clique em **Importar Dados do Anúncio**, cole o texto e clique em **Preencher Formulário**.
