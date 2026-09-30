# Revisão 1.3.1

Base: commit `5b5dcad`, preservando a evolução local da organização NexusGuard-Labs. Correções na branch `fix/contextual-translation-review`, em worktree separada da `main`.

## Falhas encontradas e correções

| Falha observada no código inicial | Correção |
|---|---|
| Inicialização chamava `injetarEstilosPage`, inexistente | Inicialização única com os estilos do manifesto |
| Conteúdo da IA e do cache era aplicado com `innerHTML` | Apenas nós de texto são atualizados; links, eventos, código e formatação continuam presentes |
| Cache truncava a chave antes de distinguir textos e era gravado depois da tradução | Chave completa por seção, glossário, contexto e texto original; limites de tamanho; armazenamento opcional |
| Navegação podia aplicar respostas antigas e ignorar texto carregado na mesma URL | Cancelamento, identificação de execução e validação do DOM; observação de texto novo e rotas reais do Academy |
| Glossário só tinha HTML | Persistência no popup, envio ao prompt e invalidação das traduções anteriores |
| Três prompts divergentes mantinham conceitos traduzíveis em inglês | Um único prompt contextual para página e seleção; conceitos correntes em pt-BR e jargões apropriados em inglês |
| Popup usava chave fictícia para testar `config.js` | Background testa a chave efetiva e retorna somente status/origem |
| Erros de API eram ocultados pelo fallback direto do content script | Chamadas centralizadas, validação de resposta, timeout, mensagem de erro e pausa em erro de cota |
| Chave no content script e em query string | Chave restrita ao background/popup e enviada em cabeçalho HTTPS |
| Script de terminal podia deixar chave anterior do popup prevalecer | Data de atualização, entrada oculta e gravação atômica com permissão 600 |
| Google Tradutor podia fornecer à IA um texto já traduzido | Proteção em `document_start`, tentativa limitada de recuperar o original e bloqueio com orientação quando necessário |
| Atualizador de modelos referenciava arquivo inexistente | `models.json` restaurado como fonte da lista de modelos |

## Validação

A suíte usa Node, Chromium via Playwright e unittest do Python. Testa conteúdo em DOM real, navegação, respostas atrasadas, preservação de código e eventos, cache, falha de API, troca de chave, validação de respostas, bloqueio da tradução Google e popup/background/content script carregados como extensão.

As chamadas Gemini dos testes automatizados são simuladas para não consumir cota e garantir resultados reproduzíveis. Uma avaliação adicional com a API real identificou confusão entre reverse proxy e forward proxy; o prompt foi corrigido com distinção conceitual e exemplos, e o caso foi registrado em `tests/prompt-cases.json`.

Os testes automatizados comprovam o fluxo e as proteções; não comprovam a qualidade linguística do modelo nem substituem a avaliação em uma conta autenticada do HTB.

Não foi alterada a preferência global de tradução do navegador. A recuperação do original usa sinais do DOM e no máximo uma recarga por seção; se o Chrome insistir na tradução, é necessário escolher **Mostrar original**.

Execução e configuração do navegador de testes estão em [CONTRIBUTING.md](CONTRIBUTING.md). Próximas melhorias justificadas: [PLANO_MELHORIAS.md](PLANO_MELHORIAS.md).

Resultado final desta revisão: **11 testes Node/Chromium + 1 teste Python aprovados**. A segunda avaliação real passou nos cinco casos, com proxy reverso/forward proxy distintos e os identificadores preservados. Nenhum desses resultados equivale a garantir todas as traduções futuras.
