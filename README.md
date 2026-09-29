<div align="center">

# 🛡️ HTB Context Translator

### Tradutor com IA Contextual para o Hack The Box Academy

<br>

![Manifest V3](https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Gemini API](https://img.shields.io/badge/Google_Gemini-API-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![HTB Academy](https://img.shields.io/badge/Hack_The_Box-Academy-9fef00?style=for-the-badge&logo=hackthebox&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br>

**Extensão para Google Chrome que traduz os cursos do HTB Academy do inglês para o Português do Brasil usando a IA do Google Gemini, preservando integralmente nomes de ferramentas, jargões de segurança ofensiva, comandos e blocos de código.**

[Instalação](#-instalação) •
[Configuração da API](#-configuração-da-chave-de-api) •
[Como Usar](#-como-usar) •
[Segurança](#-modelo-de-segurança-da-chave-de-api) •
[Contribuir](#-contribuindo)

</div>

---

## 📋 Índice

- [Problema e Motivação](#-problema-e-motivação)
- [Funcionalidades](#-funcionalidades)
- [Demonstração](#-demonstração)
- [Instalação](#-instalação)
- [Configuração da Chave de API](#-configuração-da-chave-de-api)
- [Como Usar](#-como-usar)
- [Modelo de Segurança da Chave de API](#-modelo-de-segurança-da-chave-de-api)
- [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## ❌ Problema e Motivação

Tradutores genéricos de navegadores (como o Google Tradutor integrado ao Chrome) **destroem** conteúdos técnicos de cibersegurança:

| Problema | Exemplo |
|---|---|
| Traduzem nomes de ferramentas | `Burp Suite` → ~~"Suite de Arrotos"~~ |
| Traduzem jargões consolidados | `Forward Proxy` → ~~"proxy de encaminhamento"~~ |
| Criam duplicatas redundantes | ~~"tampering (adulteração)"~~ |
| Quebram comandos e código | `nmap -sV -p-` → ~~"nmap -sV -p−"~~ (troca hífen por travessão) |
| Destroem payloads e paths | `/etc/passwd` → ~~"/etc/senha"~~ |

### ✅ Como o HTB Context Translator resolve

A extensão usa IA generativa (Google Gemini) com um **prompt especializado em segurança ofensiva** que entende o domínio técnico do HTB Academy. A IA sabe distinguir:

- **O que NÃO traduzir:** Ferramentas (`Burp Suite`, `Nmap`, `sqlmap`), jargões (`Forward Proxy`, `pivoting`, `payload`, `reverse shell`, `tampering`, `C2`), comandos, flags, caminhos, IPs, hashes.
- **O que traduzir naturalmente:** Linguagem explicativa e didática para um Português do Brasil fluente e profissional, como um instrutor sênior de pentest escreveria.
- **O que NUNCA fazer:** Criar duplicatas redundantes entre parênteses (ex: nunca faz `"Forward Proxy (proxy de encaminhamento)"` ou `"requisições HTTP (HTTP Requests)"`).

---

## ✨ Funcionalidades

### Tradução Inteligente com IA Contextual
- Tradução por lotes com modelos `gemini-3.5-flash-lite` (rápido) e `gemini-3.5-flash` (fallback).
- Prompt com mais de 50 regras e proibições específicas para terminologia de InfoSec.
- Proteção automática de tags `<code>` inline com sistema de placeholders.

### Popup de Configuração no Ícone da Extensão
- **Campo de chave com máscara de asteriscos** (`type="password"`) — os caracteres ficam ocultos ao digitar.
- Botão **Mostrar/Ocultar** (👁️) para visualizar a chave quando necessário.
- **Testador de conexão** que valida a chave diretamente contra a API do Google Gemini em tempo real.
- A chave salva é ativada **instantaneamente** em todas as abas do HTB Academy.

### Auto-Tradução de Seções (Avançar / Voltar)
- Detecta navegação no SPA Vue.js do HTB Academy via `history.pushState`, `popstate` e `MutationObserver`.
- Ao clicar em **"Next Section"**, **"Previous Section"** ou selecionar lições no índice lateral, a nova seção é traduzida automaticamente.
- Toggle on/off disponível tanto no popup quanto no widget flutuante.

### Widget Flutuante no Curso
- Interface discreta no canto inferior direito com o tema visual oficial do Hack The Box (escuro com verde neon `#9fef00`).
- **Tradução manual** com 1 clique.
- **Alternador EN ↔ PT-BR** instantâneo sem reprocessar pela IA (mantém cache local).

### Menu de Contexto (Seleção Avulsa)
- Selecione qualquer trecho da página → botão direito → **"🛡️ Traduzir seleção com Contexto HTB"**.
- A tradução aparece em um popup flutuante na página.

---

## 🖼️ Demonstração

<div align="center">

| Widget no Curso | Popup no Ícone |
|---|---|
| Widget verde neon no canto inferior direito da página do HTB Academy com botões de tradução e toggle EN/PT | Popup com campo mascarado para chave de API, testador de conexão e switch de auto-tradução |

</div>

> **Nota:** Para ver a extensão em funcionamento, instale-a seguindo os passos abaixo e acesse qualquer módulo do [HTB Academy](https://academy.hackthebox.com/).

---

## 🚀 Instalação

### Pré-requisitos
- [Google Chrome](https://www.google.com/chrome/) (versão 102 ou superior)
- Uma **chave de API do Google Gemini** gratuita → [Obter aqui](https://aistudio.google.com/apikey)

### Passos

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Mid-night2026/htb-context-translator.git
   cd htb-context-translator
   ```

2. **Abra o Chrome e acesse:**
   ```
   chrome://extensions/
   ```

3. Ative o **Modo do desenvolvedor** (toggle no canto superior direito).

4. Clique em **"Carregar sem compactação"** (ou *"Load unpacked"*).

5. Selecione a pasta **`HTB-Context-Translator/`** dentro do repositório clonado.

6. ✅ A extensão está instalada! O ícone do escudo aparecerá na barra de ferramentas do Chrome.

> **Atualizando:** Se já tinha uma versão anterior, clique no botão de recarregar 🔄 no card da extensão em `chrome://extensions/`.

---

## 🔑 Configuração da Chave de API

A extensão usa a API do **Google Gemini** para traduzir. Você precisa de uma chave pessoal e gratuita.

### Obter sua chave gratuita

1. Acesse o [Google AI Studio](https://aistudio.google.com/apikey).
2. Faça login com sua conta Google.
3. Clique em **"Create API Key"**.
4. Copie a chave gerada (formato: `AIzaSy...`).

### Configurar na extensão

Você tem **duas opções**. Escolha a que preferir:

#### Opção 1: Pelo Popup no Chrome (Recomendado)

1. Clique no ícone 🛡️ do **HTB Context Translator** na barra de ferramentas do Chrome.
2. No campo **"Configurar Nova Chave de API"**, cole sua chave. Cada caractere será protegido por asteriscos `•••` para privacidade.
3. *(Opcional)* Clique em **⚡ Testar Conexão** para validar se a chave está ativa.
4. Clique em **💾 Salvar Chave**.
5. Pronto! A chave é salva no armazenamento local do Chrome e ativada instantaneamente.

#### Opção 2: Pelo Terminal (CLI)

```bash
cd HTB-Context-Translator/
./atualizar_api.sh
```

O script solicita a nova chave, valida-a contra a API do Google e salva no `config.js` local.

> ⚠️ **Nenhuma chave de API é armazenada no repositório.** Veja detalhes em [Modelo de Segurança](#-modelo-de-segurança-da-chave-de-api).

---

## 📖 Como Usar

1. Acesse qualquer módulo do [HTB Academy](https://academy.hackthebox.com/).
2. O **widget flutuante** aparecerá no canto inferior direito.
3. Se **Auto-traduzir** estiver ativo (padrão), as seções serão traduzidas automaticamente ao navegar.
4. Ou clique em **✨ Traduzir Página (IA)** para tradução manual.
5. Use **🔄 Ver Original (EN)** para alternar entre tradução e original instantaneamente.
6. Para trechos avulsos: selecione o texto → botão direito → **"Traduzir seleção com Contexto HTB"**.

---

## 🔒 Modelo de Segurança da Chave de API

Esta extensão adota o modelo **BYOK (Bring Your Own Key)**: cada usuário fornece e controla sua própria chave de API do Google Gemini. A chave **nunca** é compartilhada, coletada ou transmitida a terceiros.

### Como a chave é protegida

| Camada | Proteção | Detalhes |
|---|---|---|
| **Git** | `.gitignore` | O arquivo `config.js` (que contém a chave local) está listado no `.gitignore` e **nunca** é versionado ou enviado ao GitHub. |
| **Repositório** | `config.example.js` | Apenas um template com placeholder (`SUA_CHAVE_API_AQUI`) é commitado. |
| **Chrome** | `chrome.storage.local` | A chave salva pelo popup é armazenada apenas localmente no perfil do Chrome do usuário, isolada por extensão. Não é sincronizada entre dispositivos. |
| **Interface** | Máscara de asteriscos | O campo de entrada no popup usa `type="password"` — os caracteres ficam ocultos. A chave exibida no status é mascarada (ex: `AIzaSy••••••••••••dX4f`). |
| **Transmissão** | HTTPS apenas | A chave só é enviada via HTTPS diretamente para `generativelanguage.googleapis.com`. Nenhum servidor intermediário é usado. |

### Recomendações para quem usa publicamente

1. **Nunca compartilhe sua chave.** Cada pessoa deve gerar a própria em [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. **Restrinja a chave no Google Cloud Console** → Limitar a chave apenas para a API "Generative Language".
3. **Se suspeitar de vazamento**, revogue a chave no [Google Cloud Console](https://console.cloud.google.com/apis/credentials) e gere uma nova.

> Para detalhes completos, consulte o guia [SECURITY.md](SECURITY.md).

---

## 🏗️ Arquitetura e Tecnologias

```
┌─────────────────────────────────────────────────────────┐
│                    Google Chrome                        │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐   ┌────────────┐ │
│  │  popup.html   │    │ content.js   │   │ styles.css │ │
│  │  popup.css    │    │ (injetado no │   │ (tema HTB) │ │
│  │  popup.js     │    │  HTB Academy)│   └────────────┘ │
│  │              │    │              │                   │
│  │ • Chave API   │    │ • Widget     │                   │
│  │ • Auto-trad.  │    │ • Coleta DOM │                   │
│  │ • Teste conn. │    │ • Aplica trad│                   │
│  └──────┬───────┘    └──────┬───────┘                   │
│         │                   │                            │
│         │  chrome.runtime   │                            │
│         │  .sendMessage()   │                            │
│         ▼                   ▼                            │
│  ┌─────────────────────────────────────┐                │
│  │       background.js                 │                │
│  │     (Service Worker MV3)            │                │
│  │                                     │                │
│  │  • obterApiKey() [storage > config] │                │
│  │  • chamarGemini() [flash-lite/flash]│                │
│  │  • SYSTEM_PROMPT (50+ regras)       │                │
│  │  • Context Menu handler             │                │
│  └───────────────┬─────────────────────┘                │
│                  │ HTTPS                                 │
└──────────────────┼───────────────────────────────────────┘
                   ▼
    ┌──────────────────────────────┐
    │  Google Gemini API           │
    │  generativelanguage          │
    │  .googleapis.com             │
    │                              │
    │  Models:                     │
    │  • gemini-3.5-flash-lite     │
    │  • gemini-3.5-flash          │
    └──────────────────────────────┘
```

| Tecnologia | Uso |
|---|---|
| **Manifest V3** | Padrão atual para extensões Chrome (service worker, permissions model) |
| **Google Gemini API** | Motor de IA generativa para tradução contextual |
| **chrome.storage.local** | Persistência segura de preferências e chave de API |
| **MutationObserver** | Detecção de novo conteúdo injetado no DOM pela SPA Vue.js |
| **History API hooks** | Interceptação de `pushState`/`replaceState` para navegação SPA |

---

## 📁 Estrutura do Projeto

```text
htb-context-translator/
├── README.md                        # Esta documentação
├── INSTRUCTIONS.md                  # Guia detalhado de instalação e uso
├── SECURITY.md                      # Política de segurança e chaves de API
├── CONTRIBUTING.md                  # Guia de contribuição
├── LICENSE                          # Licença MIT
├── .gitignore                       # Proteção contra credenciais e lixo
│
└── HTB-Context-Translator/          # 📦 Pasta da extensão (carregar no Chrome)
    ├── manifest.json                # Manifesto V3 da extensão
    ├── background.js                # Service Worker: API Gemini + prompt IA
    ├── content.js                   # Content script: widget, tradução, navegação SPA
    ├── styles.css                   # Estilos do widget e popups no curso
    ├── popup.html                   # Interface do popup (ícone da extensão)
    ├── popup.css                    # Estilos do popup (tema HTB dark)
    ├── popup.js                     # Lógica do popup (chave mascarada, teste API)
    ├── config.example.js            # Template para chave de API (placeholder)
    ├── config.js                    # ⛔ Chave local (NÃO versionado, no .gitignore)
    ├── atualizar_api.py             # Script CLI interativo para atualizar chave
    ├── atualizar_api.sh             # Atalho shell para o script de chave
    └── icons/                       # Ícones da extensão
        ├── icon16.png
        ├── icon48.png
        └── icon128.png
```

---

## 🗺️ Roadmap

### ✅ v1.0 — Base Funcional
- [x] Extensão Manifest V3 com service worker
- [x] Tradução por lotes via Google Gemini API
- [x] Widget flutuante com tema HTB
- [x] Proteção de blocos `<code>` com placeholders
- [x] Toggle instantâneo EN ↔ PT-BR
- [x] Menu de contexto para seleções avulsas
- [x] Script CLI para atualizar chave de API

### ✅ v1.2 — Popup, Auto-Tradução e Prompt Avançado
- [x] Popup no ícone com campo de API mascarado por asteriscos
- [x] Testador de conexão com a API Gemini em tempo real
- [x] Auto-tradução de seções ao navegar (Next/Previous/Sidebar)
- [x] Detecção de navegação SPA via History API + MutationObserver
- [x] Prompt revisado com proibições estritas contra duplicatas redundantes
- [x] Prioridade de chave: `chrome.storage.local` > `config.js`

### 🔜 v1.3 — Melhorias Planejadas
- [ ] Cache de traduções por seção (evitar reprocessar ao revisitar)
- [ ] Indicador de progresso por parágrafo durante a tradução
- [ ] Suporte a atalho de teclado (ex: `Ctrl+Shift+T` para traduzir)
- [ ] Exportar tradução da seção como PDF ou Markdown
- [ ] Seletor de idioma alvo (pt-BR, es, fr, etc.)

### 🔮 Futuro
- [ ] Publicação na Chrome Web Store
- [ ] Backend proxy opcional para quem não quer gerenciar chave de API
- [ ] Suporte a outros modelos de IA (OpenAI, Anthropic, local via Ollama)
- [ ] Glossário técnico personalizável pelo usuário

---

## ⚠️ Isenção de Responsabilidade (Disclaimer)

Este é um projeto de código aberto criado pela comunidade e **não possui afiliação, patrocínio ou endosso oficial do Hack The Box ou do Google**.

- A extensão **não** burla paywalls, **não** distribui material VIP/pago e **não** armazena conteúdo protegido por direitos autorais.
- A tradução ocorre estritamente do lado do cliente (no seu navegador), modificando apenas a visualização (DOM) das páginas que você já tem acesso legítimo via sua conta no HTB Academy.
- A responsabilidade pelo uso e guarda das chaves de API do Google Gemini recai inteiramente sobre o usuário final.

---


## 🤝 Contribuindo

Contribuições são bem-vindas! Veja o guia completo em [CONTRIBUTING.md](CONTRIBUTING.md).

**Resumo rápido:**

1. Faça um Fork do repositório
2. Crie uma branch: `git checkout -b feature/minha-melhoria`
3. Faça suas alterações e commite: `git commit -m "feat: descrição da melhoria"`
4. Envie: `git push origin feature/minha-melhoria`
5. Abra um Pull Request

> ⚠️ **Nunca commite chaves de API ou credenciais.** Veja [SECURITY.md](SECURITY.md).

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para detalhes completos.

---

<div align="center">

**Desenvolvido com 💚 para a comunidade de Cibersegurança brasileira**

*Feito por [Mid-night2026](https://github.com/Mid-night2026)*

</div>
