# Changelog

Todas as mudanças relevantes do projeto são documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.3.1] — 2026-09-29

### Corrigido
- Inicialização e navegação automática, respostas atrasadas, cache de sessão e alternância original/tradução.
- Preservação do DOM e de código; saída da IA nunca é interpretada como HTML.
- Glossário funcional e prompt único com escolha contextual de termos em pt-BR e inglês.
- Chave efetiva no teste do popup, isolamento do storage e atualização segura pelo terminal.
- Proteção contra tradução sobreposta do Google, com recuperação limitada do original.
- Lista de modelos usada pelo atualizador e pelo background.

### Validação e documentação
- Testes de regressão no Node/Chromium e Python.
- Instruções alinhadas ao comportamento, privacidade explícita e plano de melhorias focado na qualidade contextual.

---

## [1.2.0] — 2026-09-29

### Adicionado
- **Popup no ícone da extensão** com interface completa para gerenciamento de chave de API.
- Campo de entrada com **máscara de asteriscos** (`type="password"`) para privacidade ao digitar a chave.
- Botão **Mostrar/Ocultar** (👁️) para visualizar a chave digitada.
- **Testador de conexão** que valida a chave contra a API do Google Gemini em tempo real.
- **Auto-tradução de seções** ao navegar (Next/Previous/Sidebar) — ativada por padrão.
- Detecção de navegação SPA via interceptação de `history.pushState`, `history.replaceState`, `popstate`.
- `MutationObserver` no container `.module-content` para detectar injeção de novo conteúdo no DOM.
- Delegação de cliques nos botões de navegação do HTB Academy.
- Comunicação bidirecional entre popup e content script (`trigger_translate`, `set_auto_translate`, `api_key_updated`).
- Arquivos `popup.html`, `popup.css`, `popup.js` criados.
- Permissão `tabs` adicionada ao manifest para comunicação com abas ativas.

### Alterado
- **Prioridade de chave de API invertida:** `chrome.storage.local` agora tem prioridade sobre `config.js` (antes era o contrário).
- **Prompt da IA revisado** com proibições estritas contra duplicatas redundantes:
  - Proibido: `"Forward Proxy (proxy de encaminhamento)"`, `"requisições HTTP (HTTP Requests)"`, etc.
  - Lista expandida de termos a preservar em inglês (50+ termos de InfoSec).
  - Distinção clara entre termos que ficam em inglês e termos gerais traduzíveis.
- Prompt de tradução de seleção (menu de contexto) atualizado com mesmas regras anti-duplicata.
- Versão do manifest atualizada para `1.2`.

### Corrigido
- Bug onde a chave salva pelo popup não era utilizada se `config.js` existisse com uma chave válida.

---

## [1.1.0] — 2026-09-29

### Adicionado
- Script interativo `atualizar_api.py` e atalho `atualizar_api.sh` para configurar chave de API pelo terminal.
- Validação da chave contra a API do Gemini antes de salvar.
- Proteção automática do `config.js` no `.gitignore`.

---

## [1.0.0] — 2026-09-29

### Adicionado
- Extensão Chrome Manifest V3 com service worker.
- Tradução por lotes via Google Gemini API (modelos `gemini-3.5-flash-lite` e `gemini-3.5-flash`).
- Widget flutuante com tema visual do Hack The Box (escuro com verde neon `#9fef00`).
- Proteção automática de blocos `<code>` com sistema de placeholders `__CODE_N__`.
- Toggle instantâneo EN ↔ PT-BR sem reprocessar pela IA.
- Menu de contexto para tradução de seleções avulsas.
- Arquivo `config.example.js` como template seguro.
- Documentação completa no `README.md`.
