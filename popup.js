// HTB Context Translator - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('api-key-input');
  const toggleVisibilityBtn = document.getElementById('toggle-visibility');
  const btnSaveKey = document.getElementById('btn-save-key');
  const btnTestKey = document.getElementById('btn-test-key');
  const feedbackBox = document.getElementById('api-feedback');
  const autoTranslateToggle = document.getElementById('auto-translate-toggle');
  const btnTranslateNow = document.getElementById('btn-translate-now');
  const currentKeyMasked = document.getElementById('current-key-masked');
  const statusIndicatorDot = document.getElementById('status-indicator-dot');
  const headerStatusBadge = document.getElementById('header-status-badge');
  const apiProviderSelect = document.getElementById('api-provider-select');

  let activeApiKey = null;

  // Mostra mensagens de feedback
  function mostrarFeedback(msg, tipo = 'info', tempoMs = 5000) {
    feedbackBox.innerText = msg;
    feedbackBox.className = `feedback-box feedback-${tipo}`;
    feedbackBox.style.display = 'block';

    if (tempoMs > 0) {
      setTimeout(() => {
        if (feedbackBox.innerText === msg) {
          feedbackBox.style.display = 'none';
        }
      }, tempoMs);
    }
  }

  // Mascara uma chave de API para exibição segura
  function mascararChave(chave) {
    if (!chave || chave.length < 8) return 'Nenhuma chave ativa';
    const prefixo = chave.slice(0, 6);
    const asteriscos = '•'.repeat(Math.min(24, Math.max(8, chave.length - 10)));
    const sufixo = chave.slice(-4);
    return `${prefixo}${asteriscos}${sufixo}`;
  }

  // Atualiza a exibição de status da chave
  function atualizarStatusVisual(chave, provedor = 'gemini') {
    if (chave && chave !== 'SUA_CHAVE_API_AQUI') {
      activeApiKey = chave;
      currentKeyMasked.innerText = mascararChave(chave) + ` (${provedor})`;
      statusIndicatorDot.className = 'dot dot-ok';
      statusIndicatorDot.title = 'Chave configurada e ativa';
      headerStatusBadge.className = 'badge badge-active';
      headerStatusBadge.innerText = 'Ativa';
    } else {
      activeApiKey = null;
      currentKeyMasked.innerText = 'Nenhuma chave configurada';
      statusIndicatorDot.className = 'dot dot-err';
      statusIndicatorDot.title = 'Nenhuma chave de API detectada';
      headerStatusBadge.className = 'badge badge-idle';
      headerStatusBadge.innerText = 'Sem Chave';
    }
  }

  // Carrega configurações salvas
  async function carregarConfiguracoes() {
    // 1. Storage local da extensão
    const storageData = await chrome.storage.local.get(['geminiApiKey', 'claudeApiKey', 'apiProvider', 'htbAutoTranslate']);
    
    // Auto-tradução padrão: ativada (true)
    const autoTranslateAtivo = storageData.htbAutoTranslate !== undefined ? !!storageData.htbAutoTranslate : true;
    autoTranslateToggle.checked = autoTranslateAtivo;

    const provider = storageData.apiProvider || 'gemini';
    apiProviderSelect.value = provider;

    let chaveAtiva = null;
    if (provider === 'gemini' && storageData.geminiApiKey && storageData.geminiApiKey.trim() !== '') {
      chaveAtiva = storageData.geminiApiKey.trim();
    } else if (provider === 'claude' && storageData.claudeApiKey && storageData.claudeApiKey.trim() !== '') {
      chaveAtiva = storageData.claudeApiKey.trim();
    }

    if (chaveAtiva) {
      atualizarStatusVisual(chaveAtiva, provider);
      return;
    }

    // 2. Se não estiver no storage, consulta o background service worker (ex: config.js fallback)
    chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
      if (response && response.hasKey) {
        atualizarStatusVisual('AIzaSyConfigLocalChaveAtiva1234', provider);
      } else {
        atualizarStatusVisual(null, provider);
      }
    });
  }

  apiProviderSelect.addEventListener('change', async (e) => {
    const provider = e.target.value;
    await chrome.storage.local.set({ apiProvider: provider });
    await carregarConfiguracoes();
  });

  // Alterna visualização do input de senha (asterisco / texto puro)
  toggleVisibilityBtn.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleVisibilityBtn.innerText = '🔒';
      toggleVisibilityBtn.title = 'Ocultar caracteres';
    } else {
      apiKeyInput.type = 'password';
      toggleVisibilityBtn.innerText = '👁️';
      toggleVisibilityBtn.title = 'Mostrar caracteres';
    }
  });

  // Salva a nova chave
  btnSaveKey.addEventListener('click', async () => {
    const novaChave = apiKeyInput.value.trim();
    const provider = apiProviderSelect.value;

    if (!novaChave) {
      mostrarFeedback('Por favor, insira ou cole a chave de API.', 'error');
      apiKeyInput.focus();
      return;
    }

    if (novaChave.length < 15) {
      mostrarFeedback('Aviso: Chave parece curta demais. Verifique o formato.', 'error');
      return;
    }

    btnSaveKey.disabled = true;
    btnSaveKey.innerText = 'Salvando...';

    try {
      if (provider === 'gemini') {
        await chrome.storage.local.set({ geminiApiKey: novaChave });
      } else {
        await chrome.storage.local.set({ claudeApiKey: novaChave });
      }
      atualizarStatusVisual(novaChave, provider);
      apiKeyInput.value = '';
      mostrarFeedback('✓ Nova chave de API salva com sucesso! A extensão já está utilizando-a.', 'success');

      // Notifica as abas abertas do HTB Academy sobre a nova chave
      chrome.tabs.query({ url: '*://*.hackthebox.com/*' }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { action: 'api_key_updated' }).catch(() => {});
        });
      });
    } catch (e) {
      mostrarFeedback('Erro ao salvar no storage: ' + e.message, 'error');
    } finally {
      btnSaveKey.disabled = false;
      btnSaveKey.innerHTML = '<span>💾</span> Salvar Chave';
    }
  });

  // Testa a conexão da chave com a API selecionada
  btnTestKey.addEventListener('click', async () => {
    const chaveParaTestar = apiKeyInput.value.trim() || activeApiKey;
    const provider = apiProviderSelect.value;

    if (!chaveParaTestar) {
      mostrarFeedback('Nenhuma chave fornecida ou ativa para testar.', 'error');
      return;
    }

    btnTestKey.disabled = true;
    headerStatusBadge.className = 'badge badge-loading';
    headerStatusBadge.innerText = 'Testando...';
    mostrarFeedback(`⏳ Testando conexão com a API do ${provider === 'gemini' ? 'Google Gemini' : 'Anthropic Claude'}...`, 'info', 0);

    try {
      if (provider === 'gemini') {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${chaveParaTestar}`);
        const dados = await resp.json();

        if (resp.ok && dados.models) {
          mostrarFeedback('✓ Conexão bem-sucedida! Chave válida e modelos Gemini disponíveis.', 'success', 6000);
          headerStatusBadge.className = 'badge badge-active';
          headerStatusBadge.innerText = 'Ativa';
        } else {
          const msgErro = dados.error?.message || 'Chave rejeitada pela API do Google.';
          mostrarFeedback(`✗ Falha na autenticação: ${msgErro}`, 'error', 7000);
          headerStatusBadge.className = 'badge badge-idle';
          headerStatusBadge.innerText = 'Inválida';
        }
      } else {
        // Testando a API do Claude
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': chaveParaTestar,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 1,
            messages: [{role: "user", content: "ping"}]
          })
        });

        if (resp.ok) {
          mostrarFeedback('✓ Conexão bem-sucedida! Chave válida e modelos Claude disponíveis.', 'success', 6000);
          headerStatusBadge.className = 'badge badge-active';
          headerStatusBadge.innerText = 'Ativa';
        } else {
          const dados = await resp.json();
          const msgErro = dados.error?.message || 'Chave rejeitada pela API do Anthropic.';
          mostrarFeedback(`✗ Falha na autenticação: ${msgErro}`, 'error', 7000);
          headerStatusBadge.className = 'badge badge-idle';
          headerStatusBadge.innerText = 'Inválida';
        }
      }
    } catch (err) {
      mostrarFeedback(`✗ Erro de rede ao conectar à API: ${err.message}`, 'error', 6000);
    } finally {
      btnTestKey.disabled = false;
    }
  });

  // Alteração do switch de auto-tradução
  autoTranslateToggle.addEventListener('change', async (e) => {
    const ativado = e.target.checked;
    await chrome.storage.local.set({ htbAutoTranslate: ativado });

    // Notifica as abas ativas
    chrome.tabs.query({ url: '*://*.hackthebox.com/*' }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { 
          action: 'set_auto_translate', 
          value: ativado 
        }).catch(() => {});
      });
    });

    mostrarFeedback(
      ativado ? 'Auto-tradução de seções ativada!' : 'Auto-tradução de seções pausada.',
      'info',
      2500
    );
  });

  // Botão "Traduzir Seção Aberta na Página"
  btnTranslateNow.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) return;
      const tabAtual = tabs[0];

      if (!tabAtual.url || !tabAtual.url.includes('hackthebox.com')) {
        mostrarFeedback('Abra uma página do HTB Academy para traduzir.', 'error', 3500);
        return;
      }

      chrome.tabs.sendMessage(tabAtual.id, { action: 'trigger_translate' }, (res) => {
        if (chrome.runtime.lastError) {
          mostrarFeedback('Recarregue a página do HTB para conectar a extensão.', 'error', 4000);
        } else {
          mostrarFeedback('Comando de tradução enviado à página!', 'success', 3000);
          window.close(); // Fecha o popup após disparar
        }
      });
    });
  });

  // Inicializa
  await carregarConfiguracoes();
});
