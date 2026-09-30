// HTB Academy AI Translator - Content Script
(function () {
  'use strict';

  // Configurações e estados
  let isAutoTranslateEnabled = true;
  let currentLanguage = 'en'; // 'en' ou 'pt'
  let isTranslating = false;
  let lastTranslatedUrl = '';
  let autoTranslateTimer = null;
  let navMutationObserver = null;
  let customGlossary = '';

  // Carrega preferências salvas no storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['htbAutoTranslate', 'htbGlossary'], (res) => {
      if (res.htbAutoTranslate !== undefined) {
        isAutoTranslateEnabled = !!res.htbAutoTranslate;
      }
      if (res.htbGlossary) {
        customGlossary = res.htbGlossary;
      }
      const checkbox = document.getElementById('htb-auto-check');
      if (checkbox) checkbox.checked = isAutoTranslateEnabled;

      if (isAutoTranslateEnabled) {
        agendarAutoTraducao(1200);
      }
    });
  }

  // Ouve mensagens vindas do popup ou do background
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'trigger_translate') {
        traduzirConteudoDaPagina();
        sendResponse({ success: true });
      } else if (request.action === 'set_auto_translate') {
        isAutoTranslateEnabled = !!request.value;
        const checkbox = document.getElementById('htb-auto-check');
        if (checkbox) checkbox.checked = isAutoTranslateEnabled;
        if (isAutoTranslateEnabled && currentLanguage === 'en') {
          agendarAutoTraducao(400);
        }
        sendResponse({ success: true });
      } else if (request.action === 'api_key_updated') {
        sendResponse({ success: true });
      }
    });
  }

  // Injeta estilos da extensão na página
  function injetarEstilosPage() {
    if (document.getElementById('htb-page-styles')) return;
    const style = document.createElement('style');
    style.id = 'htb-page-styles';
    style.textContent = `
      .htb-fade-in {
        animation: htbFadeIn 0.5s ease-in-out forwards;
      }
      @keyframes htbFadeIn {
        from { opacity: 0.3; transform: translateY(2px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  // Cria ou atualiza o widget flutuante na tela do curso
  function injetarWidget() {
    if (document.getElementById('htb-translator-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'htb-translator-widget';
    widget.innerHTML = `
      <div class="htb-trans-card">
        <div class="htb-trans-header">
          <div class="htb-trans-title">
            <span>🛡️</span>
            <span>HTB Translator AI</span>
          </div>
          <span id="htb-status-badge" class="htb-trans-badge">Pronto</span>
        </div>
        <div class="htb-trans-actions">
          <button id="htb-btn-translate" class="htb-btn-primary">
            <span>✨</span>
            <span id="htb-btn-text">Traduzir Página (IA)</span>
          </button>
          <button id="htb-btn-toggle" class="htb-btn-secondary" style="display: none;">
            <span>🔄</span>
            <span id="htb-toggle-text">Ver Original (EN)</span>
          </button>
        </div>
        <div class="htb-trans-toggle-row">
          <label class="htb-trans-checkbox-label">
            <input type="checkbox" id="htb-auto-check" ${isAutoTranslateEnabled ? 'checked' : ''}>
            <span>Auto-traduzir seções (Avançar/Voltar)</span>
          </label>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    document.getElementById('htb-btn-translate').addEventListener('click', () => {
      traduzirConteudoDaPagina();
    });

    document.getElementById('htb-btn-toggle').addEventListener('click', () => {
      alternarIdioma();
    });

    document.getElementById('htb-auto-check').addEventListener('change', (e) => {
      isAutoTranslateEnabled = e.target.checked;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ htbAutoTranslate: isAutoTranslateEnabled });
      }
      if (isAutoTranslateEnabled && currentLanguage === 'en') {
        agendarAutoTraducao(400);
      }
    });
  }

  // Atualiza estado visual do widget
  function atualizarStatus(texto, tipo = 'normal') {
    const badge = document.getElementById('htb-status-badge');
    const btn = document.getElementById('htb-btn-translate');
    if (!badge || !btn) return;

    badge.className = 'htb-trans-badge ' + (tipo === 'loading' ? 'loading' : tipo === 'active' ? 'active' : '');
    badge.innerText = texto;
    btn.disabled = (tipo === 'loading');
  }

  // Encontra os elementos de texto do curso HTB de forma segura
  function coletarElementosTraduziveis() {
    const container = document.querySelector('.module-content article') ||
                      document.querySelector('.module-content') ||
                      document.querySelector('#module-content') ||
                      document.querySelector('article') ||
                      document.querySelector('main');

    if (!container) return [];

    const seletores = 'h1, h2, h3, h4, h5, h6, p, li, blockquote, td, th';
    const elementos = Array.from(container.querySelectorAll(seletores));

    return elementos.filter(el => {
      try {
        if (!el || !el.isConnected) return false;
        if (el.closest('pre') || el.closest('code') || el.closest('#htb-translator-widget')) return false;
        if (el.closest('.terminal, .xterm, .console, .pwnbox-terminal')) return false;
        if (el.closest('.question-box, form, button, nav, footer')) return false;
        if (el.dataset.htbTranslated === 'true') return false;

        const texto = (el.innerText || el.textContent || '').trim();
        return texto.length > 5;
      } catch (e) {
        return false;
      }
    });
  }

  // Tradução do conteúdo da página com IA contextual
  async function traduzirConteudoDaPagina() {
    if (isTranslating) return;
    const elementos = coletarElementosTraduziveis();

    if (elementos.length === 0) {
      const jaTraduzidos = document.querySelectorAll('[data-htb-translated="true"]').length;
      if (jaTraduzidos > 0) {
        atualizarStatus('✅ Traduzido', 'active');
        const toggleBtn = document.getElementById('htb-btn-toggle');
        if (toggleBtn) toggleBtn.style.display = 'flex';
      } else {
        atualizarStatus('Sem texto', 'normal');
      }
      return;
    }

    isTranslating = true;
    atualizarStatus('Iniciando...', 'loading');

    const itensParaTraduzir = [];
    elementos.forEach((el, index) => {
      if (!el.dataset.htbOriginalHtml) {
        el.dataset.htbOriginalHtml = el.innerHTML;
      }

      let htmlProcessado = el.innerHTML;
      const placeholders = [];
      htmlProcessado = htmlProcessado.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (match) => {
        const ph = `__CODE_${placeholders.length}__`;
        placeholders.push(match);
        return ph;
      });

      itensParaTraduzir.push({
        id: index,
        element: el,
        textWithPlaceholders: htmlProcessado,
        placeholders: placeholders
      });
    });

    const tamanhoLote = 6;
    const lotes = [];
    for (let i = 0; i < itensParaTraduzir.length; i += tamanhoLote) {
      lotes.push(itensParaTraduzir.slice(i, i + tamanhoLote));
    }

    let traduzidosSucesso = 0;

    for (let i = 0; i < lotes.length; i++) {
      const lote = lotes[i];
      atualizarStatus(`Traduzindo (${i + 1}/${lotes.length})...`, 'loading');

      try {
        const payload = lote.map((item, relIndex) => ({
          id: relIndex, // IDs relativos 0..5 para o lote
          text: item.textWithPlaceholders
        }));

        const response = await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { action: 'translate_batch', items: payload, glossary: customGlossary },
            (res) => {
              if (chrome.runtime.lastError || !res || !res.success) {
                resolve(null);
              } else {
                resolve(res.results);
              }
            }
          );
        });

        if (Array.isArray(response) && response.length > 0) {
          response.forEach((resItem, resIdx) => {
            // Casa por ID relativo ou pela ordem exata do lote
            const matchItem = lote.find((_, idx) => idx === resItem.id) || lote[resIdx];
            const textoTraduzido = resItem.translatedText || (typeof resItem === 'string' ? resItem : null);

            if (matchItem && textoTraduzido) {
              let htmlFinal = textoTraduzido;
              matchItem.placeholders.forEach((codeTag, idx) => {
                htmlFinal = htmlFinal.split(`__CODE_${idx}__`).join(codeTag);
              });

              matchItem.element.innerHTML = htmlFinal;
              matchItem.element.classList.add('htb-fade-in');
              matchItem.element.dataset.htbTranslatedHtml = htmlFinal;
              matchItem.element.dataset.htbTranslated = 'true';
              traduzidosSucesso++;
            }
          });
        }
      } catch (erro) {
        console.error('[HTB-Translator] Erro no lote:', erro);
      }
    }

    isTranslating = false;
    currentLanguage = 'pt';
    lastTranslatedUrl = location.href;

    if (traduzidosSucesso > 0) {
      atualizarStatus('✅ Traduzido', 'active');
      const toggleBtn = document.getElementById('htb-btn-toggle');
      if (toggleBtn) {
        toggleBtn.style.display = 'flex';
        document.getElementById('htb-toggle-text').innerText = 'Ver Original (EN)';
      }
      document.getElementById('htb-btn-text').innerText = 'Re-traduzir';
    } else {
      atualizarStatus('Erro na tradução', 'normal');
    }
  }

  // Alterna entre Português e Inglês original instantaneamente
  function alternarIdioma() {
    const elementos = document.querySelectorAll('[data-htb-original-html]');
    if (elementos.length === 0) return;

    const toggleText = document.getElementById('htb-toggle-text');

    if (currentLanguage === 'pt') {
      elementos.forEach(el => {
        if (el.dataset.htbOriginalHtml) {
          el.innerHTML = el.dataset.htbOriginalHtml;
        }
      });
      currentLanguage = 'en';
      if (toggleText) toggleText.innerText = 'Ver Tradução (PT-BR)';
      atualizarStatus('Original (EN)', 'normal');
    } else {
      elementos.forEach(el => {
        if (el.dataset.htbTranslatedHtml) {
          el.innerHTML = el.dataset.htbTranslatedHtml;
        }
      });
      currentLanguage = 'pt';
      if (toggleText) toggleText.innerText = 'Ver Original (EN)';
      atualizarStatus('✅ Traduzido', 'active');
    }
  }

  // Agenda auto-tradução garantindo estabilização do DOM
  function agendarAutoTraducao(delayMs = 800) {
    if (!isAutoTranslateEnabled) return;
    if (autoTranslateTimer) clearTimeout(autoTranslateTimer);

    autoTranslateTimer = setTimeout(() => {
      const elementos = coletarElementosTraduziveis();
      if (elementos.length > 0 && !isTranslating) {
        traduzirConteudoDaPagina();
      }
    }, delayMs);
  }

  // Notifica transição de seção (ao clicar em próximo, anterior ou mudar URL)
  function tratarMudancaDeSecao() {
    currentLanguage = 'en';
    const toggleBtn = document.getElementById('htb-btn-toggle');
    if (toggleBtn) toggleBtn.style.display = 'none';
    atualizarStatus('Nova seção...', 'loading');

    if (isAutoTranslateEnabled) {
      agendarAutoTraducao(900);
    } else {
      atualizarStatus('Pronto', 'normal');
    }
  }

  // Monitora navegação no SPA do HTB Academy (Vue/Nuxt)
  function monitorarNavegacao() {
    let urlAtual = location.href;

    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      window.dispatchEvent(new Event('htb-nav-event'));
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event('htb-nav-event'));
    };

    window.addEventListener('popstate', () => window.dispatchEvent(new Event('htb-nav-event')));
    window.addEventListener('htb-nav-event', () => {
      if (location.href !== urlAtual) {
        urlAtual = location.href;
        tratarMudancaDeSecao();
      }
    });

    setInterval(() => {
      if (location.href !== urlAtual) {
        urlAtual = location.href;
        tratarMudancaDeSecao();
      }
    }, 700);

    document.addEventListener('click', (e) => {
      const el = e.target.closest('a, button');
      if (!el) return;

      const href = el.getAttribute('href') || '';
      const texto = (el.innerText || '').toLowerCase();

      if (
        href.includes('/section/') ||
        texto.includes('next') ||
        texto.includes('próxim') ||
        texto.includes('previous') ||
        texto.includes('anterior') ||
        texto.includes('complete & next')
      ) {
        setTimeout(tratarMudancaDeSecao, 300);
      }
    }, true);

    const targetNode = document.querySelector('.module-content') || document.body;
    if (window.MutationObserver && targetNode) {
      navMutationObserver = new MutationObserver((mutations) => {
        if (!isAutoTranslateEnabled || isTranslating) return;

        let temNovoTexto = false;
        for (const m of mutations) {
          if (m.addedNodes.length > 0) {
            for (const node of m.addedNodes) {
              if (node.nodeType === 1 && (node.matches('article, p, h1, h2, h3, li') || node.querySelector?.('p, article'))) {
                temNovoTexto = true;
                break;
              }
            }
          }
          if (temNovoTexto) break;
        }

        if (temNovoTexto && location.href !== lastTranslatedUrl) {
          agendarAutoTraducao(800);
        }
      });

      navMutationObserver.observe(targetNode, { childList: true, subtree: true });
    }
  }

  // Inicialização no DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injetarEstilosPage();
      injetarWidget();
      monitorarNavegacao();
    });
  } else {
    injetarEstilosPage();
    injetarWidget();
    monitorarNavegacao();
  }

})();
