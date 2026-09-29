# Contribuindo para o HTB Context Translator

Obrigado pelo interesse em contribuir! Este guia explica como participar do projeto de forma organizada e eficiente.

---

## 📋 Código de Conduta

Ao contribuir, você concorda em manter um ambiente respeitoso e colaborativo. Seja construtivo, objetivo e profissional.

---

## 🐛 Reportando Bugs

1. Verifique se o bug já foi reportado nas [Issues](https://github.com/Mid-night2026/htb-context-translator/issues).
2. Se não, abra uma nova issue com:
   - **Título claro e descritivo**
   - **Passos para reproduzir** o problema
   - **Comportamento esperado** vs. **comportamento atual**
   - **Versão da extensão** (visível em `chrome://extensions/`)
   - **Versão do Chrome**
   - **Capturas de tela ou logs do console** (se aplicável)

---

## 💡 Sugerindo Melhorias

Abra uma issue com a tag `enhancement` descrevendo:
- O problema ou necessidade que a melhoria resolve.
- Como você imagina a solução.
- Alternativas que você considerou.

---

## 🔀 Enviando Pull Requests

### Fluxo de trabalho

1. **Fork** o repositório.
2. **Clone** o seu fork:
   ```bash
   git clone https://github.com/SEU_USUARIO/htb-context-translator.git
   cd htb-context-translator
   ```
3. **Crie uma branch** descritiva:
   ```bash
   git checkout -b feature/descricao-curta
   # ou
   git checkout -b fix/descricao-do-bug
   ```
4. **Faça suas alterações** seguindo as convenções abaixo.
5. **Teste** carregando a extensão localmente no Chrome (`chrome://extensions/` → *Load unpacked*).
6. **Commite** com mensagem clara:
   ```bash
   git commit -m "feat: adiciona cache de traduções por seção"
   # ou
   git commit -m "fix: corrige detecção de navegação no módulo de redes"
   ```
7. **Push** para o seu fork:
   ```bash
   git push origin feature/descricao-curta
   ```
8. **Abra um Pull Request** no repositório original.

### Convenção de commits

Usamos o formato [Conventional Commits](https://www.conventionalcommits.org/):

| Prefixo | Uso |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Alteração na documentação |
| `style:` | Formatação (sem mudança de lógica) |
| `refactor:` | Refatoração de código |
| `test:` | Adição ou correção de testes |
| `chore:` | Tarefas de manutenção (dependências, CI, etc.) |

---

## 🛡️ Regras de Segurança (Obrigatórias)

> **Violações destas regras resultam na rejeição imediata do PR.**

1. **NUNCA commite chaves de API, tokens, senhas ou credenciais.** Sempre use variáveis de ambiente ou `chrome.storage.local`.
2. **Verifique antes de cada commit:**
   ```bash
   git diff --staged | grep -iE "(api.?key|token|password|secret|AIzaSy)" && echo "⚠️ POSSÍVEL CREDENCIAL DETECTADA" || echo "✅ OK"
   ```
3. **O arquivo `config.js` DEVE permanecer no `.gitignore`.** Nunca o remova.
4. **Não exponha serviços para `0.0.0.0`.** Use sempre `127.0.0.1` ou `localhost`.

---

## 🏗️ Estrutura do Código

| Arquivo | Responsabilidade |
|---|---|
| `manifest.json` | Configuração da extensão (Manifest V3) |
| `background.js` | Service Worker: API Gemini, prompt de IA, context menu |
| `content.js` | Content script: widget, coleta de DOM, aplicação da tradução, navegação SPA |
| `popup.html/css/js` | Interface do popup (chave de API, auto-tradução) |
| `styles.css` | Estilos do widget e popup no curso |

### Onde fazer cada tipo de alteração

- **Melhorias no prompt de IA** → `background.js` (constante `SYSTEM_PROMPT`)
- **Melhorias na detecção de navegação** → `content.js` (função `monitorarNavegacao`)
- **Novos termos a preservar** → `background.js` (listas no `SYSTEM_PROMPT`)
- **Ajustes visuais** → `styles.css` (widget) ou `popup.css` (popup)
- **Nova funcionalidade no popup** → `popup.html` + `popup.js`

---

## ✅ Checklist antes do PR

- [ ] O código funciona localmente no Chrome com a extensão carregada.
- [ ] Nenhuma chave de API ou credencial está no diff.
- [ ] A mensagem de commit segue a convenção `tipo: descrição`.
- [ ] A extensão traduz corretamente uma seção do HTB Academy.
- [ ] O toggle EN ↔ PT-BR continua funcionando.
- [ ] O popup abre e funciona corretamente.
- [ ] O `manifest.json` é um JSON válido.

---

## 📝 Estilo de Código

- **JavaScript:** ES2020+, sem TypeScript por enquanto.
- **Indentação:** 2 espaços.
- **Strings:** Aspas simples (`'`) para JS, aspas duplas (`"`) para JSON e HTML.
- **Comentários:** Em português do Brasil, descritivos e concisos.
- **Variáveis e funções:** `camelCase` em português (ex: `traduzirConteudoDaPagina`, `obterApiKey`).

---

Obrigado por contribuir! 💚
