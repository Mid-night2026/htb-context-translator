// HTB Academy AI Translator - Background Service Worker
'use strict';

const api = globalThis.chrome || globalThis.browser;

// Recupera a API key do storage da extensão
async function obterApiKey() {
  if (api && api.storage && api.storage.local) {
    const data = await api.storage.local.get(['geminiApiKey']);
    if (data.geminiApiKey && data.geminiApiKey.trim() !== '') {
      return data.geminiApiKey.trim();
    }
  }
  return null;
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
async function chamarGemini(payload, customGlossary = '') {
  const apiKey = await obterApiKey();
  if (!apiKey) {
    throw new Error('Chave de API do Gemini não configurada. Configure no popup da extensão.');
  }

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
        system_instruction: { parts: [{ text: sysInstructionText }] },
        contents: [{ parts: [{ text: payload }] }],
        generationConfig: {
          temperature: 0.1,
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

// Ouvinte de mensagens da extensão
api.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate_batch') {
    (async () => {
      try {
        const itensParaEnviar = request.items.map(it => ({
          id: it.id,
          text: it.text
        }));

        const jsonPrompt = JSON.stringify(itensParaEnviar);
        const respostaTexto = await chamarGemini(jsonPrompt, request.glossary || '');

        let resultadoParsed;
        try {
          resultadoParsed = JSON.parse(respostaTexto);
        } catch (e) {
          const match = respostaTexto.match(/\{[\s\S]*\}/);
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
      const key = await obterApiKey();
      sendResponse({ success: true, hasKey: !!key });
    })();
    return true;
  }
});
