# Fechamento dos 30 itens parciais — Vette

Base: `7ce0dc6e41883e46f49e26f7144141c24c837add`, 25/10/2026. Alterações exclusivamente na Vette. Não há merge, alteração no webmail ou aplicação automática em banco publicado.

## Implementações e testes

| Itens | Mudança | Verificação automatizada |
|---|---|---|
| 1.2, 15.3 | Manifesto de versão gerado no build; consulta no acesso ao painel, foco e retorno da conexão; recarga com proteção contra repetição e adiamento durante edição em formulário/janela | `poc-parciais-20261025.test.ts`, TypeScript e build |
| 3.4, 3.7, 10.5 | Origem de aditivos/adesões por UUID com FK, validação do tipo de origem e recálculo por identificador; leitura da obra usa a mesma chave | SQL: origens duplicadas, recálculo isolado, carona de ata, exclusão da origem; `gestao-detalhes.test.tsx` |
| 3.14 | Histórico de eventos de publicação gerado no servidor e relatório próprio com datas de publicação | SQL de eventos + build da tela |
| 3.15 | Paginação estável sem o corte de mil registros | Teste com 1.203 registros e falha na página seguinte |
| 3.16 | Catálogo de modalidades compartilhado entre cadastro e mapa | Teste do catálogo usado pelas telas |
| 4.1 | Convênio e primeira parcela com vencimento gravados por uma RPC atômica; obrigatoriedade também no banco | Testes da chamada real do CRUD e SQL de rollback/permissão/última parcela |
| 4.6 | Filtros de vigência e interseção de período no relatório | Testes da seleção e da tela com convênio vencido |
| 4.8 | Itens do plano de aplicação por natureza, descrição e valor; resumo conciliado e rejeição de total excedente | SQL e renderização do resumo |
| 4.9 | Vencimento obrigatório das parcelas na interface e no banco | SQL e catálogo compartilhado |
| 4.10 | Identificação explícita da parte obrigada: concedente, convenente ou ambos | SQL e cadastro compartilhado |
| 8.9 | Importador remoto HTTPS, mapeamento, autenticação de conta restrita, sincronização idempotente e repetição sem sobreposição | Teste do fluxo origem → autenticação → RPC e SQL de atualização sem duplicata |
| 10.2, 11.1, 12.1 | Obrigatoriedade compartilhada com validação na gravação e constraints no banco; término efetivo/baixa condicionais ao estado aplicável | Testes de campos, zero/falso válidos, baixa e SQL de rejeição |
| 10.12 | Crítica de ART também consulta registros da tabela `obra_arts` | Testes de presença e ausência |
| 10.13 | Plano Diretor cria fase/equipe/eixo/ação na mesma transação e não permite remover o último componente obrigatório | Testes de chamada/erro e SQL de atomicidade/constraint diferida |
| 13.1 | Notícias lidas por componentes nativos Android e SwiftUI iOS; API pública lê a mesma fonte do portal | CI mobile de compilação/instalação/abertura; operação de rede e aparelho físico têm escopo próprio |
| 13.4 | Total de visualizações soma todas as notícias; ranking continua limitado às dez primeiras | Paginação, TypeScript e build |
| 14.1 | IA local lê conteúdo das páginas fiscais e compara embeddings dos critérios com os trechos públicos; não depende apenas das críticas pré-calculadas | Testes de coleta/falha/remoção de scripts e inferência real gratuita no CI |
| 15.5 | Uploads continuam preservados; CSV/JSON, modelo em branco e estatísticas da Carta são gerados e arquivados no PostgreSQL antes da saída | SQL: bytes, hash, deduplicação e recusa de conteúdo arbitrário; testes/build dos fluxos |
| 15.12 | Solicitação efetiva com protocolo, dados privados, tratamento pela equipe e estatísticas separadas; visualizações usam referência estável | Teste de envio/erro da tela; SQL de protocolo, estatísticas, RLS e imutabilidade dos dados do solicitante |

O resultado executado deve ser conferido no workflow **PoC Sprint 5 - qualidade** do commit em análise. CI de nomes históricos continua aplicando todas as migrações e testes atuais; nome da sprint não limita o alcance.

## Seis pendências que não devem virar atendimento presumido

| Item | O que foi feito | O que falta comprovar |
|---|---|---|
| 5.1 | Controles, consulta fiscal, publicações e e-SIC no código | Revisão integral do conteúdo e dos procedimentos segundo LRF/LAI; código não certifica conformidade jurídica e operacional |
| 7.1 | Importação contábil com mapeamento e sincronização remota | Leiaute/documentação ou exportação autorizada do fornecedor efetivo e conferência de dados e totais |
| 7.2 | Mesmos mecanismos para folha | Compatibilidade com a origem efetivamente utilizada e conferência das rubricas/competências |
| 7.3 | Importador de agentes/credores com correspondência de campos | Documentação e prova de compatibilidade com TCE/RN; CSV fictício próprio não é exportação oficial. A documentação pública foi localizada em https://apidadosabertos.tce.rn.gov.br/, mas o Swagger não pôde ser recuperado durante esta execução |
| 9.2 | Conversão testada de dois leiautes de folha distintos e origem identificada | Conversores/perfis validados com os múltiplos fornecedores concretos; os testes fictícios não os identificam |
| 14.2 | Avaliação manual com evidência dos 88 pontos e apoio de varredura neural de páginas fiscais | Aferição completa dos 88 critérios, documentos/PDFs, atualização e conteúdo normativo. Similaridade de texto não prova atendimento; não há aprovação automática por contagem |

## O que significa “não verificável pelo código”

- **23 itens M16:** serviço externo de webmail, sob responsabilidade de outro fornecedor. O link de entrada não comprova caixas, envio/recebimento, auditoria, capacidade, treinamento ou LGPD. Exigem demonstração e documentação do responsável externo.
- **1.5:** disponibilização de aprimoramentos sob demanda é obrigação de atendimento continuado. Há canal de melhorias, mas é necessário demonstrar compromisso e execução do serviço.
- **15.6:** atualização contínua e adequação legal sem custo adicional é obrigação contratual. Histórico e código não comprovam preço, cobertura e prestação futura.

Esses 25 itens continuam separados da contagem de funcionalidades. Não são todos defeitos de programação e não foram excluídos do edital.

## Aplicação e legado

Migrações novas: **0020–0024**. Devem ser ensaiadas integralmente no PostgreSQL descartável do CI antes da aplicação em homologação. Não há conexão com produção nesses testes.

Constraints `NOT VALID` preservam registros legados sem inventar responsáveis, datas ou dados. A obrigatoriedade passa a valer para novos registros e edições. Cadastros antigos incompletos precisam ser regularizados com dados autorizados. Origem textual ambígua de contrato não é convertida arbitrariamente em UUID.

O deploy ligado à main não passa a executar a Vette por existir um commit. Publicação e aplicação das migrações são etapas separadas. Os resultados da planilha devem indicar versão e escopo do teste, sem confundir implementação na branch com homologação presencial.

## Operar a integração automática

Copie `integracao.exemplo.json` e preencha a origem HTTPS real e as correspondências de colunas. Os dados do exemplo são fictícios. Configure fora do repositório:

- `POC_SUPABASE_URL` e `POC_PUBLISHABLE_KEY`;
- `POC_INTEGRATION_EMAIL` e `POC_INTEGRATION_PASSWORD`, de uma conta existente com acesso apenas aos módulos necessários;
- `POC_SOURCE_TOKEN`, apenas se a origem o exigir.

Execute `bun run integrar caminho/configuracao.json` para uma execução, ou acrescente `--watch=900` para repetir a cada quinze minutos no serviço/equipamento de integração. Cada ciclo autentica novamente; não usa chave de serviço nem salva senha no código. Configurar/ativar esse processo e validar o fornecedor continuam necessários no ambiente operacional.

As amostras sintéticas servem ao ensaio, não substituem especificações de fornecedor/TCE. Não há chamadas a prompts do Lovable nem API de IA paga.
