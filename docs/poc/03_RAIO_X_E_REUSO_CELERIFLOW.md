# RAIO-X REAL DO CÓDIGO E REUSO — SOMENTE PoC Pau dos Ferros
**Verificação por inspeção de código GitHub:** 22/10/2026  
**Único repositório autorizado para escrita:** `Robonuvem-dev/pau-dos-ferros`, branch `Vette`.  
**Fonte de requisitos:** edital retificado PE 6/2026-0036, matriz PoC itens 1.1 a 16.23 (168).  
**Fonte de reaproveitamento, SOMENTE LEITURA:** `Robonuvem-dev/Celeriflow-Guarama`, commit `2ae0c70bd217`. Não alterar/copiar repositório inteiro.  
**Pau dos Ferros baseline:** `main` commit `7f55ea09e075`, com código que contém commit anterior `fcfb0e6de826`, intitulado “Finalizou Sprint 1 em uma etapa”. `Vette` foi criada sobre `main`, e no momento inicial da inspeção estava exatamente 3 commits à frente, SOMENTE documentação.

## Resposta executiva: a que passo estamos?

**Há frontend, esquema de dados, autenticação, gestão, telas públicas e operações básicas prontas no GitHub. NÃO é projeto em branco.** A primeira sprint foi concluída no código-fonte de Pau dos Ferros por quem o criou. O `roadmap.md` original ainda mostra caixas desmarcadas; portanto, ele NÃO serve como status de homologação atual.

**Ainda não há demonstração provada para a comissão:** 0/168 itens estão homologados no nosso checklist. Isso significa **não verificado**, não que tudo esteja ausente. A branch `Vette` não tinha commit de código funcional quando examinada. Nenhum teste/build/PoC foi executado por esta auditoria; as constatações abaixo são inspeção de fonte, não validação em execução.

### Componentes já escritos em Pau dos Ferros

- Stack: `@tanstack/react-start`, React, TanStack Router, Supabase/Lovable Cloud como backend, Drizzle/migrations; distinto de Guarama.
- **27 entradas de cadastro** em `src/lib/modules.ts`, incluindo notícias, banners, álbuns, mídias, agentes políticos, secretarias, Carta de Serviços, licitações, contratos, inidôneas, credores, convênios, receitas, despesas, servidores, diárias, leis, decretos, portarias, RREO, RGF, concursos, COVID, documentos de conselhos, obras, veículos e conselhos. **Entrada no catálogo não equivale a módulo plenamente implementado.**
- Painel administrativo e CRUD genérico `src/components/admin/CrudModule.tsx`, edição, criação, exclusão, upload e perfis.
- Rotas públicas: `src/routes/index.tsx`, `transparencia.index.tsx`, `transparencia.$module.tsx`, `esic.tsx`, `servicos.tsx`, `noticias.index.tsx`, `secretarias.tsx`, `acessibilidade.tsx`, `lgpd.tsx`.
- Dados: `drizzle/migrations/0000_portal_pau_dos_ferros_schema.sql` e migrations `0001` a `0005`: perfis, auditoria, visualizações, ATRICON, atendimento e permissões.
- Modo de transparência: consulta via `src/lib/public.functions.ts`, limites de 1.000 registros, exportação CSV/JSON do subconjunto carregado em `src/components/site/PublicTable.tsx`.
- Segurança: RLS e perfis definidos no SQL; **validar em execução** as regras efetivas, conta admin inicial e acesso aos campos de pessoal e protocolos.
- ATRICON `src/lib/atricon.ts` tem 88 entradas, mas `avaliar()` deduz atendimento pela mera presença de cadastro ou `fonte === "portal"`: **isso NÃO prova atendimento** e pode gerar falso positivo.
- `roadmap.md` explicita **“sem webmail”**. Nenhum módulo webmail funcional foi identificado na árvore/rotas inspecionadas. **M16, 23 critérios, permanece bloqueador crítico.**
- `.env` aparece versionado no GitHub; analisar/mitigar risco sem exibir conteúdo nem credenciais. Não foi lido nesta auditoria.

## O que Guarama possui como fonte potencial, sem presumir compatibilidade direta

- **Portal Transparência mais avançado:** `src/lib/transparencia/{consultation-service,consultation-export,document-search,pntp-policy,publication-storage}.ts`; administração `src/app/app-domain/transparencia/{fontes,licitacoes,contratos,publicacoes,pntp,solicitacoes}`; portal público `src/app/portal/portaldatransparencia`.
- **Licitações e contratos:** `src/lib/compras/{bidding-workflow,contract-lifecycle,procurement-lifecycle}.ts` e `src/app/app-domain/compras`. Há funções de transição de status e regras comerciais/documentais que podem ser portadas com menor custo que construir do zero.
- **RH/folha:** `src/lib/rh` (69 arquivos lidos no índice, incluindo importação, folha e relatórios) e `src/app/app-domain/rh`.
- **Frotas:** `src/lib/frotas` e `src/app/app-domain/frotas` com serviços de veículos, multas, manutenção, combustível e relatórios.
- **Obras:** `src/lib/obras` e `src/app/app-domain/obras`, incluindo fiscalização e medições.
- **Atendimento:** `src/app/app-domain/atendimento` com ouvidoria, fila e relatórios.
- **ATRICON/PNTP:** `src/lib/transparencia/pntp-policy.ts` obriga URL de evidência para `SATISFIED`. Guarama trabalha com matriz PNTP mais ampla; para esta PoC, **manter os 88 critérios específicos do edital**, reaproveitando a ideia de evidência, NÃO substituir pela matriz de 181.
- **Atenção:** Guarama é **Next.js/Prisma/PostgreSQL/Firebase**, enquanto Pau dos Ferros é **TanStack/Supabase/Drizzle**. Não copiar arquivos dependentes de `prisma`, `AppContext`, `getTenantContextForModule`, server actions Next, migrations ou autenticação sem adaptar. Priorizar regras puras TS, schemas, componentes conceituais e lógica de validação; reimplementar adapters mínimos no destino.
- **Não identificados como solução pronta em nenhum dos índices examinados:** webmail SaaS com 60 contas e aplicativo Android/iOS comprovável. Não declarar inexistência absoluta sem varredura adicional, mas tratá-los como bloqueios não resolvidos.

## Matriz de reuso por módulo PoC

| Módulo da PoC | Estado visível em Pau dos Ferros (P) | Referência a reaproveitar Guarama (G) | Situação inicial |
|---|---|---|---|
| 01 — Infraestrutura (5) | web, auth, migrations, RLS | `lib/platform`/auditoria | P presente, teste pendente |
| 02 — Portal Oficial (14) | notícias, banners, mídias, páginas | `portal`, gestão de conteúdo | P forte, detalhes pendentes |
| 03 — Licitações/contratos (18) | CRUD e consulta | `lib/compras/bidding-workflow.ts`, `contract-lifecycle.ts` | P básico; G pode complementar |
| 04 — Convênios (13) | CRUD `convenios` | `app-domain/compras/convenios` | P básico; G pode complementar |
| 05 — Informação/transparência (17) | portal, e-SIC/Ouvidoria, busca | `lib/transparencia`, `app-domain/atendimento` | P parcial; G mais maduro |
| 06 — COVID (8) | categoria `covid` em publicações | documentos/transparência | P básico, fluxos não provados |
| 07 — Integrações (3) | não comprovadas contabilidade/folha/TCE | `lib/integrations`, módulos RH/financeiro | bloqueio |
| 08 — LC 131 (10) | receitas/despesas agregadas | `lib/transparencia` + financeiro | P básico; G mais maduro |
| 09 — Pessoal (7) | `servidores` | `lib/rh`, `app-domain/rh` | P básico; G mais maduro |
| 10 — Obras (13) | `obras` | `lib/obras`, `fiscalizacao-medicoes` | P básico; G mais maduro |
| 11 — Frotas (4) | `veiculos` | `lib/frotas` | P básico; G mais maduro |
| 12 — Conselhos (6) | `conselhos`, `conselho-doc` | conteúdo institucional a avaliar | P básico |
| 13 — App Android/iOS (8) | apenas rotas web identificadas | nenhum aplicativo confirmado | bloqueio |
| 14 — IA/ATRICON (4) | 88 critérios e gerador de anexo; falso positivo possível | `pntp-policy` para evidências; critério 88 mantém-se | corrigir e testar |
| 15 — Carta de Serviços (15) | `servicos` e página pública | `portal/servicos`, atendimento | P básico; melhorar |
| 16 — Webmail (23) | ausente do roadmap deliberadamente | nenhum webmail verificado | **bloqueio máximo** |

## O que NÃO fazer

1. Não recriar o ERP de Guarama em Pau dos Ferros; **só portabilidade seletiva voltada para a PoC**.
2. Não gastar nada em Lovable, disparar prompts, agentes, deploys ou execução de IA via Lovable.
3. Não tocar em `Robonuvem-dev/Celeriflow-Guarama` ou em qualquer repositório externo; fonte é somente leitura.
4. Não considerar 27 cadastros = 168 verificações. Uma tela só conta após fluxo e evidência.
5. Não afirmar que “Sprint 1 concluída” equivale a “PoC pronta”; o commit se refere ao desenvolvimento inicial do próprio repo.
6. Não fazer migrations no banco de produção, nem publicar credenciais, dados reais ou assumir cloud operacional sem teste.
7. Não trabalhar em implantação contratual, SEO opcional, rebranding amplo, treinamento mensal ou funções extras de ERP: **só o que a comissão da PoC cobra**.

## Ordem concreta para começar implementação

**P0 imediato:** validar ambiente/demo e segurança; confirmar solução REAL para M16 e M13; corrigir ATRICON falso positivo.  
**P1:** garantir que o portal e os cadastros já existentes carreguem, salvem, publiquem e consultem; reaproveitar funções TS de Guarama para M03/M04/M05/M08.  
**P2:** complementar dados/setoriais M06–M12, integrações e exportações conforme os 168 critérios.  
**P3:** teste fechado de TODOS os 168, gravação e evidência, ensaio com outro operador e freeze.  

O número **0/168 homologados** no checklist é uma situação de **auditoria não executada**, NÃO um índice estimado de implementação.

**Referências GitHub:**
- Pau dos Ferros: [modules.ts](https://github.com/Robonuvem-dev/pau-dos-ferros/blob/main/src/lib/modules.ts), [CRUD](https://github.com/Robonuvem-dev/pau-dos-ferros/blob/main/src/components/admin/CrudModule.tsx), [ATRICON](https://github.com/Robonuvem-dev/pau-dos-ferros/blob/main/src/lib/atricon.ts), [roadmap](https://github.com/Robonuvem-dev/pau-dos-ferros/blob/main/roadmap.md).
- Guarama: [Bidding workflow](https://github.com/Robonuvem-dev/Celeriflow-Guarama/blob/main/src/lib/compras/bidding-workflow.ts), [pntp-policy](https://github.com/Robonuvem-dev/Celeriflow-Guarama/blob/main/src/lib/transparencia/pntp-policy.ts), [Portal da Transparência — operação](https://github.com/Robonuvem-dev/Celeriflow-Guarama/blob/main/docs/PORTAL_TRANSPARENCIA_OPERACAO.md).
