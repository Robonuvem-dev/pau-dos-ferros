# Checklist oficial — Prova de Conceito, Pregão 6/2026-0036

> Documento de trabalho gerado a partir do Anexo I ao Termo de Referência do edital **RETIFICADO**, páginas **31–50** do PDF (60 páginas). Este documento reproduz os 168 quesitos individuais da matriz de avaliação. Não substitui o edital nem configura prova de atendimento.
> Base: 22/10/2026 | Branch: `Vette` | Repositório único de alterações: `Robonuvem-dev/pau-dos-ferros`.

> Atualização 23/10/2026: Webmail será provido por outra pessoa. Merge/publicação e uso do Cloud existente autorizados; prompts e IA paga continuam proibidos. Evidências técnicas e ensaio público parcial: [status Sprint 5](05_STATUS_VALIDACAO_SPRINT5.md). Homologação integral continua pendente.

## Regras de uso
- Todos os itens começam **não homologados** (`[ ]`); cadastros/telas existentes não significam atendimento até execução e evidência.
- Ao concluir uma implementação, ainda manter `[ ]` até teste funcional positivo, captura da evidência e segunda conferência do roteiro.
- Ao marcar `[x]`, preencher a referência no registro de execução/PR: **URL/rota**, **passos de referência**, **conta/perfil**, **dado de prova**, **evidência (arquivo/link/print)**, **commit ou PR**, **revisor**.
- Classificações operacionais sugeridas: `NV` não verificado, `P` parcial, `I` implementado sem teste, `T` testado, `H` homologado; `[x]` somente em `H`.
- A matriz do edital julga **ATENDE/NÃO ATENDE**, sem pontuação; neste checklist não se presume aceite por porcentagem.
- Dados usados na Sistema Municipal devem ser de referência ou previamente autorizados; não inserir dados pessoais reais sem base/autorização.
- A Sistema Municipal é **presencial** e a solução deve existir ANTES de sua realização; o edital não admite desenvolver funcionalidades durante a referência.

## Painel por módulo
| Módulo | Critérios | Sprint responsável | Homologados |
|---|---:|---|---:|
| 1. Infraestrutura geral, segurança e instalação | 5 | S0/S1 | 0/5 |
| 2. Cadastro e recursos do site oficial | 14 | S1 | 0/14 |
| 3. Licitações, contratos e aditivos | 18 | S2 | 0/18 |
| 4. Convênios públicos | 13 | S2 | 0/13 |
| 5. Portais e informações do município | 17 | S1/S2 | 0/17 |
| 6. COVID-19: legado e emergências | 8 | S2 | 0/8 |
| 7. Integrações e importação TCE | 3 | S3 | 0/3 |
| 8. LC 131: transparência fiscal avançada | 10 | S3 | 0/10 |
| 9. Transparência de pessoal e folha | 7 | S3 | 0/7 |
| 10. Fiscalização de obras públicas | 13 | S4 | 0/13 |
| 11. Veículos e frotas | 4 | S4 | 0/4 |
| 12. Conselhos municipais | 6 | S4 | 0/6 |
| 13. Aplicativo Android/iOS | 8 | S5 | 0/8 |
| 14. IA/ATRICON | 4 | S5 | 0/4 |
| 15. Carta de Serviços | 15 | S1/S5 | 0/15 |
| 16. Webmail institucional SaaS | 23 | S0 (decisão)/S5 (execução) | 0/23 |
| **TOTAL** | **168** | | **0/168** |

## Quadro da matriz oficial

### M01 — Infraestrutura geral, segurança e instalação (5 requisitos; S0/S1)

- [ ] **1.1** — Interação com o usuário por meio de janelas (Padrão Windows) no ambiente de gerenciamento. *(edital, p. 31)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **1.2** — Atualização automática de versão remota: ao iniciar o sistema, verificar e atualizar automaticamente sem intervenção local. *(edital, p. 31)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **1.3** — Instalação e acesso direto via internet através de ambiente web centralizado. *(edital, p. 32)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **1.4** — Conexão direta e segura com o banco de dados hospedado remotamente em nuvem. *(edital, p. 32)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **1.5** — Aprimoramentos, adequações e inovações do sistema disponibilizados sob demanda da contratante. *(edital, p. 32)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**

### M02 — Cadastro e recursos do site oficial (14 requisitos; S1)

- [ ] **2.1** — Cadastro, edição e publicação de Notícias com suporte a mídias. *(edital, p. 32)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **2.2** — Cadastro e gerenciamento de Galeria de Fotos organizadas por álbuns. *(edital, p. 32)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **2.3** — Cadastro e publicação de Vídeos vinculados diretamente às publicações. *(edital, p. 32)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **2.4** — Cadastro e disponibilização de Áudios informativos no site. *(edital, p. 32)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **2.5** — Cadastro de Agentes Políticos com cargos e perfis (Prefeito, Vice-Prefeito, Secretários). *(edital, p. 32)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **2.6** — Integração direta com o Facebook para exibição da página do município no site. *(edital, p. 32)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **2.7** — Configuração e alteração em tempo real de temas e cores visuais do layout do site. *(edital, p. 33)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **2.8** — Criação e publicação dinâmica combinada de notícias, eventos, fotos e vídeos. *(edital, p. 33)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **2.9** — Disponibilização livre de links externos úteis e atalhos na página inicial. *(edital, p. 33)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **2.10** — Publicação de Banners rotativos de destaque na página frontal do site. *(edital, p. 33)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **2.11** — Publicação e upload de qualquer documento digital em formato JPG ou PDF. *(edital, p. 33)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **2.12** — Tela dedicada para cadastro e exibição de Concursos Públicos e Processos Seletivos. *(edital, p. 33)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **2.13** — Cadastro de Unidades Gestoras e Executoras da Prefeitura. *(edital, p. 33)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **2.14** — Geração automática de relatórios de críticas, alertas e pendências do site para gestão de informações. *(edital, p. 33)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**

### M03 — Licitações, contratos e aditivos (18 requisitos; S2)

- [ ] **3.1** — Cadastro completo de Licitações com anexos digitais em PDF. *(edital, p. 33)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.2** — Cadastro de Processos de Dispensa de Licitação com justificativas legais. *(edital, p. 34)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.3** — Cadastro de Processos de Inexigibilidade de Licitação. *(edital, p. 34)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.4** — Cadastro de Atas de Registro de Preço (ARP) e Adesão (Carona). *(edital, p. 34)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.5** — Cadastro e gerenciamento de Empresas Inidôneas punidas ou impedidas de licitar. *(edital, p. 34)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.6** — Cadastro completo de Contratos Administrativos com campos de valor, prazos e objeto. *(edital, p. 34)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.7** — Cadastro de Termos Aditivos vinculados aos contratos de origem. *(edital, p. 34)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.8** — Cadastro de andamentos, fases, cronograma e andamento dos processos licitatórios. *(edital, p. 34)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.9** — Cadastro e histórico de Credores (Fornecedores e prestadores de serviços). *(edital, p. 34)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.10** — Cadastro de Membros das equipes de apoio e de contratação. *(edital, p. 34)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.11** — Cadastro de Comissões de Contratação e equipes técnicas permanentes ou especiais. *(edital, p. 34)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.12** — Cadastro de Parcerias e Acordos do Município. *(edital, p. 35)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.13** — Cadastro de Termos de Fomento celebrados com Organizações da Sociedade Civil (OSC). *(edital, p. 35)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.14** — Impressão de relatórios consolidados (Boletim do dia, Avisos, Relatórios de Publicações). *(edital, p. 35)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.15** — Visualização pública e direta de todos os dados de licitações no Portal da Transparência. *(edital, p. 35)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.16** — Relatório de Mapa de Licitações com filtros avançados. *(edital, p. 35)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.17** — Relatório gerencial de Contratos a Vencer para alerta de planejamento. *(edital, p. 35)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **3.18** — Geração automática de relatórios de críticas, alertas e pendências em processos de licitação. *(edital, p. 35)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**

### M04 — Convênios públicos (13 requisitos; S2)

- [ ] **4.1** — Cadastro de Convênios (Campos obrigatórios: Nome Convenente, Responsável Convenente, Número do Convênio, Valor das Parcelas, Nome Concedente, Responsável Concedente, Valor Global do Convênio). *(edital, p. 35)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**
- [ ] **4.2** — Vinculação direta de contratos oriundos de convênios. *(edital, p. 36)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**
- [ ] **4.3** — Cadastro de Concedente (Entidade repassadora do recurso). *(edital, p. 36)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**
- [ ] **4.4** — Cadastro de Convenente (Entidade executora local). *(edital, p. 36)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**
- [ ] **4.5** — Cadastro de Tipos e Categorias de Convênio. *(edital, p. 36)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**
- [ ] **4.6** — Relatórios gerenciais completos sobre convênios vigentes. *(edital, p. 36)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**
- [ ] **4.7** — Cadastro de Metas e Especificações Técnicas do Convênio. *(edital, p. 36)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**
- [ ] **4.8** — Cadastro e controle do Plano de Aplicação de Recursos detalhado. *(edital, p. 36)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**
- [ ] **4.9** — Vinculação de Parcelas de desembolso e cronograma de pagamentos. *(edital, p. 36)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**
- [ ] **4.10** — Cadastro de Obrigações e condições imputadas ao Concedente. *(edital, p. 36)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**
- [ ] **4.11** — Vinculação de múltiplos Contratos vinculados diretamente ao Convênio. *(edital, p. 36)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**
- [ ] **4.12** — Visualização pública dos dados de convênios na interface web do Portal. *(edital, p. 37)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**
- [ ] **4.13** — Geração automática de relatórios de críticas, alertas e pendências do módulo de Convênios. *(edital, p. 37)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**

### M05 — Portais e informações do município (17 requisitos; S1/S2)

- [ ] **5.1** — Cumprimento integral das diretrizes da LRF e Lei de Acesso à Informação. *(edital, p. 37)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **5.2** — Portal específico para visualização pública e detalhada de receitas e despesas. *(edital, p. 37)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **5.3** — Módulo integrado ao e-SIC (Serviço de Informação ao Cidadão) com controle de prazos. *(edital, p. 37)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**
- [ ] **5.4** — Publicação estruturada de leis municipais e outros documentos administrativos. *(edital, p. 37)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **5.5** — Integração completa e funcional com o sistema de Ouvidoria Municipal. *(edital, p. 37)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **5.6** — Integração do painel público com dados de Licitações e Convênios em tempo real. *(edital, p. 37)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **5.7** — Seção institucional 'O Município' (História, A Cidade, Praças, Sítios, Postos de Saúde, Distritos, Escolas, Prédios Públicos e Eventos). *(edital, p. 37)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **5.8** — Cadastro de Leis com busca avançada no site (pesquisa por número, ano, ementa e palavras- chave). *(edital, p. 38)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **5.9** — Cadastro de Portarias com filtros de busca. *(edital, p. 38)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **5.10** — Cadastro de Decretos Executivos. *(edital, p. 38)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **5.11** — Cadastro de Editais públicos de licitação, concursos e convocações. *(edital, p. 38)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **5.12** — Cadastro de Resoluções de Conselhos e órgãos municipais. *(edital, p. 38)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **5.13** — Cadastro de Processos Seletivos simplificados de contratação temporária. *(edital, p. 38)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **5.14** — Cadastro de qualquer tipo de documento em ambiente digital público. *(edital, p. 38)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **5.15** — Cadastro e exibição da Lei de Responsabilidade Fiscal municipal consolidada. *(edital, p. 38)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **5.16** — Cadastro, controle e justificativa de Diárias de Viagens de agentes públicos. *(edital, p. 38)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**
- [ ] **5.17** — Geração automática de relatórios de críticas, alertas e pendências no portal público. *(edital, p. 38)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**

### M06 — COVID-19: legado e emergências (8 requisitos; S2)

- [ ] **6.1** — Vinculação de Diárias decorrentes de ações de enfrentamento emergencial. *(edital, p. 39)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **6.2** — Vinculação de Contratos administrativos emergenciais. *(edital, p. 39)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **6.3** — Vinculação de Portarias de nomeação ou designação específicas. *(edital, p. 39)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **6.4** — Vinculação de Legislação e decretos de calamidade ou emergência em saúde. *(edital, p. 39)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **6.5** — Vinculação específica de despesas e receitas relativas ao combate emergencial. *(edital, p. 39)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **6.6** — Vinculação de detalhamento de pessoal alocado em ações de emergência. *(edital, p. 39)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **6.7** — Cadastro e publicação do boletim epidemiológico diário do município. *(edital, p. 39)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **6.8** — Página exclusiva unificada com todas as ações, relatórios, despesas e receitas ligadas ao Covid-19. *(edital, p. 39)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**

### M07 — Integrações e importação TCE (3 requisitos; S3)

- [ ] **7.1** — Realizar integração técnica com sistema contábil de outras empresas contratadas pelo município. *(edital, p. 40)*  
  Situação: `B` · Evidência/rota: [bloqueadores remanescentes](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste/revisor: **pendente**
- [ ] **7.2** — Realizar integração técnica com sistema de folha de pagamento de outras empresas. *(edital, p. 40)*  
  Situação: `B` · Evidência/rota: [bloqueadores remanescentes](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste/revisor: **pendente**
- [ ] **7.3** — Importar do Tribunal de Contas do Estado (TCE) informações cadastrais básicas como agentes públicos e credores. *(edital, p. 40)*  
  Situação: `B` · Evidência/rota: [bloqueadores remanescentes](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste/revisor: **pendente**

### M08 — LC 131: transparência fiscal avançada (10 requisitos; S3)

- [ ] **8.1** — Cadastro e exibição de Despesas extra-orçamentárias municipais. *(edital, p. 40)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **8.2** — Cadastro e exibição de Despesas orçamentárias municipais. *(edital, p. 40)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **8.3** — Cadastro e exibição de Receitas extra-orçamentárias municipais. *(edital, p. 40)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **8.4** — Cadastro e exibição de Receitas orçamentárias municipais. *(edital, p. 40)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **8.5** — Cadastro e exibição detalhada de Empenhos com identificação de credor e valor. *(edital, p. 40)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **8.6** — Cadastro e exibição detalhada de Liquidações de despesas municipais. *(edital, p. 40)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **8.7** — Cadastro e exibição detalhada de Pagamentos efetuados com ordem bancária. *(edital, p. 41)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **8.8** — Emissão de relatórios gerenciais comparativos em tempo real entre empenho, liquidação e pagamento. *(edital, p. 41)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **8.9** — Importação automatizada de arquivos e dados de outros sistemas contábeis. *(edital, p. 41)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **8.10** — Cadastro de Itens de Medicamentos (campos obrigatórios: descrição, unidade de medida de compra, unidade de medida de estoque, grupo, subgrupo, categoria do medicamento e subcategoria do medicamento). *(edital, p. 41)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**

### M09 — Transparência de pessoal e folha (7 requisitos; S3)

- [ ] **9.1** — Importação de dados através de leiaute próprio definido pelo sistema de gerenciamento. *(edital, p. 41)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **9.2** — Importação de dados de pessoal originários de múltiplos sistemas de Folha de Pagamento. *(edital, p. 41)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **9.3** — Disponibilizar detalhamento de despesas de pessoal agregadas por cargo público. *(edital, p. 41)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **9.4** — Disponibilizar detalhamento de pessoal agrupado por Secretaria municipal. *(edital, p. 41)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **9.5** — Disponibilizar detalhamento de pessoal agrupado por Vínculo de trabalho (efetivos, comissionados, temporários, etc.). *(edital, p. 42)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **9.6** — Disponibilizar visualização consolidada e detalhamento geral do quadro funcional. *(edital, p. 42)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **9.7** — Disponibilizar detalhamento individualizado por servidor com subsídios, vantagens e descontos nos termos da LAI. *(edital, p. 42)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**

### M10 — Fiscalização de obras públicas (13 requisitos; S4)

- [ ] **10.1** — Cadastro de Processo de Engenharia (Campos obrigatórios: data do processo, valor do contrato inicial, vinculação do contrato e cadastro da fonte de recurso). *(edital, p. 42)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **10.2** — Cadastro de Obra Pública (Campos obrigatórios: data início, data fim, data prevista, descrição da obra, valor global, aditivo de acréscimo, aditivo de supressão, origem do recurso, número do processo, tipo guarda-chuva, secretaria executora, endereço da obra, objeto do contrato e justificativa). *(edital, p. 42)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **10.3** — Vinculação e registro histórico do andamento físico- financeiro da obra. *(edital, p. 42)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **10.4** — Vinculação de Credores responsáveis pela execução da obra pública. *(edital, p. 42)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **10.5** — Vinculação automática de Contratos e Aditivos originados do módulo de licitação para evitar retrabalho de digitação. *(edital, p. 42)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **10.6** — Vinculação de Medições técnicas de engenharia aprovadas. *(edital, p. 43)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **10.7** — Vinculação das Anotações de Responsabilidade Técnica (ART) dos engenheiros responsáveis. *(edital, p. 43)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **10.8** — Disponibilização pública de gráficos, estatísticas, números e dados bem acessíveis na página de obras. *(edital, p. 43)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **10.9** — Disponibilização de relatórios gerenciais de listagem e situação das obras. *(edital, p. 43)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **10.10** — Cadastro e acompanhamento de múltiplos processos de engenharia concomitantes. *(edital, p. 43)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **10.11** — Disponibilização de upload e envio de fotos datadas para acompanhamento visual da obra no site. *(edital, p. 43)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **10.12** — Geração automática de relatórios de críticas, alertas e pendências do módulo de Obras. *(edital, p. 43)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **10.13** — Cadastro de Plano Diretor Municipal (Campos obrigatórios: cadastro de fases, cadastro de equipe, cadastro de eixos de atuação e cadastro de ações estratégicas). *(edital, p. 43)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**

### M11 — Veículos e frotas (4 requisitos; S4)

- [ ] **11.1** — Cadastro detalhado de Veículos (Campos obrigatórios: placa, ano de fabricação, Renavam, modelo, data de entrada na frota, data de saída/baixa, tipo de veículo, situação de uso, secretaria detentora, indicador de máquina de obra e finalidade de uso). *(edital, p. 44)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **11.2** — Disponibilização de funcionalidade de envio e publicação da foto do veículo correspondente. *(edital, p. 44)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **11.3** — Geração automática de relatórios de críticas, alertas e pendências de veículos (ex: seguros a vencer, IPVA, manutenção). *(edital, p. 44)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **11.4** — Mecanismo de busca avançada no site para o cidadão pesquisar por Modelo/Marca do veículo, por Secretaria detentora ou por Placa do veículo. *(edital, p. 44)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**

### M12 — Conselhos municipais (6 requisitos; S4)

- [ ] **12.1** — Cadastro de Conselhos Municipais (Campos obrigatórios: data de criação, descrição do conselho, ato/lei de criação, data de vigência do conselho e detalhamento de competências). *(edital, p. 44)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **12.2** — Vinculação de membros ativos, suplentes e representações da sociedade civil ou governo. *(edital, p. 44)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **12.3** — Vinculação histórica de ações de conselho (atas, reuniões, palestras, pautas e datas). *(edital, p. 44)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **12.4** — Geração automática de relatórios de críticas, alertas e pendências ligados ao funcionamento dos Conselhos. *(edital, p. 44)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **12.5** — Upload e vinculação direta de documentos próprios emitidos por cada conselho municipal. *(edital, p. 45)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **12.6** — Página web individualizada e customizável para cada conselho dentro do site oficial. *(edital, p. 45)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**

### M13 — Aplicativo Android/iOS (8 requisitos; S5)

- [ ] **13.1** — Visualização móvel nativa de Notícias publicadas no portal. *(edital, p. 45)*  
  Situação: `B` · Evidência/rota: [bloqueadores remanescentes](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste/revisor: **pendente**
- [ ] **13.2** — Cadastro direto de novas notícias por meio do dispositivo móvel autorizado. *(edital, p. 45)*  
  Situação: `B` · Evidência/rota: [bloqueadores remanescentes](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste/revisor: **pendente**
- [ ] **13.3** — Alteração e edição de notícias publicadas utilizando o aplicativo mobile. *(edital, p. 45)*  
  Situação: `B` · Evidência/rota: [bloqueadores remanescentes](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste/revisor: **pendente**
- [ ] **13.4** — Visualização de estatísticas em tempo real de acessos e visualizações das notícias. *(edital, p. 45)*  
  Situação: `B` · Evidência/rota: [bloqueadores remanescentes](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste/revisor: **pendente**
- [ ] **13.5** — Cadastro de Editais e Processos Seletivos por meio do aplicativo de gestão móvel. *(edital, p. 45)*  
  Situação: `B` · Evidência/rota: [bloqueadores remanescentes](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste/revisor: **pendente**
- [ ] **13.6** — Publicação simplificada de relatórios fiscais oficiais de forma direta pelo aplicativo. *(edital, p. 45)*  
  Situação: `B` · Evidência/rota: [bloqueadores remanescentes](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste/revisor: **pendente**
- [ ] **13.7** — Publicação e upload rápido de Leis municipais via dispositivo móvel. *(edital, p. 46)*  
  Situação: `B` · Evidência/rota: [bloqueadores remanescentes](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste/revisor: **pendente**
- [ ] **13.8** — Publicação rápida de Decretos municipais pelo smartphone/tablet. *(edital, p. 46)*  
  Situação: `B` · Evidência/rota: [bloqueadores remanescentes](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste/revisor: **pendente**

### M14 — IA/ATRICON (4 requisitos; S5)

- [ ] **14.1** — Mecanismo interno de varredura automatizada com IA para detecção de pendências fiscais de transparência. *(edital, p. 46)*  
  Situação: `B` · Evidência/rota: [bloqueadores remanescentes](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste/revisor: **pendente**
- [ ] **14.2** — Aferição e simulação em tempo real da aderência do portal aos 88 pontos de avaliação de transparência da ATRICON. *(edital, p. 46)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**
- [ ] **14.3** — Apresentação automática de Anexo Técnico com a solução descrita e o caminho técnico da solução para adequação. *(edital, p. 46)*  
  Situação: `B` · Evidência/rota: [bloqueadores remanescentes](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste/revisor: **pendente**
- [ ] **14.4** — Apresentação de relatório indicando o status (Se Atende, Se Não Atende, ou Se é Portal de Terceiro) para cada um dos 88 pontos avaliados. *(edital, p. 46)*  
  Situação: `P` · Evidência/rota: [provas técnicas e ensaio parcial](05_STATUS_VALIDACAO_SPRINT5.md) · PR/teste: #3 / CI 40045034592 · Revisor independente: **pendente**

### M15 — Carta de Serviços (15 requisitos; S1/S5)

- [ ] **15.1** — Banco de dados da Carta de Serviços hospedado integralmente em servidor em nuvem. *(edital, p. 46)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **15.2** — Interface administrativa baseada em janelas (Padrão Windows) amigável para o gestor municipal. *(edital, p. 46)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **15.3** — Atualização automática de versão online executada de forma remota no login. *(edital, p. 47)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **15.4** — Instalação, parametrização e uso direto do sistema via navegador de internet. *(edital, p. 47)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **15.5** — Gravação de todos os arquivos, formulários e anexos gerados pelo sistema diretamente no banco de dados para segurança. *(edital, p. 47)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **15.6** — Atualização, aprimoramento tecnológico e adequações legais contínuas fornecidas sem custo adicional. *(edital, p. 47)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **15.7** — Cadastro estruturado de Serviços municipais com descrição, público-alvo, requisitos e etapas. *(edital, p. 47)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **15.8** — Cadastro e associação de links úteis para acesso online direto ao serviço. *(edital, p. 47)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **15.9** — Cadastro e vinculação de Tags de pesquisa para facilitar a indexação e busca pelo usuário. *(edital, p. 47)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **15.10** — Vinculação do perfil e setor de atendimento responsável pelo respectivo serviço. *(edital, p. 47)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **15.11** — Permitir avaliação técnica continuada do Ouvidor Geral do município sobre os cadastros de serviços. *(edital, p. 47)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **15.12** — Relatórios estatísticos de visualizações, solicitações e satisfação sobre a carta de serviços. *(edital, p. 47)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **15.13** — Relatório dinâmico com modelo em branco padrão de cadastro técnico de serviço municipal. *(edital, p. 48)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **15.14** — Geração automática de relatórios de críticas, alertas e pendências cadastrais na Carta de Serviços. *(edital, p. 48)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**
- [ ] **15.15** — Geração e elaboração de página web dedicada integrada ao site oficial exibindo a carta de serviços aos cidadãos. *(edital, p. 48)*  
  Situação: `NV` · Evidência/rota: **a preencher** · PR/teste/revisor: **a preencher**

### M16 — Webmail institucional SaaS (23 requisitos; S0 (decisão)/S5 (execução))

- [ ] **16.1** — Plataforma hospedada em nuvem, dispensando servidores locais ou infraestrutura física municipal. *(edital, p. 48)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.2** — Acesso completo ao webmail via navegador web (Google Chrome, Firefox, Safari, Edge). *(edital, p. 48)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.3** — Criação, edição, ativação, desativação e exclusão lógica de caixas de e-mail institucional. *(edital, p. 48)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.4** — Capacidade técnica para configuração e operação de até 60 contas de e-mail oficiais. *(edital, p. 48)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.5** — Suporte estrito a domínios de internet personalizados municipais (Exemplo: usuario@nomedoorgao.gov.br). *(edital, p. 48)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.6** — Envio e recebimento de mensagens de correio eletrônico em tempo real. *(edital, p. 49)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.7** — Organização estruturada de mensagens através de pastas personalizadas pelo usuário. *(edital, p. 49)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.8** — Presença obrigatória de pastas padrão: Caixa de Entrada, Itens Enviados, Rascunhos, Spam e Lixeira. *(edital, p. 49)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.9** — Funcionalidade de recuperação segura de senha com interface administrativa. *(edital, p. 49)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.10** — Gestão e cadastro de múltiplos usuários com perfil de Administradores Gerais. *(edital, p. 49)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.11** — Controle e agrupamento de contas de e-mail por secretaria, setor, conselho municipal ou departamento. *(edital, p. 49)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.12** — Envio, recebimento e armazenamento de arquivos anexos associados às mensagens de e-mail. *(edital, p. 49)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.13** — Filtros básicos integrados contra mensagens de e-mail indesejadas (Spam). *(edital, p. 49)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.14** — Autenticação e segurança de acesso reforçada por login individual e senha criptografada. *(edital, p. 49)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.15** — Painel administrativo dedicado, de uso exclusivo do gestor indicado pelo município. *(edital, p. 49)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.16** — Compatibilidade nativa e responsividade de visualização em dispositivos móveis (Android e iOS). *(edital, p. 50)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.17** — Registro, histórico de auditoria e manutenção ativa de contas da entidade. *(edital, p. 50)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.18** — Prestação de suporte técnico especializado para criação de contas, redefinição de senhas e domínio. *(edital, p. 50)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.19** — Disponibilização de orientação e treinamento inicial para os administradores do painel SaaS do Webmail. *(edital, p. 50)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.20** — Painel Administrativo: permitir cadastrar novas contas, alterar dados, bloquear/desbloquear e redefinir senhas em tempo de sessão. *(edital, p. 50)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.21** — Painel Administrativo: consultar contas ativas/inativas e organizá-las por órgão, secretaria ou setor. *(edital, p. 50)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.22** — Segurança: ambiente criptografado SSL/TLS para tráfego e proteção contra acessos não autorizados. *(edital, p. 50)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**
- [ ] **16.23** — Conformidade e conformação tecnológica estrita com os princípios da Lei Geral de Proteção de Dados (LGPD). *(edital, p. 50)*  
  Situação: `B` · Dependência: responsável externo pelo Webmail · Evidência individual: **pendente**

## Protocolo de homologação individual

1. Reproduzir o fluxo com usuário adequado (público, editor ou administrador).
2. Exercitar criação, leitura, edição, publicação, exclusão/bloqueio e permissões **quando exigidos**.
3. Capturar comprovação objetiva: gravação curta, captura de tela e/ou saída exportada; identificar dados de ensaio.
4. Anotar ID do requisito, resultado, rota, commit/PR, dados utilizados, revisor e ressalvas.
5. Não usar placeholder, resultado de referência como produção ou simples tela estática como comprovação operacional.
6. Reexecutar após merge de correções e congelar a versão antes da referência.

## Critérios de encerramento

- [ ] 168/168 requisitos obrigatórios demonstrados com evidências identificadas e revisadas.
- [ ] Todos os 16 módulos executados na ordem do Anexo I e sem customização durante a sessão.
- [ ] Ambiente operacional, credenciais de administrador de referência, conexão e equipamentos testados.
- [ ] Webmail de até 60 contas efetivamente demonstrado, inclusive envio/recebimento real em domínio permitido.
- [ ] Dados e arquivos autorizados; trilhas de auditoria e política de acesso verificadas.
- [ ] Roteiro presencial ensaiado e plano de contingência documentado.
- [ ] Status oficial do certame e convocação confirmados antes da viagem.
