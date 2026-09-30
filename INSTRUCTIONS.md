# 📘 Guia Completo — HTB Context Translator

Este documento cobre a instalação, configuração e uso detalhado da extensão HTB Context Translator.

---

## Pré-requisitos

| Requisito | Detalhes |
|---|---|
| **Navegador** | Google Chrome versão 102 ou superior |
| **Chave de API** | Google Gemini API Key gratuita ([obter aqui](https://aistudio.google.com/apikey)) |
| **Conta HTB** | Acesso ao [HTB Academy](https://academy.hackthebox.com/) (gratuito ou VIP) |

---

## 1. Instalação da Extensão

### Método 1: Clonando o Repositório (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/NexusGuard-Labs/htb-context-translator.git

# Acesse a pasta do projeto
cd htb-context-translator
```

### Método 2: Download Direto

1. Acesse: https://github.com/NexusGuard-Labs/htb-context-translator
2. Clique no botão verde **"Code"** → **"Download ZIP"**.
3. Extraia o arquivo ZIP.

### Carregar no Chrome

1. Abra o Chrome e acesse `chrome://extensions/`.
2. Ative o **Modo do desenvolvedor** (toggle no canto superior direito).
3. Clique em **"Carregar sem compactação"** (ou *"Load unpacked"*).
4. Navegue até a pasta `HTB-Context-Translator/` dentro do projeto e selecione-a.
5. O ícone do escudo (🛡️) aparecerá na barra de ferramentas do Chrome.

> **Dica:** Se o ícone não aparecer na barra, clique no ícone de puzzle 🧩 e fixe a extensão.

---

## 2. Obtendo sua Chave de API do Google Gemini

A extensão utiliza a API do **Google Gemini** (plano gratuito disponível). Cada usuário fornece e controla sua própria chave.

### Passo a passo

1. Acesse o [Google AI Studio — API Keys](https://aistudio.google.com/apikey).
2. Faça login com sua conta Google.
3. Clique em **"Create API Key"**.
4. Selecione ou crie um projeto do Google Cloud.
5. Copie a chave gerada (formato: `AIzaSy...`).

### Disponibilidade e cota

Consulte os limites do seu projeto no [Google AI Studio](https://aistudio.google.com/) e a [documentação de limites](https://ai.google.dev/gemini-api/docs/rate-limits). Não há garantia de uma quantidade fixa de requisições gratuitas. O botão de teste executa uma tradução curta e consome cota.

---

## 3. Configurando a Chave de API

### Opção A: Pelo Popup da Extensão (Recomendado)

1. Clique no ícone 🛡️ do **HTB Context Translator** na barra do Chrome.
2. No campo **"Configurar Nova Chave de API"**, cole sua chave.
   - Os caracteres são mascarados por asteriscos (`•••`) automaticamente.
   - Para visualizar a chave digitada, clique no botão 👁️ ao lado.
3. Clique em **⚡ Testar Conexão** para validar.
   - ✅ Verde = Chave válida e modelos disponíveis.
   - ❌ Vermelho = Chave inválida ou sem permissão.
4. Clique em **💾 Salvar Chave**.
5. A chave é armazenada no `chrome.storage.local` do seu navegador e ativada instantaneamente.

### Opção B: Pelo Terminal (CLI)

```bash
cd HTB-Context-Translator/
./atualizar_api.sh
```

O script interativo:
1. Informa se existe uma configuração, sem mostrar a chave.
2. Solicita a nova chave sem eco no terminal.
3. Valida contra a API do Google Gemini.
4. Salva de forma atômica em `config.js`, com permissão `600` e data de atualização.

Recarregue a extensão em `chrome://extensions/` e depois as abas do HTB. A configuração mais recente entre popup e terminal prevalece. Configurações antigas sem data ficam abaixo da chave do popup.

### Opção C: Edição Manual

Copie o template e insira sua chave:

```bash
cp config.example.js config.js
```

Edite o `config.js`:

```javascript
const CONFIG = {
  GEMINI_API_KEY: 'SUA_CHAVE_REAL_AQUI'
};
```

> ⚠️ O arquivo `config.js` está no `.gitignore` para evitar inclusão acidental. Não force sua inclusão no Git.

---

## 4. Usando a Extensão

### Tradução Automática (padrão)

Por padrão, a auto-tradução está **ativada**. Ao navegar entre seções no HTB Academy (clicar em *Next Section*, *Previous Section* ou selecionar uma lição no menu lateral), a extensão detecta automaticamente a nova página e inicia a tradução.

### Tradução Manual

1. Acesse qualquer módulo no [HTB Academy](https://academy.hackthebox.com/).
2. O **widget flutuante** aparece no canto inferior direito.
3. Clique em **Traduzir / tentar novamente**.
4. Aguarde a tradução por lotes (o badge mostra `Traduzindo (1/N)...`).

### Alternar entre Tradução e Original

Após traduzir, use o botão **🔄 Ver Original (EN)** para voltar ao texto em inglês. Clique novamente em **🔄 Ver Tradução (PT-BR)** para ver a tradução. A alternância é instantânea (usa cache local).

### Tradução de Seleção Avulsa

1. Selecione qualquer trecho de texto na página.
2. Clique com o botão direito.
3. Escolha **"🛡️ Traduzir seleção com Contexto HTB"**.
4. A tradução aparecerá em um popup flutuante.

### Configurar pelo Popup

Clique no ícone da extensão na barra do Chrome para:
- Ver o status atual da chave de API.
- Inserir ou trocar a chave (campo mascarado).
- Testar a conexão com a API.
- Ativar/desativar a auto-tradução de seções.
- Traduzir a seção atual com um botão dedicado.

---

## 5. Termos Preservados em Inglês

A IA é instruída a **manter em inglês** os seguintes tipos de termos sem traduzi-los ou duplicá-los:

### Ferramentas e Utilitários
`Burp Suite` · `ZAP` · `Nmap` · `Metasploit` · `Wireshark` · `Cloudflare` · `ModSecurity` · `curl` · `netcat` · `socat` · `hydra` · `sqlmap` · `john` · `hashcat` · `mimikatz` · `ffuf` · `gobuster` · `dirsearch` · `Responder`

### Terminologia contextual

Mantenha nomes de ferramentas e jargões consagrados, como `payload`, `exploit`, `pivoting`, `fuzzing`, `reverse shell` e `forward proxy`. Traduza conceitos usuais em português: **alvo**, **requisição**, **cabeçalho** na explicação, **força bruta**, **escalonamento de privilégios**, **exfiltração**, **proxy reverso** e **condição de corrida**. Identificadores literais de protocolo e código não mudam.

O prompt proíbe adicionar pares inglês/português redundantes; preserva informação que já esteja no original. No popup, o glossário opcional permite indicar termos separados por vírgulas que você deseja manter. Salvar o glossário invalida a tradução anterior e atualiza a seção.

### Protegidos Integralmente
- Comandos shell e flags: `nmap -sV -p- -oA scan`
- Caminhos de sistema: `/etc/passwd`, `C:\Windows\System32`
- Headers HTTP, IPs, portas, hashes, tokens, payloads
- Blocos `<code>` inline

---

## 6. Solução de Problemas

| Problema | Solução |
|---|---|
| Widget não aparece | Recarregue a página do HTB Academy. Verifique se a extensão está ativa em `chrome://extensions/`. |
| Erro "Chave não configurada" | Configure sua chave pelo popup ou pelo script `./atualizar_api.sh`. |
| Erro 403 ou "API key not valid" | Verifique se a chave está correta. Gere uma nova em [aistudio.google.com/apikey](https://aistudio.google.com/apikey). |
| Erro 429 (Rate Limit) | Aguarde 1-2 minutos. O plano gratuito tem limites por minuto. |
| Tradução não dispara ao navegar | Verifique se "Auto-traduzir" está ativado no widget ou no popup. |
| Extensão parou de funcionar | Vá em `chrome://extensions/`, clique no 🔄 para recarregar, e recarregue a aba do HTB. |

---

## 7. Atualizando a Extensão

```bash
cd htb-context-translator/
git pull origin main
```

Depois, em `chrome://extensions/`, clique no botão de recarregar 🔄 no card da extensão.

---

## 8. Desinstalação

1. Acesse `chrome://extensions/`.
2. Encontre **HTB Context Translator**.
3. Clique em **Remover**.
4. Confirme a remoção.

A chave de API armazenada no `chrome.storage.local` será removida automaticamente junto com a extensão.

## Google Tradutor e falhas da API

A extensão sinaliza `notranslate` no começo do carregamento. Ao detectar uma página já traduzida pelo Google, tenta uma única recarga por seção. Se persistir, selecione **Mostrar original** no Chrome. A preferência global de tradução pertence ao navegador, não à extensão.

Uma falha de rede, cota, resposta incompleta ou marcador de código alterado mantém o texto original do lote. Lotes já concluídos continuam disponíveis, e o botão **Traduzir / tentar novamente** retoma o restante. Desativar a automação cancela a tradução pendente; avançar/voltar também descarta respostas antigas.

Os modelos estão em `HTB-Context-Translator/models.json`. O utilitário `python3 atualizar_modelo.py` mostra a configuração; passe de um a três IDs oficiais para atualizá-la e depois recarregue a extensão. A disponibilidade depende do projeto no Google.
