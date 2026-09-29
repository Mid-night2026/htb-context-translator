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
- Fazer traduções literais de termos que mudam completamente o sentido técnico (ex: traduzir *Forward Proxy* erroneamente como "proxy de encaminhamento", *payload* como "carga útil", ou *tampering* como "adulteração").
- Inserir duplicatas redundantes e confusas entre parênteses ao lado do termo (ex: `"Forward Proxy (proxy de encaminhamento)"` ou `"requisições HTTP (HTTP Requests)"`).
- Quebrar formatações de código inline, rotas de rede, parâmetros e payloads.

O **HTB Context Translator v1.2** foi projetado especificamente para:
1. **Preservar nomes de softwares e ferramentas:** Ferramentas como `Burp Suite`, `ZAP`, `Nmap`, `Metasploit`, `Wireshark`, `Cloudflare`, `ModSecurity`, `Sysmon`, `curl`, `netcat`, `socat`, `hydra`, `sqlmap`, `john`, `hashcat`, `mimikatz`, `ffuf`, `gobuster` e outras permanecem 100% intactas.
2. **Preservar termos e jargões consolidados estritamente em inglês:** Termos como `Forward Proxy`, `Reverse Proxy`, `Transparent Proxy`, `Pivoting`, `Listener`, `Payload`, `Exploit`, `Reverse Shell`, `Bind Shell`, `Buffer Overflow`, `Bypass`, `Privilege Escalation`, `Root`, `Tampering`, `Spoofing`, `Tunneling`, `C2`, `Wordlist`, `Fuzzing`, `Brute Force`, `Handshake`, `Foothold` são mantidos exatamente em inglês, sem traduções esdrúxulas ou redundâncias entre parênteses ao lado.
3. **Traduzir a didática e explicações técnicas** para o Português do Brasil (pt-BR) de forma fluente, soando natural como um especialista sênior em segurança ofensiva.
4. **Proteger comandos e blocos de código:** Comandos de terminal, scripts, caminhos do sistema (`/etc/passwd`, `C:\Windows`) e tags `<code>` são isolados e protegidos durante a tradução.

---

## 🚀 Novidades e Funcionalidades (v1.2)

- **Popup no Ícone da Extensão:** Clique no ícone da extensão na barra do Chrome para abrir o painel de controle:
  - **Campo de Chave com Máscara de Asteriscos (`*`):** Ao digitar ou colar sua chave do Gemini, os caracteres são mascarados por asteriscos para privacidade e segurança.
  - **Botão Mostrar/Ocultar (👁️):** Permite inspecionar a chave digitada quando necessário.
  - **Testador de Conexão com a API:** Valida a chave diretamente contra os endpoints do Google Gemini em tempo real antes de salvar.
  - **Atualização Imediata:** A chave salva no popup passa a ser usada instantaneamente pela extensão em todas as abas.
- **Auto-tradução Inteligente de Seções (Avançar e Voltar):** Ao clicar em "Next Section", "Previous Section", ou ao navegar pelas lições no menu lateral do HTB Academy, a extensão detecta a nova seção (via History API e MutationObserver do SPA) e dispara a tradução automaticamente.
- **Widget Flutuante no HTB Academy:** Interface discreta com o visual escuro e verde neon oficial do Hack The Box no canto inferior direito da tela.
- **Alternador Instantâneo (Toggle EN/PT):** Alterne entre o texto traduzido e o original em inglês com 1 clique (`Ver Original` / `Ver Tradução`) sem reprocessar pela IA.
- **Menu de Contexto (Seleção Avulsa):** Selecione qualquer trecho da página e clique com o botão direito para traduzir com contexto HTB.
- **Script Interativo no Terminal:** Além do popup no Chrome, o script `./atualizar_api.sh` continua disponível para quem prefere gerenciar via CLI.

---

## 📁 Estrutura do Repositório

```text
/home/midnight/Documents/I.A/Extensao/
├── README.md                           <- Documentação oficial
├── .gitignore                          <- Proteção contra vazamento de credenciais
│
└── HTB-Context-Translator/             <- Pasta da Extensão para carregar no Chrome
    ├── manifest.json                   <- Manifesto V3 (versão 1.2 com popup configurado)
    ├── popup.html                      <- Interface gráfica do popup ao clicar no ícone
    ├── popup.css                       <- Estilo dark/cyberpunk do popup
    ├── popup.js                        <- Lógica do popup (chave mascarada, validação e auto-tradução)
    ├── content.js                      <- Content script injetado nas páginas do HTB Academy
    ├── background.js                   <- Service Worker que consome a API do Gemini
    ├── styles.css                      <- Estilos do widget e alertas no curso
    ├── config.js                       <- Chave de API local (ignorado pelo Git)
    ├── config.example.js               <- Modelo limpo para novos ambientes
    ├── atualizar_api.py                <- Script interativo para configurar chave via terminal
    ├── atualizar_api.sh                <- Atalho executável do script de terminal
    └── icons/                          <- Ícones da extensão (16px, 48px, 128px)
```

---

## 🛠️ Como Instalar no Google Chrome

1. Abra o Google Chrome e acesse:
   ```text
   chrome://extensions/
   ```
2. No canto superior direito, ative a opção **Modo do desenvolvedor** (Developer mode).
3. No canto superior esquerdo, clique no botão **Carregar sem compactação** (ou *Load unpacked*).
4. Selecione a pasta da extensão:
   ```text
   /home/midnight/Documents/I.A/Extensao/HTB-Context-Translator
   ```
5. *(Se já estava instalada)*: Clique no botão de recarregar (ícone de seta circular 🔄) no card da extensão para atualizar para a versão 1.2.

---

## 🔑 Como Configurar a Chave da API Gemini

Você tem duas formas fáceis de configurar a sua chave:

### Método 1: Pelo Ícone da Extensão no Navegador (Recomendado)
1. Clique no ícone do **HTB Context Translator** na barra de ferramentas do Chrome (ao lado da barra de endereços).
2. No campo **Configurar Nova Chave de API**, insira ou cole sua chave do Google Gemini (cada caractere ficará protegido por asteriscos `*`).
3. Clique em **⚡ Testar Conexão** para validar se a chave está ativa.
4. Clique em **💾 Salvar Chave**. A chave será gravada no storage da extensão e ativada imediatamente.

### Método 2: Pelo Terminal (CLI)
1. Abra o terminal na pasta da extensão e execute:
   ```bash
   cd "/home/midnight/Documents/I.A/Extensao/HTB-Context-Translator"
   ./atualizar_api.sh
   ```
2. Digite ou cole a nova chave quando solicitado. O script testa e atualiza o `config.js`.

---

## 📖 Como Usar no Hack The Box Academy

1. Acesse qualquer módulo ou lição do [HTB Academy](https://academy.hackthebox.com/).
2. O widget **HTB Translator AI** aparecerá no canto inferior direito da tela.
3. Se a opção **Auto-traduzir seções** estiver ativa, qualquer seção que você abrir, avançar (Next) ou voltar (Previous) será traduzida automaticamente pela IA!
4. Você pode clicar a qualquer momento em:
   - **✨ Traduzir Página (IA)** / **Re-traduzir**: para reprocessar a página atual.
   - **🔄 Ver Original (EN)** / **Ver Tradução (PT-BR)**: para alternar instantaneamente entre a tradução e o original em inglês.
