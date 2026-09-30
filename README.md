<div align="center">

# 🛡️ HTB Context Translator

### Tradutor com IA Contextual para o Hack The Box Academy

<br>

![Manifest V3](https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Gemini API](https://img.shields.io/badge/Google_Gemini-API-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![HTB Academy](https://img.shields.io/badge/Hack_The_Box-Academy-9fef00?style=for-the-badge&logo=hackthebox&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br>

**Extensão para Google Chrome que traduz os cursos do HTB Academy do inglês para o Português do Brasil usando a IA do Google Gemini, com português técnico natural, preservação de código e escolha contextual dos termos que devem permanecer em inglês.**

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

Traduções genéricas podem perder o sentido de termos técnicos ou alterar exemplos. A extensão procura evitar problemas como:

| Problema | Exemplo |
|---|---|
| Traduzem nomes de ferramentas | `Burp Suite` → ~~"Suite de Arrotos"~~ |
| Traduzem jargões consolidados | `Forward Proxy` → ~~"proxy de encaminhamento"~~ |
| Criam duplicatas redundantes | ~~"tampering (adulteração)"~~ |
| Quebram comandos e código | `nmap -sV -p-` → ~~"nmap -sV -p−"~~ (troca hífen por travessão) |
| Destroem payloads e paths | `/etc/passwd` → ~~"/etc/senha"~~ |

### ✅ Como o HTB Context Translator resolve

A extensão usa IA generativa (Google Gemini) com um **prompt especializado em segurança ofensiva** que entende o domínio técnico do HTB Academy. O prompt orienta a IA a distinguir; a revisão humana continua necessária para avaliar a qualidade:

- **O que preservar:** Ferramentas (`Burp Suite`, `Nmap`, `sqlmap`), jargões consagrados (`forward proxy`, `pivoting`, `payload`, `reverse shell`, `C2`), comandos, flags, caminhos, IPs, hashes.
- **O que traduzir naturalmente:** Linguagem explicativa e didática para um Português do Brasil fluente e profissional, como um instrutor sênior de pentest escreveria.
- **O que NUNCA fazer:** Criar duplicatas redundantes entre parênteses (ex: nunca faz `"Forward Proxy (proxy de encaminhamento)"` ou `"requisições HTTP (HTTP Requests)"`).

---

## ✨ Funcionalidades

### Tradução Inteligente com IA Contextual
- Tradução por lotes com modelos `gemini-3.5-flash-lite` (rápido) e `gemini-3.5-flash` (fallback).
- Um único prompt para página e seleção, com contexto do parágrafo e glossário opcional. Conceitos como alvo, força bruta e escalonamento de privilégios são traduzidos conforme o contexto.
- Código e terminais ficam intactos. Somente nós de texto são alterados; links, formatação e eventos continuam funcionando.

### Popup de Configuração no Ícone da Extensão
- **Campo de chave com máscara de asteriscos** (`type="password"`) — os caracteres ficam ocultos ao digitar.
- Botão **Mostrar/Ocultar** (👁️) para visualizar a chave quando necessário.
- **Testador de conexão** que valida a chave diretamente contra a API do Google Gemini em tempo real.
- A chave salva é ativada **instantaneamente** em todas as abas do HTB Academy.

### Auto-Tradução de Seções (Avançar / Voltar)
- Detecta mudanças de URL e conteúdo, inclusive texto carregado depois na mesma seção. Cancela traduções da seção anterior.
- Ao clicar em **"Next Section"**, **"Previous Section"** ou selecionar lições no índice lateral, a nova seção é traduzida automaticamente.
- Toggle on/off disponível tanto no popup quanto no widget flutuante.

### Widget Flutuante no Curso
- Interface discreta no canto inferior direito com o tema visual inspirado no Hack The Box (escuro com verde neon `#9fef00`).
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
- Uma **chave pessoal da API do Google Gemini** → [Obter aqui](https://aistudio.google.com/apikey)

### Passos

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/NexusGuard-Labs/htb-context-translator.git
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

A extensão usa a API do **Google Gemini** para traduzir. Cada pessoa utiliza uma chave própria; disponibilidade e limites dependem do modelo e do projeto no Google AI Studio.

### Obter sua chave

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

O script solicita a chave sem exibi-la, verifica a autenticação e grava `config.js` com permissão `600`. Recarregue a extensão e as abas depois. Entre popup e terminal, vale a configuração mais recente; arquivos antigos sem data mantêm o popup como prioridade. O teste do popup também executa uma tradução curta, consumindo cota.

> ⚠️ **Nenhuma chave de API é armazenada no repositório.** Veja detalhes em [Modelo de Segurança](#-modelo-de-segurança-da-chave-de-api).

---

## 📖 Como Usar

1. Acesse qualquer módulo do [HTB Academy](https://academy.hackthebox.com/).
2. O **widget flutuante** aparecerá no canto inferior direito.
3. Se **Auto-traduzir** estiver ativo (padrão), as seções serão traduzidas automaticamente ao navegar.
4. Ou clique em **Traduzir / tentar novamente** para tradução manual.
5. Use **🔄 Ver Original (EN)** para alternar entre tradução e original instantaneamente.
6. Para trechos avulsos: selecione o texto → botão direito → **"Traduzir seleção com Contexto HTB"**.

---

## 🔒 Modelo de Segurança da Chave de API

Esta extensão adota o modelo **BYOK (Bring Your Own Key)**: cada usuário fornece e controla sua própria chave de API do Google Gemini. A chave é enviada somente à API do Google. Os trechos do curso e o contexto necessário também são enviados ao Google para tradução. A organização e o owner não recebem essas chaves pela extensão.

### Como a chave é protegida

| Camada | Proteção | Detalhes |
|---|---|---|
| **Git** | `.gitignore` | O arquivo `config.js` (que contém a chave local) é ignorado pelo Git. Não use `git add -f`: a exclusão não protege arquivos forçadamente adicionados ou já rastreados. |
| **Repositório** | `config.example.js` | Apenas um template com placeholder (`SUA_CHAVE_API_AQUI`) é commitado. |
| **Chrome** | `chrome.storage.local` | A chave salva pelo popup é armazenada apenas localmente no perfil do Chrome do usuário, isolada por extensão. Não é sincronizada entre dispositivos. |
| **Interface** | Máscara de asteriscos | O campo de entrada no popup usa `type="password"` — os caracteres ficam ocultos. O status mostra apenas a existência e origem da configuração, sem trechos da chave. |
| **Transmissão** | HTTPS apenas | A chave só é enviada via HTTPS diretamente para `generativelanguage.googleapis.com`. Nenhum servidor intermediário é usado. |

### Recomendações para quem usa publicamente

1. **Nunca compartilhe sua chave.** Cada pessoa deve gerar a própria em [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. **Restrinja a chave no Google Cloud Console** → Limitar a chave apenas para a API "Generative Language".
3. **Se suspeitar de vazamento**, revogue a chave no [Google Cloud Console](https://console.cloud.google.com/apis/credentials) e gere uma nova.

> A máscara não criptografa a chave: quem tem acesso ao seu perfil do navegador pode inspecioná-la. Não distribua uma chave da organização junto com a extensão. Veja [SECURITY.md](SECURITY.md) e a [orientação oficial do Google](https://ai.google.dev/gemini-api/docs/api-key).

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
│  │  • credential() [mais recente]     │                │
│  │  • translate() [flash-lite/flash]  │                │
│  │  • SYSTEM_PROMPT (contexto)        │                │
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
| **chrome.storage.local** | Persistência local; chave acessível apenas aos contextos da extensão |
| **MutationObserver** | Detecção de novo conteúdo injetado no DOM pela SPA Vue.js |
| **URL + eventos de navegação** | Detecta avanço/retorno sem substituir funções da página |

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
    ├── content.js                   # Texto, cache, widget e navegação
    ├── translation-guard.js         # Proteção contra tradução sobreposta
    ├── models.json                  # Modelos usados pela API
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

## 🗺️ Estado atual e próximos passos

A revisão **1.3.1** corrige a inicialização, preserva o DOM, conecta o glossário, valida respostas do Gemini e resolve erros de cache e navegação. Mantém chave mascarada, seleção, alternância EN/PT-BR, progresso por lote e animação com respeito à preferência por movimento reduzido.

O cache por seção, texto original e contexto dura a sessão da aba, tem limite de tamanho e deixa de ser usado quando o glossário muda. Falhas de API mantêm o original e mostram uma mensagem; não há repetição automática ilimitada.

A proteção contra Google Tradutor começa em `document_start`. Se a página já estiver traduzida, tenta uma única recarga por seção para recuperar o original. Se o Chrome continuar traduzindo, use **Mostrar original**; a extensão aguarda sem enviar a tradução do Google à IA. Isso não altera a configuração global do navegador.

Plano curto e orientado ao objetivo: [PLANO_MELHORIAS.md](PLANO_MELHORIAS.md). Resultados e limites dos testes: [REVISAO.md](REVISAO.md).

---

## ⚠️ Isenção de Responsabilidade (Disclaimer)

Este é um projeto de código aberto criado pela comunidade e **não possui afiliação, patrocínio ou endosso oficial do Hack The Box ou do Google**.

- A extensão **não** burla paywalls, **não** distribui material VIP/pago e só atua nas seções às quais você tem acesso. O cache de tradução fica na sessão da aba.
- O Gemini processa os textos enviados; a extensão modifica apenas a visualização (DOM) das páginas que você já tem acesso legítimo via sua conta no HTB Academy.
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

*Organização responsável: [NexusGuard-Labs](https://github.com/NexusGuard-Labs). Owner: [Mid-night2026](https://github.com/Mid-night2026).*

</div>
