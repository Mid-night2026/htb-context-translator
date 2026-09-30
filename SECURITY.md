# Segurança e privacidade — HTB Context Translator

Organização responsável: [NexusGuard-Labs](https://github.com/NexusGuard-Labs). Owner: [Mid-night2026](https://github.com/Mid-night2026). A linha em revisão é a 1.3.1; use a versão mais recente disponibilizada pela organização.

## Chaves pessoais

Cada usuário fornece sua própria chave Gemini, inclusive o owner. A extensão não distribui uma chave compartilhada da organização. O popup mantém o campo mascarado e não mostra partes da chave salva. Isso protege a exibição, **não criptografa o armazenamento**: alguém com acesso ao perfil do navegador ou ao arquivo local pode inspecioná-la.

A chave fica no `chrome.storage.local` do perfil, com acesso limitado aos contextos da extensão por `setAccessLevel(TRUSTED_CONTEXTS)`, ou em `config.js` ignorado pelo Git. O script de terminal grava esse arquivo atomicamente com permissão `600`. A configuração mais recente entre popup e script prevalece após recarregar a extensão.

A extensão envia a chave por HTTPS no cabeçalho `x-goog-api-key` exclusivamente a `generativelanguage.googleapis.com`. Textos selecionados, fragmentos do curso, o contexto do parágrafo e termos do glossário também vão para o Google para gerar a tradução. A organização não recebe esses dados pela extensão. Consulte as condições do serviço Google aplicáveis ao seu projeto antes de enviar conteúdo sensível.

## Publicação do código

- Distribua somente o código e `config.example.js`. Não inclua `config.js`, arquivos `.env`, perfis do Chrome ou exportações do storage.
- `.gitignore` evita inclusão acidental; não protege contra `git add -f` nem remove segredos do histórico.
- Nunca coloque uma chave da organização no pacote público. Conforme a [orientação do Google](https://ai.google.dev/gemini-api/docs/api-key), segredos embutidos em aplicativos cliente podem ser extraídos.
- Restrinja sua chave à API Gemini, acompanhe as cotas e revogue uma chave que tenha sido exposta. Não publique a chave em issues, PRs ou screenshots.

## Conteúdo e permissões

A extensão atua em `academy.hackthebox.com`. Requisições externas saem pelo background; o content script não recebe a chave. Mensagens de configuração só são aceitas da página do popup da própria extensão. Traduções são tratadas como texto, nunca executadas como HTML ou JavaScript.

O cache mantém traduções no `sessionStorage` da aba, limitado por tamanho, e pode ser lido pelo próprio site, como outros dados dessa origem. Não contém a chave. Fechar a sessão da aba normalmente descarta esse cache; a restauração de sessão do navegador pode preservá-lo. Não há backend ou telemetria da organização.

A proteção contra Google Tradutor detecta sinais do DOM e tenta recuperar o original uma vez por seção. Não controla configurações globais do Chrome e não garante detectar todas as versões de tradutores externos.

Referência do armazenamento: [documentação do Chrome](https://developer.chrome.com/docs/extensions/reference/api/storage).

## Reportar vulnerabilidades

Use [Report a vulnerability](https://github.com/NexusGuard-Labs/htb-context-translator/security/advisories/new) se o recurso estiver habilitado. Se não estiver, procure o owner sem divulgar credenciais ou detalhes de exploração em uma issue pública. Inclua versão, passos de reprodução e impacto, com dados de teste.
