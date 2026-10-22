# Plano de sprints — da branch `Vette` à PoC presencial

**Escopo:** 168 itens do edital retificado; 16 módulos; entregas registradas somente neste repositório/branch. **Estimativa de organização, não promessa de prazo:** Sprint 0 (até 2 dias úteis), S1–S5 (janelas de até 5 dias úteis cada) e S6 (até 5 dias úteis). As durações só serão reestimadas após auditoria técnica; **a PoC tem prazo editalício independente de até 2 dias úteis após convocação**. Nenhuma sprint torna viável retroativamente uma licitação encerrada.

## Definição de pronto universal (DoD)

- Código versionado na `Vette` com requisito `x.y` citado em commit/PR.
- Teste positivo do **caminho completo**: cadastro/admin → persistência → consulta pública/relatório/importação, conforme o item.
- Testes negativos: validação, permissões, erro externo, perfis, dados ausentes e exportação quando aplicável.
- Evidência reproduzível: ambiente, URL, usuário de ensaio, massa fictícia/permitida, passos, captura/arquivo, commit, revisor.
- Lint, testes e build aprovados em ambiente de teste; verificação de RLS e de vazamento de dados.
- Item da [matriz de 168](01_CHECKLIST_168_REQUISITOS.md) só recebe `[x]` após homologação/segunda revisão. Sem mock contado como pronto.

## Dependências e papéis

**Papéis (nomes a designar):** responsável de produto/edital; desenvolvimento full-stack; integrações e dados; segurança/infra; QA/PoC; pessoa para presença em Pau dos Ferros. Uma pessoa pode acumular papéis desde que revisão independente seja garantida. A equipe e velocidade ainda não foram confirmadas.

**Trilhas paralelas desde S0:** (A) 16 módulos no repositório; (B) escolha/licença técnica de webmail; (C) contrato de dados/importações de terceiros; (D) status oficial do certame e documentos habilitatórios. As trilhas B/C/D são bloqueadores externos; nenhuma será falsificada com dados ou contas de produção indevidas.

## S0 — Governança, auditoria e desbloqueios (até 2 dias úteis)

**Objetivo:** tornar claro o que já funciona, o que falta, e se ainda cabe disputar o pregão.

- [ ] S0.01 Confirmar no PNCP/Portal de Compras Públicas o andamento do PE 6/2026-0036, atas, retificações, sessão de 19/10, eventual suspensão/reabertura e convocação.
- [ ] S0.02 Verificar documentação habilitatória, atestados, índices financeiros e divergências do edital; registrar consulta/esclarecimento formal caso aplicável.
- [ ] S0.03 Verificar `main` versus `Vette` e instituir convenção de commits; nenhuma automação de merge/deploy na `main`.
- [ ] S0.04 Inventariar rotas, tabelas, migrações, CRUD, sessões, RLS, publicação, exports, storage, testes e dependências do projeto.
- [ ] S0.05 Auditar a existência do `.env` rastreado, sem expor conteúdo; prevenir vazamentos, corrigir versionamento, rotacionar segredos caso confirmado e autorizado.
- [ ] S0.06 Verificar bootstrap de administrador, política RLS, `readPublicModule` e consulta pública de protocolo para possíveis exposições.
- [ ] S0.07 Definir ambiente de ensaio, dados fictícios, backup/snapshot, contas por perfil e procedimentos de rollback.
- [ ] S0.08 Escolher solução de webmail SaaS aderente, validar custo/licença, domínio e plano para demonstrar até 60 contas. **Sem contratação/compra automática.**
- [ ] S0.09 Solicitar especificações e amostras para interfaces TCE/contábil/folha; selecionar formato de importação e homologação.
- [ ] S0.10 Criar vínculo por requisito e priorização de tarefas; atualizar apenas status com evidência.
**Aceite S0:** status jurídico registrado; riscos críticos endereçados ou declarados como bloqueados; ambiente e padrão de evidência definidos; Go/No-Go inicial.

## S1 — Fundação, Portal Oficial e Carta de Serviços (5 dias úteis de referência)
**Módulos:** 1 (5), 2 (14), núcleo de 5 (17), base de 15 (15). Os requisitos de 5 e 15 continuam também nas sprints relacionadas.

- [ ] S1.01 Autenticação, autorização RLS, administração, armazenamento seguro de anexos, trilha de alterações, erros controlados e gestão de versões sem intervenção local.
- [ ] S1.02 Notícias multimídia (imagem, áudio, vídeo), galeria de álbuns, banners, agentes políticos e concursos: fluxo completo de publicação.
- [ ] S1.03 Temas/cores configuráveis, menus, atalhos, links externos e integração Facebook exigida por 2.6.
- [ ] S1.04 Unidades gestoras/executoras, críticas/alertas do conteúdo e indicadores de pendências.
- [ ] S1.05 Portal institucional: leis, decretos, portarias, resoluções, editais, diárias e informação do município; buscas por número/ano/ementa.
- [ ] S1.06 Carta de Serviços: cadastro, requisitos/etapas, responsáveis, links, tags e apresentação pública.
- [ ] S1.07 Implementar consulta paginada/exportação íntegra e testes de acesso público e admin.
- [ ] S1.08 Testar evidências do M01/M02 e dos itens S1 do M05/M15.
**Aceite S1:** conteúdo autorizado percorre admin→web com busca, arquivos, auditoria, atualização e demonstração repetível.

## S2 — Licitações, convênios, portal cidadão e legado COVID (5 dias úteis)
**Módulos:** 3 (18), 4 (13), 6 (8), fechamento funcional de 5 (17).

- [ ] S2.01 Licitação/dispensa/inexigibilidade, modalidade, fases, cronograma, documentos, credores, comissões/equipes.
- [ ] S2.02 Contratos, aditivos, ARP, carona, sanções e relações; relatório do dia, mapa de licitações, vencimentos e críticas.
- [ ] S2.03 Convênios: concedente/convenente, categorias, termos, metas, recursos, parcelas, obrigações, cronograma e ligações com contratos.
- [ ] S2.04 COVID legado: classificar e relacionar diárias, contratos, normas, pessoal, despesas, receitas, boletins e painel único, sem inventar fatos históricos.
- [ ] S2.05 e-SIC/Ouvidoria: abertura, protocolos, recursos, prazos, prorrogação/respostas, trilha de auditoria e privacidade.
- [ ] S2.06 Integração consistente do painel de transparência com licitações e convênios; fontes reais ou claramente identificadas como fictícias.
- [ ] S2.07 Relatórios, filtros, validações de obrigatórios e evidências PoC M03–M06.
**Aceite S2:** vinculações comprovadas no banco e UI; fluxos e relatórios demonstráveis; dados públicos corretos.

## S3 — Transparência fiscal, folha e integrações (5 dias úteis)
**Módulos:** 7 (3), 8 (10), 9 (7).

- [ ] S3.01 Definir contratos de dados de contabilidade, folha e TCE; adapters com mapeamento, validação, importação idempotente, log/reprocessamento.
- [ ] S3.02 Importar credores e agentes públicos a partir de formato/arquivo autorizado; demonstrar tratamento de erros e duplicatas.
- [ ] S3.03 Modelar receita/despesa orçamentária e extraorçamentária; empenho, liquidação e pagamento com relações e ordem bancária.
- [ ] S3.04 Relatórios comparativos em tempo real e visões por credor, órgão, período e estágio fiscal.
- [ ] S3.05 Cadastro de medicamentos com campos obrigatórios previstos no item 8.10.
- [ ] S3.06 Pessoal: importação de fontes múltiplas, lotação, vínculo, cargo, vantagens, descontos e remuneração com política de privacidade adequada.
- [ ] S3.07 Testar integridade de dados contábeis, rastreabilidade, consistência com fontes e evidências M07–M09.
**Aceite S3:** a demonstração prova fluxo de importação→persistência→consulta, sem maquiar ligação com fornecedor externo indisponível.

## S4 — Obras, frota e conselhos (5 dias úteis)
**Módulos:** 10 (13), 11 (4), 12 (6).

- [ ] S4.01 Processo de engenharia, recursos, contratos, aditivos, fotos datadas, medições, ART, andamento físico-financeiro e Plano Diretor.
- [ ] S4.02 Vínculo automático entre obras, contratos e credores, com auditoria de origem e controle de duplicidade.
- [ ] S4.03 Gráficos, relatórios, listagem e alertas críticos de obra.
- [ ] S4.04 Veículos: RENAVAM, fabricação, entrada/baixa, secretaria, fotos, máquina de obra, finalidade, busca avançada e alertas (seguro/IPVA/manutenção).
- [ ] S4.05 Conselhos: criação, vigência, composição de titulares/suplentes, histórico, atos, anexos, páginas próprias e alertas.
- [ ] S4.06 Testes de relacionamento, busca pública, evidências M10–M12.
**Aceite S4:** três módulos completos em fluxo de dados reais de teste, com cadastro/edição/pesquisa/vínculos/evidências.

## S5 — App, IA/ATRICON, refinamento da Carta e Webmail (5 dias úteis, pode demandar replanejamento)
**Módulos:** 13 (8), 14 (4), fechamento 15 (15), 16 (23). **Trilha webmail inicia em S0, nunca aguardar S5 para escolhê-la.**

- [ ] S5.01 Publicação e edição móvel autenticada de notícias, editais, relatórios fiscais, leis, decretos e estatísticas (13.1–13.8).
- [ ] S5.02 Validar solução Android/iOS que atenda literalmente ao edital; **PWA responsiva só será aceita como equivalência se houver fundamento/autorização**.
- [ ] S5.03 Corrigir lógica ATRICON: um cadastro não basta para considerar o critério atendido; exigir evidência por 88 critérios e distinção “atende/não atende/terceiro”.
- [ ] S5.04 Varrer pendências, gerar anexo técnico coerente e auditorável sem inventar validação do tribunal; evitar dependência de créditos de IA Lovable.
- [ ] S5.05 Carta: Ouvidor, satisfação, visualizações, modelos, relatório de críticas e telas administrativas.
- [ ] S5.06 Webmail SaaS: administrar 60 contas, domínios, grupos por secretaria, pastas, anexos, autenticação, antispam, reset, auditoria, TLS e gestão em sessão.
- [ ] S5.07 Demonstrar envio/recebimento genuínos entre duas contas controladas e validação mobile do webmail.
- [ ] S5.08 Evidências M13–M16, sem esconder custo/licença ou limitações de provedor externo.
**Aceite S5:** uso móvel comprovado, relatório ATRICON verificável, carta completa e webmail real; todos os critérios com roteiros reproduzíveis.

## S6 — Qualidade, PoC completa, freeze e presença (até 5 dias úteis)

- [ ] S6.01 Revisar item por item, sempre na sequência 1.1→16.23 do edital (168 verificações).
- [ ] S6.02 Executar testes automatizados (unit/integration), lint, build e smoke funcional autenticado e anônimo, com ambiente isolado.
- [ ] S6.03 Testar cargas, exportações, segurança, backup/restore, inatividade/indisponibilidade, dados e permissões.
- [ ] S6.04 Preparar 3 perfis fictícios (administrador, editor, cidadão) e massas coerentes (licitação→contrato→convênio→obra→transparência).
- [ ] S6.05 Fazer um ensaio completo sem ler código nem intervir no banco; capturar evidências por item, com observador que verifica critérios do edital.
- [ ] S6.06 Revisar e corrigir itens `NV/P/I/T` antes de afirmar `H` e antes do freeze.
- [ ] S6.07 Congelar commit candidato, salvar checksum/identificação da versão, protocolo de contingência e captura de evidências.
- [ ] S6.08 Preparar kit de viagem: equipamentos, internet de contingência, credenciais, acesso com perfil admin, documento de roteiro e backups sem segredos em mídia insegura.
- [ ] S6.09 Verificar convocação e prazo exato, com responsável presencial confirmado; testar apresentação na condição real.
- [ ] S6.10 Encerrar com despacho **GO/NO-GO** técnico e jurídico e registro dos eventuais impedimentos.
**Aceite S6:** 168/168 homologados, ambiente intacto/operacional, termo de validação interna e apresentação executável sem alterações em sessão. Na ausência, **NO-GO** para declarar a PoC pronta.

## Quadro de gestão de progresso

| Etapa | Dependência para abrir | Critério para fechar | Situação inicial |
|---|---|---|---|
| S0 | Branch `Vette`, edital disponível | viabilidade/infra/arquitetura e fontes definidas | Planejada |
| S1 | S0 e ambiente de teste | M01/M02 e componentes de M05/M15 | Não iniciada |
| S2 | S1 + schemas de negócio | M03/M04/M06 e M05 completo | Não iniciada |
| S3 | contrato de dados externos | M07/M08/M09 | Bloqueável por terceiros |
| S4 | cadastros compartilhados | M10/M11/M12 | Não iniciada |
| S5 | webmail definido desde S0; mobile autorizado | M13/M14/M15/M16 | Bloqueável por licenças |
| S6 | todos os módulos desenvolvidos | 168 homologações e ensaio presencial | Não iniciada |

**Progresso registrado inicialmente:** 0/168 homologados, pois esta etapa cria o planejamento, não executa nem prova funcionalidades. Não usar uma porcentagem inferida do número de arquivos ou telas.

## Próxima tarefa de desenvolvimento autorizável

S0.05–S0.06 (segurança), seguida da classificação real dos 168 itens. Antes de alterar banco, infraestrutura externa, credenciais, domínio de e-mail ou lançar custos, registrar dependência e pedir autorização específica. Não realizar `merge` na `main` sem validação.

[Mapa e arquitetura](00_MAPA_ENTREGA_POC.md) · [Checklist oficial 168](01_CHECKLIST_168_REQUISITOS.md)
