// Carrega a configuração local caso exista (config.js é ignorado pelo Git)
try {
  importScripts('config.js');
} catch (e) {
  // config.js não encontrado ou executando sem o arquivo
}

async function obterApiKey() {
  if (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY !== 'SUA_CHAVE_API_AQUI') {
    return CONFIG.GEMINI_API_KEY;
  }
  if (chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get(['geminiApiKey']);
    if (data.geminiApiKey) return data.geminiApiKey;
  }
  return null;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "traduzir-htb",
    title: "Traduzir com Contexto HTB",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "traduzir-htb") {
    const textoSelecionado = info.selectionText;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: injetarPopup,
      args: ["⏳ Traduzindo e analisando o contexto..."]
    });

    try {
      const resposta = await traduzirComGemini(textoSelecionado);
      
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: injetarPopup,
        args: [resposta]
      });
    } catch (erro) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: injetarPopup,
        args: ["❌ Erro na API: " + erro.message]
      });
    }
  }
});

async function traduzirComGemini(texto) {
  const apiKey = await obterApiKey();
  if (!apiKey) {
    throw new Error('Chave de API não configurada. Defina em config.js ou via chrome.storage.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const promptDeSistema = "Você é um especialista em cibersegurança e pentest. Sua tarefa é traduzir textos do inglês para o português do Brasil. NUNCA traduza jargões técnicos da área de TI e segurança da informação (ex: payload, exploit, reverse shell, hash, buffer overflow, bypass, root, privilege escalation). A tradução deve ser fluida e focada em ajudar um estudante do Hack The Box a entender o cenário.";

  const corpoRequisicao = {
    system_instruction: { parts: [{ text: promptDeSistema }] },
    contents: [{ parts: [{ text: `Traduza este texto:\n\n${texto}` }] }]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpoRequisicao)
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}

function injetarPopup(texto) {
  let popupExistente = document.getElementById('htb-popup-gemini');
  if (popupExistente) popupExistente.remove();

  const popup = document.createElement('div');
  popup.id = 'htb-popup-gemini';
  popup.style.cssText = `
    position: fixed; top: 20px; right: 20px; width: 350px; max-height: 80vh;
    overflow-y: auto; background: #111; color: #0f0; border: 2px solid #0f0;
    border-radius: 8px; padding: 15px; font-family: 'Courier New', Courier, monospace;
    font-size: 14px; z-index: 2147483647; box-shadow: 0 4px 15px rgba(0,255,0,0.2);
    line-height: 1.5;
  `;

  const fecharBtn = document.createElement('button');
  fecharBtn.innerText = 'X';
  fecharBtn.style.cssText = `
    float: right; background: #f00; color: #fff; border: none; border-radius: 4px;
    cursor: pointer; padding: 2px 8px; font-weight: bold; font-family: sans-serif;
  `;
  fecharBtn.onclick = () => popup.remove();

  const conteudo = document.createElement('div');
  conteudo.style.marginTop = '15px';
  conteudo.innerHTML = texto.replace(/\n/g, '<br>'); 

  popup.appendChild(fecharBtn);
  popup.appendChild(conteudo);
  document.body.appendChild(popup);
}
