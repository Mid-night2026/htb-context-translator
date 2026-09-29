// HTB Academy AI Translator - Content Script
(function () {
  'use strict';

  let isAutoTranslateEnabled = false;
  let currentLanguage = 'en'; // 'en' ou 'pt'
  let isTranslating = false;
  let lastProcessedUrl = '';

  // Carrega preferências salvas
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['htbAutoTranslate'], (res) => {
      isAutoTranslateEnabled = !!res.htbAutoTranslate;
      const checkbox = document.getElementById('htb-auto-check');
      if (checkbox) checkbox.checked = isAutoTranslateEnabled;
      if (isAutoTranslateEnabled) {
        setTimeout(traduzirConteudoDaPagina, 1500);
      }
    });
  }

  // Cria ou atualiza o widget flutuante
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
            <span>Auto-traduzir ao avançar</span>
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
        traduzirConteudoDaPagina();
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

  // Tradução do conteúdo da página
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

        // Tenta enviar via runtime sendMessage
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

        // Se runtime não responder ou der erro, usa fallback direto
        if (!resposta && typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY) {
          const sysPrompt = `Você é um especialista em cibersegurança do HTB Academy. Traduza para pt-BR mantendo ferramentas e jargões essenciais intactos. Responda ESTRITAMENTE em JSON: {"translations": [{"id": number, "translatedText": string}]}`;
          const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
          for (const m of models) {
            try {
              const fetchResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
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

  // Monitora mudanças de rota no SPA do HTB Academy
  function monitorarNavegacao() {
    let urlAtual = location.href;

    const verificarUrl = () => {
      if (location.href !== urlAtual) {
        urlAtual = location.href;
        currentLanguage = 'en';
        const toggleBtn = document.getElementById('htb-btn-toggle');
        if (toggleBtn) toggleBtn.style.display = 'none';
        atualizarStatus('Pronto', 'normal');

        if (isAutoTranslateEnabled) {
          setTimeout(traduzirConteudoDaPagina, 1200);
        }
      }
    };

    setInterval(verificarUrl, 800);
  }

  // Inicialização
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
