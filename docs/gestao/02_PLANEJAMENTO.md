# PLANO DE ATAQUE — SOMENTE PROVA DE CONCEITO (Sistema Municipal)

**Substitui integralmente o planejamento anterior de S0–S6 com “5 dias úteis por sprint”.**  
**Meta operacional: testar e completar 168 verificações da Sistema Municipal no menor tempo possível, com blocos paralelos e janelas-alvo de 0 a 48 horas.** Não é garantia de conclusão: a viabilidade depende do que realmente funcionar, de webmail e aplicativo disponíveis, e da capacidade da equipe. **Foco exclusivo na Sistema Municipal; excluir implantação contratual e módulos não exigidos.**

**Escrita:** `Robonuvem-dev/pau-dos-ferros` branch `Vette`. **Guarama apenas leitura. Lovable zero chamadas/créditos.** `main` preservada, sem deploy automático intencional.

## Baseline confirmada no GitHub

- O projeto principal tem commit `fcfb0e6` (“Finalizou Sprint 1 em uma etapa”), com site, painel, 27 registros de módulo e migrations. NÃO começar do zero.
- A branch `Vette` começou apenas com 3 commits de documentação; desenvolvimento funcional para esta Sistema Municipal ainda não foi cometido na branch.
- **Usar primeiro o que Aurora das Veredas já tem**, depois portar exclusivamente regras de negócio e componentes necessários de Guarama (Next/Prisma/Firebase para TanStack/Supabase/Drizzle exige adaptação).
- Referência factual de código: [Raio-X e reuso](03_RAIO_X_E_REUSO_CELERIFLOW.md); verificação item a item: [168 requisitos](01_CHECKLIST_168_REQUISITOS.md).

## SPRINT ZERO — IMEDIATA: verificação de 0–3 horas

- [ ] Verificar ambiente de demo, autenticação e acesso do admin, CRUD, publicação e consulta anônima sem tocar em produção indevidamente.
- [ ] Validar/mitigar versionamento de `.env` com segurança, sem divulgar segredos.
- [ ] Identificar titulares das frentes de código/QA e paralelizar tarefas; com uma pessoa só, não prometer fechamento em 48 h.
- [ ] **M16 WEBMAIL**: identificar webmail SaaS REAL que demonstre até 60 contas, recebimento/envio, painel, grupos, SSL/TLS e recursos do edital; sem provedor, BLOQUEADOR.
- [ ] **M13 APP Android/iOS**: confirmar app real e como será demonstrado; navegador responsivo não equivale automaticamente.
- [ ] **M07 integrações**: identificar amostras autorizadas e esquemas TCE/contabilidade/folha; sem integração, marcar bloqueio.
- [ ] Priorizar os requisitos faltantes por efeito eliminatório da Sistema Municipal, não por design.
- [ ] Conferir convocação e prazo oficial da Sistema Municipal; caso pregão já encerrado para novos licitantes, não confundir desenvolvimento com possibilidade de participação.

**Gate:** decidir se podemos materialmente demonstrar M16+M13+M07; sem isso, desenvolvimento de polimento não desbloqueia a Sistema Municipal.

## SPRINT 1 — APROVEITAMENTO DO QUE JÁ EXISTE (3–12 horas, frentes paralelas)

**Pacote A: M01/M02/M05/M15** — verificar fluxo completo das rotas do site, notícias, galerias, banner, conteúdos, serviços, e-SIC/ouvidoria e dados institucionais. Corrigir somente itens explícitos da matriz.  
**Pacote B: M03/M04/M06** — verificar licitações/contratos/convênios/COVID. Portar de Guarama APENAS validações/status/regras de negócio necessários à referência (ex.: `src/lib/compras/bidding-workflow.ts`) e ligar ao CRUD/banco de Aurora das Veredas.  
**Pacote C: M07/M08/M09** — verificar fontes fiscais, folha, compatibilidade TCE e importações; priorizar demonstrar importar e consultar com dados autorizados. Reaproveitar contrato de exportação e catálogos de Guarama quando possível.  
**Pacote D: M10/M11/M12** — obras/medição, frotas, conselhos; reaproveitar validações e regras Guarama, não copiar ERP inteiro.  
**Pacote E: M13/M14/M16** — app, ATRICON 88 critérios e webmail. Corrigir o falso positivo de `avaliar()`, usar evidências; configurar webmail real sem criar mock.

- [ ] Cada pacote preencher diagnóstico `já demonstrável / parcial / faltante / bloqueado` da matriz.
- [ ] Salvar commit por pacote com IDs `x.y` dos requisitos atendidos.
- [ ] QA executa teste e salva evidência em paralelo a cada commit.
- [ ] Não marcar `[x]` na matriz somente porque um arquivo ou tabela existe.

## SPRINT 2 — FECHAMENTO DOS BLOQUEADORES (12–30 horas)

- [ ] Entregar rotas e persistência exigidas (CRUD→publicação→consulta→filtro→relatório).
- [ ] Testar webmail verdadeiro: painel, gerenciamento de contas, envio/recebimento e segurança (M16).
- [ ] Testar app Android/iOS: operações reais exigidas, não só tema responsivo (M13).
- [ ] Testar importação e rastreabilidade TCE, folha, contabilidade (M07).
- [ ] Corrigir lacunas de licitações/contratos/convênios (M03/M04), fiscal (M08) e setoriais (M10–M12) conforme teste da matriz.
- [ ] Remover 100% dos falsos positivos ATRICON (M14); gerar relatório reproduzível.
- [ ] Resolver qualquer vazamento de dados ou bypass de permissão imediatamente.

## SPRINT 3 — ENSAIO DE COMISSÃO (30–48 horas)

- [ ] Percorrer **1.1 até 16.23**, com conta admin da Sistema Municipal e permissões de editor/cidadão, na ordem da matriz original.
- [ ] referência independente: outro operador executa as ações **sem alterar código**.
- [ ] Capturar URL, credenciais de teste (fora do GitHub), registros de referência/autorizados, print/vídeo, exportação, resultado e commit. Não inserir segredos no repositório.
- [ ] Rodar testes/build/lint em ambiente autorizado; verificar navegação e regressões.
- [ ] Registrar **ATENDE / NÃO ATENDE** por item, sem inventar aprovação; item não testado é não homologado.
- [ ] Congelar versão demonstrável, kit presencial (computador, internet e backup) e relatório de não conformidades.
- [ ] **GO** somente com requisitos obrigatórios demonstráveis; se falta algum, registrar **NO-GO** e lacuna, sem prometer exceção da comissão.

## Regras de execução

1. Sistema Municipal de edital = **168 itens operacionais**, não 16 páginas bonitas.
2. Aproveitar código e experiência existentes da Celeriflow como REFERÊNCIA SOMENTE LEITURA; commits e migrations só na `Vette` de Aurora das Veredas.
3. Evitar trabalho fora da Sistema Municipal: nada de ERP amplo, operação futura, marketing, SEO não exigido, brand kit ou migração massiva.
4. Não acionar Lovable (editor, IA, prompts, integrações pagas).
5. Não criar webmail simulado, app falso ou integração de referência. Massa de ensaio legítima/de referência e explicitamente marcada é permitida quando o edital autoriza.
6. A Sistema Municipal no edital tem prazo de até **2 dias úteis após convocação**, presencial; as janelas acima são **timeboxes internos**, não alteração do prazo oficial.
7. **STATUS do GitHub no início deste plano:** Sprint 1 original existe; 0/168 homologados porque não houve auditoria em execução; não afirmar que 0/168 funcionalidades existem.
