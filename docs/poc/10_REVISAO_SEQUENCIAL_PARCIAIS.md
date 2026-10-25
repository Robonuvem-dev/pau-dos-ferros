# Revisão sequencial dos itens parciais — 25/10/2026

## Ponto de partida confirmado

- main e Vette: `84431674cf8761c20ec0e9462022722c006eb658`.
- Publicação existente: `/version.json` retornou `1.3.0` e `/transparencia` abriu no navegador, com itens do plano de aplicação dos convênios. Isso confirma esses pontos da publicação, não todos os fluxos autenticados.
- Migrações 0020–0025 aplicadas anteriormente com autorização específica; não reaplicadas nesta revisão.
- Checklist existente reconciliada: 137 implementados, 6 parciais, 25 não verificados. Preservados os 168 IDs, descrições e checkboxes do usuário. M16 segue externo.

## 5.1 — cumprimento integral LRF/LAI

Referências oficiais: [LAI](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm), [LRF](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp101.htm). Este documento rastreia controles técnicos; não substitui avaliação jurídica ou homologação.

| Controle | Caminho e evidência técnica | Limitação de comprovação |
|---|---|---|
| Pesquisa, exportação e acesso aos registros | `PublicTable.tsx`: busca, CSV/JSON, impressão e detalhes completos; consultas públicas paginadas | Completude e autenticidade dos conteúdos exigem conferência da origem |
| Estrutura, contatos e horários | `/secretarias`; configuração municipal compartilhada | Conferir os responsáveis e contatos reais antes de uso oficial |
| Receitas, despesas e documentos fiscais | `/transparencia/receitas`, `/transparencia/despesas`, `/transparencia/lei`, `/transparencia/rreo`, `/transparencia/rgf` | Dados fictícios não comprovam tempestividade de dados efetivos nem integração com fornecedor |
| Licitações, contratos e convênios | Consultas públicas e relatórios específicos, vínculos por identificador | Conferência documental e registro de publicação permanecem necessários |
| Pedidos e recursos | `/esic`, `/admin/esic`; prazos, extensão justificada, respostas, recursos e consulta protegida | Fluxo administrativo e cumprimento real dos prazos pelo órgão exigem ensaio autenticado e processo municipal |
| Acessibilidade da consulta | Pesquisa com nome acessível; tabela com legenda e cabeçalhos identificados; documentos distinguíveis por registro | Testes de componente não substituem auditoria de acessibilidade de todas as páginas e documentos |
| Proteção dos solicitantes | RLS e funções protegidas, campos privados separados dos dados públicos | Ensaio autenticado com papéis distintos deve verificar o ambiente publicado |

Correção desta revisão: identificação acessível de pesquisa, tabela, cabeçalhos e anexos em todas as consultas que utilizam `PublicTable`. Testes verificam busca e documentos tanto nas colunas visíveis quanto nos detalhes.

**Classificação permanece PARCIAL.** Não há base para declarar cumprimento integral sem revisar os conteúdos, tempestividade, procedimentos e acessibilidade completa. As evidências faltantes estão explícitas; não são substituídas por contagem de registros ou declarações genéricas.

## Ordem seguinte e dependências precisas

1. **7.1:** confrontar mapeamento contábil com leiaute/exportação autorizado do fornecedor efetivo; arquivos sintéticos servem ao ensaio, não identificam fornecedor.
2. **7.2:** confrontar folha com campos, rubricas e competências do sistema efetivo.
3. **7.3:** verificar leiaute oficial do TCE/RN antes de chamar um conversor próprio de integração TCE.
4. **9.2:** validar múltiplos fornecedores concretos; dois exemplos fictícios comprovam transformação, não compatibilidade externa.
5. **14.2:** aferir os 88 critérios individualmente; comparação semântica de páginas não certifica documentos, prazos e atendimento legal.

Não usar prompts do Lovable nem IA paga. Alterações de implementação continuam na Vette e seguem para main após os testes; a checklist acompanha cada alteração e diferencia código, publicação e homologação.
