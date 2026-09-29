# 🛡️ HTB Context Translator

<div align="center">

![HTB Badge](https://img.shields.io/badge/Hack_The_Box-Academy_AI_Translator-9fef00?style=for-the-badge&logo=hackthebox&logoColor=black)
![Gemini Badge](https://img.shields.io/badge/Google_Gemini-API_v1beta-4285F4?style=for-the-badge&logo=google)
![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-success?style=for-the-badge)

</div>

> **Extensão para Google Chrome que traduz o conteúdo dos cursos do Hack The Box (HTB) Academy diretamente na página, utilizando a IA do Google Gemini com contexto especializado em Cibersegurança e Pentest.**

---

## 🎯 Por que esta extensão existe?

Tradutores genéricos de navegadores (como o Google Tradutor tradicional) frequentemente estragam conteúdos de segurança da informação ao:
- Traduzir nomes de ferramentas de pentest (ex: traduzir comandos, utilitários ou flags).
- Fazer traduções literais de termos que mudam completamente o sentido técnico (ex: traduzir *Forward Proxy* erroneamente como "proxy reverso", ou *Pivoting* de forma errada).
- Quebrar formatações de código inline, rotas de rede, parâmetros e payloads.

O **HTB Context Translator** foi projetado especificamente para:
1. **Preservar nomes de softwares e ferramentas:** Ferramentas como `Burp Suite`, `ZAP`, `Nmap`, `Metasploit`, `Wireshark`, `Cloudflare`, `ModSecurity`, `Sysmon`, `WinSock`, `libcurl` e outras permanecem 100% intactas.
2. **Preservar jargões e conceitos essenciais de segurança:** Termos técnicos como `Forward Proxy`, `Reverse Proxy`, `Transparent Proxy`, `Pivoting`, `C2 / Command and Control`, `Reverse Shell`, `Buffer Overflow`, `Bypass`, `Privilege Escalation` e `Wordlist` não sofrem traduções literais esdrúxulas.
3. **Traduzir a didática e explicações técnicas** para o Português do Brasil (pt-BR) de forma fluente e natural para o estudante do HTB.
4. **Proteger comandos e blocos de código:** Comandos de terminal, scripts, caminhos do sistema (`/etc/passwd`, `C:\Windows`) e tags `<code>` são isolados e protegidos durante a tradução.

---

## 🚀 Funcionalidades

- **Widget Flutuante no HTB Academy:** Interface discreta com o visual escuro e verde neon oficial do Hack The Box no canto da tela.
- **Tradução Automática ao Avançar:** Ao avançar de seção na SPA do HTB Academy, a nova lição é traduzida automaticamente.
- **Alternador Instantâneo (Toggle):** Alterne entre o texto traduzido e o original em inglês com 1 clique (`Ver Original` / `Ver Tradução`) sem reprocessar pela IA.
- **Tradução de Seleção:** Suporte a menu de contexto (botão direito) para traduzir trechos ou seleções avulsas com popup flutuante.
- **Segurança de Credenciais:** A chave de API do Gemini fica em arquivo local (`config.js`) protegido pelo `.gitignore`, nunca sendo exposta no repositório Git.
- **Script Interativo de Atualização de API:** Utilitário de linha de comando (`atualizar_api.sh`) para trocar e validar a chave de API facilmente pelo terminal.

---

## 📁 Estrutura do Repositório

```text
/home/midnight/Documents/I.A/Extensao/
├── README.md                           <- Este documento
├── .gitignore                          <- Proteção contra vazamento de credenciais
├── atualizar_modelo.py                 <- Utilitário de mapeamento de modelos Gemini
│
└── HTB-Context-Translator/             <- Pasta principal da Extensão (carregar no Chrome)
    ├── manifest.json                   <- Manifesto V3 da extensão
    ├── content.js                      <- Content script injetado no HTB Academy
    ├── background.js                   <- Service Worker que consome a API do Gemini
    ├── styles.css                      <- Estilos do widget e popups (tema HTB)
    ├── config.js                       <- Chave da API local (ignorado pelo Git)
    ├── config.example.js               <- Modelo limpo para novos ambientes
    ├── atualizar_api.py                <- Script interativo para configurar a chave
    ├── atualizar_api.sh                <- Atalho executável do script de chave
    └── icons/                          <- Ícones da extensão (16px, 48px, 128px)
```

---

## 🛠️ Como Instalar no Google Chrome

1. Abra o Google Chrome e acesse:
   ```text
   chrome://extensions/
   ```
2. No canto superior direito, ative a opção **Modo do desenvolvedor**.
3. No canto superior esquerdo, clique no botão **Carregar sem compactação** (ou *Load unpacked*).
4. Selecione a pasta da extensão:
   ```text
   /home/midnight/Documents/I.A/Extensao/HTB-Context-Translator
   ```
5. Pronto! A extensão estará instalada e pronta para uso.

---

## 🔑 Configuração da Chave da API Gemini

Para configurar ou trocar a chave da sua API do Google Gemini:

1. Abra o terminal na pasta da extensão:
   ```bash
   cd "/home/midnight/Documents/I.A/Extensao/HTB-Context-Translator"
   ./atualizar_api.sh
   ```
2. O script exibirá a chave atual configurada (mascarada), solicitará a nova chave e testará a conexão diretamente com os servidores do Google antes de salvar no `config.js`.

---

## 📖 Como Usar no Hack The Box Academy

1. Acesse qualquer módulo ou lição do [HTB Academy](https://academy.hackthebox.com/).
2. O widget **HTB Translator AI** aparecerá no canto inferior direito da tela.
3. Clique em **✨ Traduzir Página (IA)** para traduzir a lição atual.
4. Mantenha a caixa **☑ Auto-traduzir ao avançar** marcada para que as próximas seções sejam traduzidas automaticamente conforme você avança no curso.
5. Use o botão **🔄 Ver Original (EN)** a qualquer momento para comparar com o texto original em inglês.
