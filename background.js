// HTB Academy AI Translator - Background Service Worker
'use strict';

try {
  importScripts('config.js');
} catch (e) {}

const api = globalThis.chrome || globalThis.browser;

// Recupera configurações do storage da extensão
async function obterConfiguracoes() {
  let config = { provider: 'gemini', apiKey: null };
  if (api && api.storage && api.storage.local) {
    const data = await api.storage.local.get(['geminiApiKey', 'claudeApiKey', 'apiProvider', 'htbApiKey']);
    config.provider = data.apiProvider || 'gemini';

    if (config.provider === 'gemini') {
      if (data.geminiApiKey && data.geminiApiKey.trim() !== '') {
        config.apiKey = data.geminiApiKey.trim();
      } else if (data.htbApiKey && data.htbApiKey.trim() !== '') {
        config.apiKey = data.htbApiKey.trim();
      }
    } else if (config.provider === 'claude') {
      if (data.claudeApiKey && data.claudeApiKey.trim() !== '') {
        config.apiKey = data.claudeApiKey.trim();
      }
    }
  }

  if (!config.apiKey && typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY !== 'SUA_CHAVE_API_AQUI') {
    config.provider = 'gemini';
    config.apiKey = CONFIG.GEMINI_API_KEY.trim();
  }

  return config;
}

// Prompt especializado em Cibersegurança do HTB Academy
const SYSTEM_PROMPT = `Você é um tradutor especialista de altíssimo nível em Cibersegurança, Ethical Hacking e Pentest do Hack The Box (HTB) Academy.
Sua missão é traduzir o conteúdo técnico do inglês para o Português do Brasil (pt-BR) com rigor conceitual, fluência e vocabulário técnico natural.

REGRAS CRÍTICAS DE TRADUÇÃO:
1. PROIBIÇÃO ABSOLUTA DE TRADUÇÕES DUPLICADAS:
   NUNCA coloque o termo em inglês e uma tradução redundante lado a lado entre parênteses ou barras.
   ❌ ERRADO: "Forward Proxy (proxy de encaminhamento)"
   ❌ ERRADO: "pivoting / pivoteamento"
   ❌ ERRADO: "Wordlist (lista de palavras)"
   ❌ ERRADO: "Reverse Shell (shell reversa)"
   ❌ ERRADO: "payload (carga útil)"
   ❌ ERRADO: "HTTP Requests (requisições HTTP)"

2. TERMINOLOGIA DE CIBERSEGURANÇA:
   Mantenha estritamente em inglês (sem tradução):
   Burp Suite, Nmap, Metasploit, Wireshark, Cloudflare, ModSecurity, curl, netcat, socat, hydra, sqlmap, john, hashcat, mimikatz, ffuf, gobuster, Responder.
   Forward Proxy, Reverse Proxy, Transparent Proxy, Non-Transparent Proxy, Pivoting, Listener, Payload, Exploit, Reverse Shell, Bind Shell, Web Shell, Buffer Overflow, Bypass, Privilege Escalation, Root, Tampering, Spoofing, Tunneling, C2, Command and Control, Wordlist, Fuzzing, Brute Force, Handshake, Exfiltration, Beaconing, Foothold, Pwn, Writeup, Target, Endpoint, Header, Cookie, Session Hijacking, Directory Traversal, Path Traversal, Injection, SQL Injection, XSS, SSRF, CSRF, Race Condition, Man-in-the-Middle (MitM).

3. TERMOS TRADUZÍVEIS COM NATURALIDADE:
   Traduza diretamente sem duplicar:
   ✓ "requisições HTTP" (sem parênteses)
   ✓ "servidor web"
   ✓ "banco de dados"
   ✓ "navegador"
   ✓ "rede local"

4. PRESERVAÇÃO DE CÓDIGO E PLACEHOLDERS:
   NUNCA altere nem remova marcadores como __CODE_0__, __CODE_1__, etc.
   Preserve comandos, flags, caminhos de arquivo, variáveis, IPs e portas exatamente como estão.

5. FORMATO DE RESPOSTA:
   Responda ESTRITAMENTE em formato JSON:
   {
     "translations": [
       { "id": 0, "translatedText": "texto traduzido aqui" }
     ]
   }`;

// Chama o Google Gemini com os modelos oficiais rápidos
async function chamarGemini(apiKey, payload, customGlossary = '') {
  const modelos = ['gemini-1.5-flash', 'gemini-1.5-flash-8b'];
  let sysInstructionText = SYSTEM_PROMPT;
  if (customGlossary && customGlossary.trim()) {
    sysInstructionText += `\n\nGLOSSÁRIO OBRIGATÓRIO DO USUÁRIO (NUNCA TRADUZA ESTES TERMOS): ${customGlossary.trim()}`;
  }

  let ultimoErro = null;

  for (const modelo of modelos) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;

      const corpo = {
        systemInstruction: { parts: [{ text: sysInstructionText }] },
        contents: [{ parts: [{ text: payload }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
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
        continue;
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

// Chama o Anthropic Claude
async function chamarClaude(apiKey, payload, customGlossary = '') {
  let sysInstructionText = SYSTEM_PROMPT;
  if (customGlossary && customGlossary.trim()) {
    sysInstructionText += `\n\nGLOSSÁRIO OBRIGATÓRIO DO USUÁRIO (NUNCA TRADUZA ESTES TERMOS): ${customGlossary.trim()}`;
  }

  // Usar pre-fill para forçar a saída JSON
  sysInstructionText += '\n\nResponda estritamente com o objeto JSON sem marcadores de markdown.';

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
        system: sysInstructionText,
        messages: [
          { role: 'user', content: payload }
        ],
        temperature: 0.1
      })
    });

    const data = await resp.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (data.content && data.content.length > 0 && data.content[0].text) {
      return data.content[0].text;
    }

    throw new Error('Formato de resposta inesperado da API Claude');
  } catch (e) {
    console.warn(`[HTB-Translator] Falha na chamada ao Claude:`, e.message);
    throw e;
  }
}

// Ouvinte de mensagens da extensão
api.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate_batch') {
    (async () => {
      try {
        const config = await obterConfiguracoes();
        if (!config.apiKey) {
          throw new Error('Chave de API não configurada. Configure no popup da extensão.');
        }

        const itensParaEnviar = request.items.map(it => ({
          id: it.id,
          text: it.text
        }));

        const jsonPrompt = JSON.stringify(itensParaEnviar);
        let respostaTexto;

        if (config.provider === 'claude') {
          respostaTexto = await chamarClaude(config.apiKey, jsonPrompt, request.glossary || '');
        } else {
          respostaTexto = await chamarGemini(config.apiKey, jsonPrompt, request.glossary || '');
        }

        let resultadoParsed;
        try {
          resultadoParsed = JSON.parse(respostaTexto);
        } catch (e) {
          const match = respostaTexto.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
          if (match) {
            resultadoParsed = JSON.parse(match[0]);
          } else {
            throw new Error('Falha ao processar JSON da resposta da IA');
          }
        }

        const translations = Array.isArray(resultadoParsed) 
          ? resultadoParsed 
          : (resultadoParsed.translations || []);

        sendResponse({ success: true, results: translations });
      } catch (err) {
        console.error('[HTB-Translator] Erro no lote:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // canal assíncrono
  }

  if (request.action === 'ping') {
    (async () => {
      const config = await obterConfiguracoes();
      sendResponse({ success: true, hasKey: !!config.apiKey });
    })();
    return true;
  }
});
