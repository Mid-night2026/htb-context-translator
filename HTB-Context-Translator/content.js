// HTB Academy AI Translator - Content Script
(function () {
  'use strict';

  // Configurações e estados
  let isAutoTranslateEnabled = true; // Padrão: ativado para traduzir seções seguintes/anteriores automaticamente
  let currentLanguage = 'en'; // 'en' ou 'pt'
  let isTranslating = false;
  let lastTranslatedUrl = '';
  let autoTranslateTimer = null;
  let navMutationObserver = null;

  // Carrega preferências salvas no storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['htbAutoTranslate'], (res) => {
      if (res.htbAutoTranslate !== undefined) {
        isAutoTranslateEnabled = !!res.htbAutoTranslate;
      }
      const checkbox = document.getElementById('htb-auto-check');
      if (checkbox) checkbox.checked = isAutoTranslateEnabled;

      // Se auto-tradução estiver ativa, dispara ao carregar a página inicial
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
        console.log('[HTB-Translator] Nova chave de API sincronizada.');
        sendResponse({ success: true });
      }
    });
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

    // Eventos do Widget
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

  // Encontra os elementos de texto do curso HTB
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
      if (el.closest('pre') || el.closest('code') || el.closest('#htb-translator-widget')) return false;
      if (el.closest('.terminal, .xterm, .console, .pwnbox-terminal')) return false;
      if (el.closest('.question-box, form, button, nav, footer')) return false;
      const texto = el.innerText.trim();
      return texto.length > 5;
    });
  }

  // Obtém chave ativa para fallback direto se runtime falhar
  async function obterApiKeyAtiva() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const res = await chrome.storage.local.get(['geminiApiKey']);
      if (res.geminiApiKey && res.geminiApiKey.trim() !== '') {
        return res.geminiApiKey.trim();
      }
    }
    if (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY !== 'SUA_CHAVE_API_AQUI') {
      return CONFIG.GEMINI_API_KEY.trim();
    }
    return null;
  }

  // Tradução do conteúdo da página com IA contextual
  async function traduzirConteudoDaPagina() {
    if (isTranslating) return;
    const elementos = coletarElementosTraduziveis();

    if (elementos.length === 0) {
      atualizarStatus('Sem texto', 'normal');
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
        const payload = lote.map(item => ({
          id: item.id,
          text: item.textWithPlaceholders
        }));

        let resposta = null;

        // 1. Tenta enviar via runtime sendMessage ao service worker
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          resposta = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: 'translate_batch', items: payload }, (res) => {
              if (chrome.runtime.lastError || !res || !res.success) {
                resolve(null);
              } else {
                resolve(res.results);
              }
            });
          });
        }

        // 2. Se runtime falhar, usa fallback com fetch direto e regras anti-duplicata
        if (!resposta) {
          const apiKey = await obterApiKeyAtiva();
          if (apiKey) {
            const sysPrompt = `Você é um tradutor especialista em Cibersegurança do HTB Academy. Traduza para pt-BR natural. PROIBIÇÃO ABSOLUTA: NUNCA coloque termos em inglês e traduções redundantes lado a lado entre parênteses (ex: NUNCA faça "Forward Proxy (proxy de encaminhamento)" ou "requisições HTTP (HTTP Requests)"). Termos consagrados (Forward Proxy, tampering, pivoting, payload, reverse shell, wordlist, etc.) DEVEM ficar estritamente em inglês sem duplicatas. Responda ESTRITAMENTE em JSON: {"translations": [{"id": number, "translatedText": string}]}`;
            const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
            for (const m of models) {
              try {
                const fetchResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    system_instruction: { parts: [{ text: sysPrompt }] },
                    contents: [{ parts: [{ text: JSON.stringify(payload) }] }],
                    generationConfig: { response_mime_type: 'application/json' }
                  })
                });
                const j = await fetchResp.json();
                if (j.candidates && j.candidates[0]?.content?.parts?.[0]?.text) {
                  const parsed = JSON.parse(j.candidates[0].content.parts[0].text);
                  resposta = parsed.translations || parsed;
                  break;
                }
              } catch (err) {}
            }
          }
        }

        if (Array.isArray(resposta)) {
          resposta.forEach(resItem => {
            const matchItem = lote.find(it => it.id === resItem.id || it.id === resItem.idx);
            if (matchItem && resItem.translatedText) {
              let htmlFinal = resItem.translatedText;
              matchItem.placeholders.forEach((codeTag, idx) => {
                htmlFinal = htmlFinal.split(`__CODE_${idx}__`).join(codeTag);
              });

              matchItem.element.innerHTML = htmlFinal;
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
      // Verifica se existem elementos que ainda não foram traduzidos
      const precisaTraduzir = elementos.length > 0 && elementos.some(el => !el.dataset.htbTranslated);
      if (precisaTraduzir && !isTranslating) {
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

    // 1. Intercepta pushState e replaceState do HTML5 History API
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

    // 2. Eventos de navegação do browser
    window.addEventListener('popstate', () => window.dispatchEvent(new Event('htb-nav-event')));
    window.addEventListener('htb-nav-event', () => {
      if (location.href !== urlAtual) {
        urlAtual = location.href;
        tratarMudancaDeSecao();
      }
    });

    // 3. Polling de segurança (caso o framework use rotas sem acionar pushState padrão)
    setInterval(() => {
      if (location.href !== urlAtual) {
        urlAtual = location.href;
        tratarMudancaDeSecao();
      }
    }, 700);

    // 4. Delegação de cliques nos botões de Próxima/Anterior/Módulos
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
        // Dispara verificação rápida logo após o clique
        setTimeout(tratarMudancaDeSecao, 300);
      }
    }, true);

    // 5. MutationObserver no container principal para detectar injeção de novo conteúdo
    const targetNode = document.querySelector('.module-content') || document.body;
    if (window.MutationObserver && targetNode) {
      navMutationObserver = new MutationObserver((mutations) => {
        if (!isAutoTranslateEnabled || isTranslating) return;

        // Se houver nós adicionados com tags de texto não traduzidas
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
      injetarWidget();
      monitorarNavegacao();
    });
  } else {
    injetarWidget();
    monitorarNavegacao();
  }

})();
