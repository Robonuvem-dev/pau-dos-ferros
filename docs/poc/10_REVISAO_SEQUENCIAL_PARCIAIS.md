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

## 7.1 — integração contábil, revisão executada

O caminho de arquivo e a sincronização remota usavam leitura UTF-8 com substituição silenciosa de bytes inválidos. Isso podia corromper descrições de exportações ANSI. Agora ambos usam decodificação explícita UTF-8 ou Windows-1252 com validação. Na configuração remota, `codificacao` é opcional e assume `utf-8`; no painel, selecione a opção antes de escolher o arquivo. A alteração invalida a prévia e qualquer leitura anterior ainda pendente.

Oito testes novos cobrem acentos, BOM, rejeição de conteúdo inválido sem escrita, mapeamento e sincronização remota, além da troca de codificação durante leitura. O mesmo controle é compartilhado pelos arquivos de folha e cadastros TCE, sem afirmar compatibilidade com um sistema não identificado.

**7.1 permanece PARCIAL:** a capacidade genérica foi exercitada, mas não existe no material disponível identificação nem exportação do sistema contábil efetivo. Dados sintéticos solicitados pelo usuário permitem demonstrar o processamento; não comprovam que o fornecedor municipal entrega aquele contrato de dados.

### 7.2 e 9.2 — caminho compartilhado de folha

Importação e mapeamento de dois formatos sintéticos distintos já possuem teste; o suporte de codificação também é compartilhado. Faltam leiautes/exportações autorizados dos fornecedores concretos para conferir rubricas, competência e conciliação. Permanecem PARCIAIS, sem inventar identificação de fornecedores.

### 7.3 — origem TCE/RN

O [portal oficial de dados abertos](https://apidadosabertos.tce.rn.gov.br/) informa que disponibiliza remessas SIAI via API. A recuperação inicial da documentação pelo serviço de busca falhou; no navegador, a documentação foi acessada em `/swagger` e o esquema completo em `//swagger/docs/v1`. Foram encontradas 11 operações nos grupos InformacoesBasicasApi, BalancoOrcamentarioApi, ProcedimentosLicitatoriosApi, EmpenhosLiquidacoesPagamentosApi e ContratosApi. Não foi encontrada operação direta de cadastro de agentes/credores; as respostas estão documentadas apenas como `object`, sem propriedades. Não se inventou mapeamento desses campos. O importador genérico continua disponível, mas 7.3 permanece PARCIAL até ensaio com contrato de dados oficial. Nenhuma informação pessoal da base real foi importada.

## 14.2 — cobertura explícita da coleta dos 88 pontos

A coleta anterior analisava somente dez módulos fiscais e omitía da análise semântica os demais pontos. Agora gera exatamente um registro para cada um dos 88 critérios, consulta também as fontes configuradas institucionais, e-SIC, serviços e LGPD, e reutiliza cada página entre os pontos correspondentes.

Cada registro distingue página lida, fonte específica não configurada, falha de leitura e conteúdo vazio. Falha de uma página não apaga os resultados das outras. Uma fonte ausente não recebe um documento genérico como prova. O relatório diferencia a quantidade de pontos registrados da quantidade efetivamente lida; limite de texto também é declarado. Mesmo vetores semelhantes não transformam falha de coleta em indício positivo.

**14.2 permanece PARCIAL:** cobertura de rastreabilidade dos 88 pontos não é aferição integral. Continuam necessários o confronto com a edição oficial aplicável do instrumento, as fontes dos pontos sem configuração, validação de conteúdo/PDFs, tempestividade e acessibilidade. A IA local não certifica esses aspectos. Testes verificam conservação dos 88 IDs, falhas independentes, fontes ausentes, conteúdo vazio e ausência de aprovação por similaridade.

## Evidência do ensaio no Cloud

Na publicação funcional `80be36e`, a pesquisa acessível de Leis filtrou de dois para um registro ao consultar `702/2025`. A sessão administrativa existente abriu o painel e a importação de despesas exibiu as opções UTF-8 e Windows-1252.

Em 25/10/2026 às 14:13:46 UTC, a varredura neural gratuita no navegador concluiu e salvou o anexo: 88 pontos registrados, 61 com leitura concluída e 27 com coleta pendente. O painel manteve a matriz sem aprovações automáticas. Foram observadas 81 pendências cadastrais nos dados fictícios, incluindo anexos ausentes e campos incompletos; não foram apagadas nem tratadas como falhas resolvidas.

O ensaio revelou que a fonte dos agentes políticos deve ser `/prefeitura`, pois o cadastro não é um módulo público genérico. Essa rota foi corrigida nesta revisão. A versão 1.3.1 identifica a entrega para que o controle remoto detecte diferença em relação a clientes abertos na 1.3.0. A atualização entre versões ainda deve ser observada no deploy, sem confundir emissão do manifesto com recarga efetiva.
