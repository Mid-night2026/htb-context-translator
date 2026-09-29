# Política de Segurança — HTB Context Translator

## Versões Suportadas

| Versão | Suporte |
|---|---|
| 1.2.x (atual) | ✅ Recebe atualizações de segurança |
| < 1.2 | ❌ Sem suporte |

---

## Reportando uma Vulnerabilidade

Se você encontrar uma vulnerabilidade de segurança neste projeto, **NÃO abra uma issue pública**.

### Como reportar

1. **Método preferido:** Use o botão **"Report a vulnerability"** na aba [Security](https://github.com/NexusGuard-Labs/htb-context-translator/security) deste repositório. O GitHub mantém o relatório privado até a correção ser publicada.

2. **Método alternativo:** Envie um e-mail para o mantenedor descrevendo:
   - Descrição da vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial
   - Sugestão de correção (se tiver)

### O que esperar

- **Confirmação** do recebimento em até **5 dias úteis**.
- **Avaliação e correção** em até **30 dias**, dependendo da gravidade.
- Você será creditado na release de correção (se desejar).

---

## Modelo de Segurança da Chave de API

Esta extensão adota o modelo **BYOK (Bring Your Own Key)**. Cada usuário fornece e gerencia sua própria chave de API do Google Gemini.

### Garantias de segurança do projeto

| Garantia | Detalhes |
|---|---|
| **Zero hardcoding** | Nenhuma chave de API, token ou credencial é armazenada no código-fonte ou no repositório Git. |
| **`.gitignore` ativo** | O arquivo `config.js` (que pode conter uma chave local) está protegido pelo `.gitignore` e nunca é versionado. |
| **Template seguro** | Apenas `config.example.js` com placeholder (`SUA_CHAVE_API_AQUI`) é commitado. |
| **Storage local** | A chave salva pelo popup é armazenada em `chrome.storage.local`, isolada no perfil do Chrome do usuário. Não é sincronizada entre dispositivos nem acessível por outros sites. |
| **Interface mascarada** | O campo de entrada da chave usa `type="password"` e a exibição no status é mascarada (ex: `AIzaSy••••••dX4f`). |
| **Transmissão segura** | A chave é enviada exclusivamente via HTTPS para `generativelanguage.googleapis.com`. Nenhum servidor intermediário, backend próprio ou terceiro recebe a chave. |
| **Sem telemetria** | A extensão não coleta, transmite ou registra dados de uso, navegação ou credenciais. |

### Responsabilidade do usuário

- **Gere sua própria chave** em [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
- **Nunca compartilhe sua chave** com terceiros.
- **Restrinja a chave** no [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
  - Limite a chave apenas para a API *"Generative Language API"*.
  - Se possível, restrinja por referrer HTTP.
- **Se suspeitar de vazamento**, revogue a chave imediatamente no Google Cloud Console e gere uma nova.
- **Não commite `config.js`** — ele está no `.gitignore`, mas se você modificar o `.gitignore`, verifique antes de dar push.

### O que este projeto NÃO faz

- ❌ Não coleta, armazena ou transmite sua chave para qualquer servidor além da API oficial do Google.
- ❌ Não sincroniza a chave entre dispositivos (não usa `chrome.storage.sync`).
- ❌ Não ofusca nem codifica a chave como medida de segurança (ofuscação não é segurança).
- ❌ Não opera um backend proxy (todas as chamadas vão direto do navegador para o Google).

---

## Práticas de Desenvolvimento Seguro

Contribuidores devem seguir estas regras:

1. **Nunca commite credenciais.** Verifique com `git diff --staged` antes de cada commit.
2. **Nunca use `0.0.0.0`** para bind de servidores de desenvolvimento. Use `127.0.0.1` ou `localhost`.
3. **Nunca gere padrões de reverse shell** ou código de execução remota sem filtros.
4. **Valide inputs.** Chaves de API devem ser validadas por formato antes de serem usadas.
5. **Use HTTPS.** Todas as chamadas de rede devem usar HTTPS.

---

## Divulgação Responsável

Este projeto segue o princípio de **Coordinated Vulnerability Disclosure (CVD)**:

1. O pesquisador reporta a vulnerabilidade de forma privada.
2. O mantenedor confirma e avalia o impacto.
3. Uma correção é desenvolvida e testada.
4. A correção é publicada em uma nova release.
5. Somente após a publicação da correção, os detalhes da vulnerabilidade são divulgados.

Agradecemos a colaboração de pesquisadores de segurança que ajudam a manter este projeto seguro para todos.
