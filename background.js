// HTB Academy AI Translator - Background Service Worker

try {
  importScripts('config.js');
} catch (e) {
  console.log('[HTB-Translator] config.js nao encontrado, usando fallback');
}

// Recupera a API key: prioriza storage (configurado via popup/interface) e depois fallback config.js
async function obterApiKey() {
  if (chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get(['geminiApiKey']);
    if (data.geminiApiKey && data.geminiApiKey.trim() !== '') {
      return data.geminiApiKey.trim();
    }
  }
  if (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY !== 'SUA_CHAVE_API_AQUI') {
    return CONFIG.GEMINI_API_KEY.trim();
  }
  return null;
}

const SYSTEM_PROMPT = `Você é um tradutor especialista de altíssimo nível em Cibersegurança, Ethical Hacking e Pentest do Hack The Box (HTB) Academy.
Sua missão é traduzir o conteúdo técnico do inglês para o Português do Brasil (pt-BR) com rigor conceitual, fluência e vocabulário técnico natural.

PROIBIÇÃO CRÍTICA DE DUPLICATAS REDUNDANTES:
- NUNCA coloque o termo em inglês e uma tradução em português lado a lado entre parênteses, barras ou travessões!
  ❌ ERRADO: "Forward Proxy (proxy de encaminhamento)"
  ❌ ERRADO: "requisições HTTP (HTTP Requests)"
  ❌ ERRADO: "tampering (adulteração)"
  ❌ ERRADO: "pivoting / pivoteamento"
  ❌ ERRADO: "Wordlist (lista de palavras)"
  ❌ ERRADO: "Reverse Shell (shell reversa)"
  ❌ ERRADO: "payload (carga útil)"
  ❌ ERRADO: "Dedicated Proxy / Proxy Dedicado"

REGRA DE TERMINOLOGIA:
1. TERMOS QUE DEVEM PERMANECER ESTRITAMENTE EM INGLÊS (sem qualquer tradução redundante ao lado):
   Use APENAS o termo em inglês, exatamente como profissionais de segurança da informação no Brasil usam na prática:
   - Ferramentas e utilitários: Burp Suite, ZAP, Nmap, Metasploit, Wireshark, Cloudflare, ModSecurity, curl, netcat, socat, hydra, sqlmap, john, hashcat, mimikatz, ffuf, gobuster, dirsearch, Responder, etc.
   - Jargões técnicos consagrados de rede, pentest e segurança ofensiva:
     Forward Proxy, Reverse Proxy, Transparent Proxy, Pivoting, Listener, Payload, Exploit, Reverse Shell, Bind Shell, Web Shell, Buffer Overflow, Bypass, Privilege Escalation, Root, Tampering, Spoofing, Tunneling, C2, Command and Control, Wordlist, Fuzzing, Brute Force, Handshake, Exfiltration, Beaconing, Foothold, Pwn, Writeup, Target, Endpoint, Header, Cookie, Session Hijacking, Directory Traversal, Path Traversal, Injection, SQL Injection, XSS, SSRF, CSRF, Race Condition, Man-in-the-Middle (MitM).

2. TERMOS GERAIS DE COMPUTAÇÃO TRADUZÍVEIS:
   Traduza com naturalidade para o português do Brasil SEM repetir o original em inglês ao lado:
   ✓ "requisições HTTP" (sem colocar "(HTTP Requests)")
   ✓ "servidor web" (sem colocar "(web server)")
   ✓ "banco de dados"
   ✓ "navegador"
   ✓ "rede local"

3. PRESERVAÇÃO TÉCNICA ABSOLUTA:
   - NUNCA altere comandos shell, scripts, parâmetros de linha de comando, flags (-sV, -p-, -oA), caminhos de sistema (/etc/passwd, C:\\Windows\\System32), variáveis, cabeçalhos HTTP, hashes, IPs, portas, tokens ou payloads.
   - PRESERVE todos os placeholders de código (como __CODE_0__, __CODE_1__, etc.) e tags HTML inline exatamente nos seus lugares correspondentes.

4. ESTILO E FORMATO:
   - Traduza a linguagem explicativa e narrativa para um Português do Brasil claro, técnico e didático.
   - Responda ESTRITAMENTE em formato JSON:
{
  "translations": [
    { "id": 0, "translatedText": "texto traduzido aqui" }
  ]
}`;

// Faz a requisição à API do Gemini com fallback de modelos
async function chamarGemini(payload, systemInstruction = SYSTEM_PROMPT) {
  const apiKey = await obterApiKey();
  if (!apiKey) {
    throw new Error('Chave de API do Gemini não configurada.');
  }

  const modelos = ['gemini-1.5-flash', 'gemini-1.5-flash-8b'];
  let ultimoErro = null;

  for (const modelo of modelos) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;

      const corpo = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text: payload }] }],
        generationConfig: {
          response_mime_type: 'application/json'
        }
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo)
      });

      const data = await resp.json();

      if (data.error) {
        console.warn(`[HTB-Translator] Erro no modelo ${modelo}:`, data.error.message);
        ultimoErro = new Error(data.error.message);
        continue; // tenta o próximo modelo
      }

      const part = data.candidates?.[0]?.content?.parts?.find(p => p.text && !p.thought) || data.candidates?.[0]?.content?.parts?.[0];
      if (part && part.text) {
        return part.text;
      }
    } catch (e) {
      console.warn(`[HTB-Translator] Falha na chamada ao ${modelo}:`, e.message);
      ultimoErro = e;
    }
  }

  throw ultimoErro || new Error('Não foi possível obter resposta da API Gemini.');
}

// Ouvinte de mensagens do content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate_batch') {
    (async () => {
      try {
        const itensParaEnviar = request.items.map(it => ({
          id: it.id,
          text: it.text
        }));

        const jsonPrompt = JSON.stringify(itensParaEnviar);
        const respostaTexto = await chamarGemini(jsonPrompt);
        
        let resultadoParsed;
        try {
          resultadoParsed = JSON.parse(respostaTexto);
        } catch (e) {
          // Extrai bloco JSON se vier encapsulado em markdown
          const match = respostaTexto.match(/\{[\s\S]*\}/);
          if (match) {
            resultadoParsed = JSON.parse(match[0]);
          } else {
            throw new Error('Falha ao processar JSON da resposta da IA');
          }
        }

        const translations = resultadoParsed.translations || resultadoParsed;
        sendResponse({ success: true, results: translations });
      } catch (err) {
        console.error('[HTB-Translator] Erro no lote:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // mantém o canal aberto para resposta assíncrona
  }

  if (request.action === 'ping') {
    (async () => {
      const key = await obterApiKey();
      sendResponse({ success: true, hasKey: !!key });
    })();
    return true;
  }
});

// Suporte adicional a Menu de Contexto (clique com botão direito para seleção)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "traduzir-htb-selecao",
    title: "🛡️ Traduzir seleção com Contexto HTB",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "traduzir-htb-selecao" && tab.id) {
    const texto = info.selectionText;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injetarPopupStatus,
      args: ["⏳ Traduzindo seleção com contexto HTB..."]
    });

    try {
      const apiKey = await obterApiKey();
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: "Você é um especialista em cibersegurança do HTB Academy. Traduza o texto técnico para o Português do Brasil mantendo nomes de ferramentas, códigos e jargões consolidados (ex: Forward Proxy, tampering, pivoting, payload) estritamente em inglês sem duplicatas ou traduções redundantes entre parênteses ao lado. Responda apenas com a tradução fluida e natural."
            }]
          },
          contents: [{ parts: [{ text: texto }] }]
        })
      });

      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      const traduzido = data.candidates?.[0]?.content?.parts?.find(p => p.text && !p.thought)?.text || data.candidates?.[0]?.content?.parts?.[0]?.text;

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: injetarPopupStatus,
        args: [traduzido]
      });
    } catch (e) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: injetarPopupStatus,
        args: ["❌ Erro na tradução: " + e.message]
      });
    }
  }
});

function injetarPopupStatus(texto) {
  let popup = document.getElementById('htb-selection-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'htb-selection-popup';
    document.body.appendChild(popup);
  }

  popup.innerHTML = `
    <div class="htb-popup-header">
      <span>🛡️ Tradução HTB</span>
      <button class="htb-close-btn" id="htb-popup-close">&times;</button>
    </div>
    <div style="margin-top: 8px; white-space: pre-wrap;">${texto}</div>
  `;

  document.getElementById('htb-popup-close').onclick = () => popup.remove();
}
