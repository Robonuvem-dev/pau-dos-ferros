# Planejamento — Portal Oficial e Portal da Transparência de Pau dos Ferros/RN

10 sprints para chegar à Prova de Conceito (PoC) com todo o código pronto e cada item do roteiro de avaliação funcionando.

## Premissas

- **Base:** o Termo de Referência e o Roteiro e Matriz de Avaliação da PoC (Anexo do edital, módulos 1 a 16). A PoC é presencial, feita pela Comissão Municipal de Proteção de Dados (CMPD), com acesso de administrador e dados fictícios. Os itens são demonstrados na ordem do Anexo, e é proibido criar ou ajustar qualquer coisa durante a sessão (item 3.8). Por isso, todo item precisa estar pronto e com dados de demonstração antes dela.
- **Webmail (Módulo 16):** fica fora deste plano, como você pediu. Será integrado depois.
- **Dados:** todos os cadastros terão dados fictícios realistas de Pau dos Ferros: secretarias, servidores, licitações, obras, veículos, conselhos, receitas e despesas de 2025 e 2026.
- **Ponto de partida:** já existem o visual institucional, o cabeçalho e o rodapé, a página inicial, notícias, Prefeitura, secretarias, serviços, galeria, Portal da Transparência com as consultas, e-SIC/Ouvidoria, LGPD, pesquisa, mapa do site e acessibilidade. Por trás, já existem os cadastros principais, o registro de auditoria, os 88 pontos da ATRICON, os credores, a contagem de visualizações das notícias e as estatísticas do e-SIC. **A prévia hoje está com erro:** faltam as páginas de entrada, conta e painel.
- **Duração sugerida:** sprints de 1 semana. Cada uma termina com uma demonstração dos itens do edital concluídos nela.
- **Definição de pronto de cada HU:** funciona no painel e na página pública; tem dados fictícios; alterações ficam na auditoria; funciona no celular; e o item correspondente do roteiro da PoC está marcado como "demonstrável" na matriz de rastreabilidade (Sprint 10).

---

## Sprint 1 — Fundação estável, acesso e painel administrativo
Objetivo: a prévia volta a abrir sem erros. Entrada, perfis, painel em janelas e a base de cadastros genéricos ficam prontos. Atende o Módulo 1.

**HU 1.1 — Como gestor, quero entrar no sistema com e-mail e senha ou com Google.**
- Tela de entrada com três abas: Entrar, Criar conta e Esqueci a senha.
- Página para definir nova senha a partir do link enviado por e-mail.
- Botão "Entrar com Google".
- Bloqueio da área restrita para quem não entrou, com volta automática à entrada.
- Botão do cabeçalho reflete a sessão: "Área restrita", "Minha conta" ou "Painel", além de "Sair".

**HU 1.2 — Como usuário, quero gerenciar meu perfil.**
- Tela "Minha conta" com nome, foto (envio de imagem) e preferências (alto contraste e fonte maior como padrão).
- Troca de senha.

**HU 1.3 — Como administrador, quero controlar quem acessa o painel e com que nível de permissão.**
- Tela de usuários: lista, perfis "Administrador" e "Editor", conceder e remover.
- Proteção contra o administrador retirar o próprio acesso.
- Perfis por módulo: um editor pode ter acesso apenas a Licitações, Obras etc. Exige uma tabela de permissões por módulo.
- Liberar o primeiro administrador (sua conta) depois do cadastro.

**HU 1.4 — Como gestor, quero um painel com janelas no padrão Windows (TR 1.1 e 15.2).**
- Painel com menu lateral agrupado por módulo do edital.
- Cadastros abertos em janelas (diálogos) com título, botões de salvar e fechar, e atalho de teclado (Esc).
- Painel inicial com indicadores, atalhos e últimos registros.
- Tela genérica de cadastro (listar, pesquisar, incluir, editar, excluir, enviar PDF/JPG), movida pela configuração central dos módulos.

**HU 1.5 — Como gestor, quero que o sistema atualize sozinho, sem instalação local (TR 1.2, 1.3, 1.4, 15.3, 15.4).**
- Aviso "Nova versão disponível — atualizando" ao entrar, comparando a versão publicada com a carregada no navegador. A tela recarrega sozinha.
- Página "Sobre o sistema" com versão, data da última atualização, banco em nuvem e conexão segura (cadeado HTTPS).
- Registro de versões, como um changelog público no painel (evidência do TR 1.5 e 15.6).

**HU 1.6 — Como auditor, quero o histórico de tudo que cada usuário fez.**
- Tela de auditoria com filtros por usuário, módulo, ação e período, mais exportação para planilha.
- Registro também de entradas e saídas do sistema.

**HU 1.7 — Pedidos de melhoria (TR 1.5).**
- Tela "Solicitar aprimoramento" no painel: o gestor descreve a demanda, que é registrada com número e situação (aberta, em análise, entregue).

---

## Sprint 2 — Site oficial: conteúdo e aparência (Módulo 2)

**HU 2.1 — Notícias com mídias (2.1, 2.3, 2.4, 2.8).**
- Editor de notícia com capa, galeria de fotos, vídeo do YouTube, áudio, tags e categoria.
- Agendamento de publicação e rascunho.
- Publicação combinada: uma notícia pode ter um evento (data, local), fotos e vídeos vinculados.
- Contagem de visualizações por notícia, já iniciada.

**HU 2.2 — Galeria por álbuns (2.2).**
- Álbum com várias fotos enviadas de uma vez, legenda por foto e ordenação.
- Página pública do álbum com visualização ampliada.

**HU 2.3 — Vídeos e áudios (2.3, 2.4).**
- Cadastro de vídeos e áudios avulsos e vinculados a notícias, com player na página.

**HU 2.4 — Agentes políticos (2.5).**
- Cadastro com foto, cargo (Prefeito, Vice, Secretários), mandato, biografia e contatos.
- Página pública em "A Prefeitura".

**HU 2.5 — Facebook no site (2.6).**
- Configuração do endereço da página oficial do Facebook.
- Quadro da página do Facebook exibido na página inicial.

**HU 2.6 — Temas e cores em tempo real (2.7).**
- Tela "Aparência do site": cor principal, cor de destaque, logotipo e imagem de fundo.
- Três temas prontos (Institucional Azul, Alto Contraste, Datas Comemorativas).
- A mudança aparece na hora para todos os visitantes.

**HU 2.7 — Links úteis e atalhos na capa (2.9).**
- Cadastro de links externos com ícone e ordem, exibidos na página inicial.

**HU 2.8 — Banners rotativos (2.10).**
- Carrossel automático na capa, com ordem, período de exibição e link.

**HU 2.9 — Documentos digitais JPG/PDF (2.11, 5.14).**
- Biblioteca "Documentos" para qualquer tipo de documento.
- Tipos configuráveis, visualização do PDF na própria página e pesquisa.

**HU 2.10 — Concursos e processos seletivos (2.12, 5.11, 5.13).**
- Tela dedicada com etapas (edital, inscrições, resultados, convocações) e anexos.
- Página pública com situação do concurso.

**HU 2.11 — Unidades gestoras e executoras (2.13).**
- Cadastro de unidades com código, CNPJ, responsável e vínculo à secretaria.

**HU 2.12 — Relatório de críticas e pendências do site (2.14).**
- Verificações automáticas: notícias sem capa, banners vencidos, agentes sem foto, secretarias sem horário, documentos sem arquivo.
- Tela no painel com a lista, a gravidade e um link para corrigir.

---

## Sprint 3 — Licitações, contratos e aditivos (Módulo 3)

**HU 3.1 — Licitações completas (3.1, 3.8, 3.15).**
- Cadastro com modalidade (Lei 14.133), número, objeto, valor e secretaria.
- Anexos em PDF (edital, termo de referência, atas, resultado).
- Fases e cronograma (andamentos com data e descrição).
- Página pública de detalhe da licitação com linha do tempo.

**HU 3.2 — Dispensa e inexigibilidade (3.2, 3.3).**
- Campos de fundamentação legal (artigo e inciso da Lei 14.133) e justificativa obrigatória.

**HU 3.3 — Atas de Registro de Preços e adesões "carona" (3.4).**
- Cadastro de atas com itens, fornecedor, vigência e saldo.
- Registro de adesões de outros órgãos.

**HU 3.4 — Empresas inidôneas (3.5).**
- Já existe. Falta adicionar o órgão sancionador, a consulta pública e um alerta quando um credor inidôneo aparecer em contrato novo.

**HU 3.5 — Contratos e termos aditivos (3.6, 3.7).**
- Contrato vinculado à licitação e ao credor.
- Aditivos como registros "filhos" do contrato: prazo, acréscimo, supressão e reequilíbrio, com o valor atualizado calculado sozinho.

**HU 3.6 — Credores com histórico (3.9).**
- Ficha do credor com todos os contratos, empenhos e pagamentos ligados a ele.

**HU 3.7 — Equipes e comissões (3.10, 3.11).**
- Cadastro de membros (agente de contratação, pregoeiro, equipe de apoio, fiscal).
- Comissões permanentes ou especiais, com portaria de designação.

**HU 3.8 — Parcerias e termos de fomento com OSC (3.12, 3.13).**
- Cadastros com entidade, objeto, valor, vigência e plano de trabalho anexado.

**HU 3.9 — Relatórios do módulo (3.14, 3.16, 3.17, 3.18).**
- Boletim do dia (tudo publicado na data), avisos e relatório de publicações, todos em versão para impressão e PDF.
- Mapa de licitações com filtros avançados (ano, modalidade, situação, secretaria, faixa de valor).
- Contratos a vencer em 30, 60 e 90 dias.
- Críticas e pendências: licitação sem edital anexado, homologada sem contrato, dispensa sem fundamentação, contrato vencido sem aditivo.

---

## Sprint 4 — Convênios e documentos legais (Módulos 4 e 5)

**HU 4.1 — Convênios completos (4.1, 4.3, 4.4, 4.5).**
- Cadastros separados de concedente e convenente, com responsáveis.
- Tipos e categorias de convênio.
- Campos obrigatórios do edital: convenente, responsável pelo convenente, número, valor das parcelas, concedente, responsável pelo concedente e valor global.

**HU 4.2 — Detalhamento do convênio (4.7, 4.8, 4.9, 4.10).**
- Metas e especificações técnicas.
- Plano de aplicação (natureza da despesa, valor de cada parte).
- Parcelas de desembolso com cronograma e situação (prevista, recebida).
- Obrigações do concedente.

**HU 4.3 — Contratos vinculados (4.2, 4.11).**
- Vincular vários contratos a um convênio.
- O total contratado e o saldo aparecem automaticamente.

**HU 4.4 — Painel público e relatórios (4.6, 4.12, 4.13, 5.6).**
- Página pública de convênios com detalhe e gráfico de execução.
- Relatório de convênios vigentes.
- Críticas e pendências: parcela atrasada, convênio vencido, sem plano de aplicação.
- Painel público em tempo real de licitações e convênios na capa da Transparência.

**HU 4.5 — Leis e atos normativos (5.4, 5.8, 5.9, 5.10, 5.12, 5.15).**
- Leis, decretos, portarias e resoluções de conselhos com número, ano, ementa, palavras-chave, situação (vigente, revogada) e vínculo "altera/revoga".
- Busca avançada por número, ano, ementa e palavras-chave.
- Página da LRF municipal consolidada.

**HU 4.6 — Diárias (5.16).**
- Cadastro de diárias com beneficiário, cargo, destino, período, quantidade, valor e justificativa obrigatória.
- Tabela de valores de diárias.

**HU 4.7 — Seção "O Município" (5.7).**
- Cadastros de História, A Cidade, Praças, Sítios turísticos, Postos de saúde, Distritos, Escolas, Prédios públicos e Eventos, com foto, endereço e mapa.
- Páginas públicas em "O Município".

---

## Sprint 5 — Transparência fiscal LC 131 e integração contábil (Módulos 5, 7 e 8)

**HU 5.1 — Receitas e despesas orçamentárias e extraorçamentárias (5.2, 8.1–8.4).**
- Receitas separadas em orçamentária e extraorçamentária, com classificação (categoria, origem, espécie), previsto e arrecadado.
- Despesas separadas em orçamentária e extraorçamentária, com órgão, unidade, função, programa, ação e elemento.

**HU 5.2 — Empenho, liquidação e pagamento (8.5, 8.6, 8.7).**
- Cadastros encadeados: o empenho tem credor e valor; a liquidação aponta para o empenho; o pagamento aponta para a liquidação e traz a ordem bancária.
- Página pública com o detalhe de cada empenho e a sua trilha completa.

**HU 5.3 — Relatório comparativo em tempo real (8.8).**
- Painel empenhado × liquidado × pago por órgão, por mês e por credor, com gráficos, filtros e exportação.

**HU 5.4 — Integração com sistema contábil de terceiros (7.1, 8.9).**
- Leiaute próprio documentado (planilha CSV e JSON) para receitas, despesas, empenhos, liquidações e pagamentos.
- Tela de importação com conferência prévia, linhas com erro destacadas, desfazer importação e histórico de importações.
- Endereço de integração automática protegido por chave: o sistema contábil envia os dados sozinho.
- Página pública "Leiaute de integração" com as instruções.

**HU 5.5 — Medicamentos (8.10).**
- Cadastro de itens de medicamento com descrição, unidade de compra, unidade de estoque, grupo, subgrupo, categoria e subcategoria.
- Consulta pública.

**HU 5.6 — Relatórios fiscais (RREO e RGF).**
- Publicação por bimestre e quadrimestre, com aviso de prazo vencido.

---

## Sprint 6 — Pessoal, folha, TCE e COVID-19 (Módulos 6, 7 e 9)

**HU 6.1 — Importação de folha de vários sistemas (7.2, 9.1, 9.2).**
- Leiaute próprio da folha (servidor, cargo, vínculo, secretaria, competência, proventos e descontos por rubrica).
- Identificação do sistema de origem em cada importação.
- Integração automática por chave, como na contabilidade.

**HU 6.2 — Consultas de pessoal (9.3–9.7).**
- Visões agrupadas por cargo, por secretaria e por vínculo (efetivo, comissionado, temporário, estagiário).
- Quadro geral com totais.
- Ficha individual do servidor com subsídio, vantagens e descontos por competência, conforme a LAI.

**HU 6.3 — Importação do TCE (7.3).**
- Importação de agentes públicos e credores a partir dos arquivos do TCE-RN, em CSV ou planilha, com reconhecimento automático das colunas.
- Evita duplicar por CPF/CNPJ e registra a origem "TCE".

**HU 6.4 — Página COVID-19 (6.1–6.8).**
- Marca "Ação de emergência" em diárias, contratos, portarias, leis/decretos, receitas, despesas e servidores.
- Cadastro do boletim epidemiológico diário (casos, recuperados, óbitos, vacinados).
- Página única com todas as ações, os gráficos e as listas.

---

## Sprint 7 — Obras, plano diretor, frota e conselhos (Módulos 10, 11 e 12)

**HU 7.1 — Processos de engenharia e obras (10.1, 10.2, 10.10).**
- Processo de engenharia com data, valor do contrato inicial, contrato vinculado e fonte de recurso.
- Obra com todos os campos obrigatórios do edital: datas de início, fim e previsão; descrição; valor global; aditivos de acréscimo e de supressão; origem do recurso; número do processo; tipo guarda-chuva; secretaria executora; endereço com mapa; objeto e justificativa.
- Vários processos ao mesmo tempo por obra.

**HU 7.2 — Execução da obra (10.3–10.7, 10.11).**
- Andamento físico-financeiro em linha do tempo (% físico, % financeiro, data).
- Credores responsáveis pela execução.
- Contratos e aditivos puxados sozinhos do módulo de licitações, sem redigitar.
- Medições aprovadas e ARTs dos engenheiros.
- Fotos datadas para o acompanhamento visual.

**HU 7.3 — Página pública e relatórios de obras (10.8, 10.9, 10.12).**
- Gráficos e números (obras por situação, investimento por secretaria, mapa das obras).
- Relatório gerencial de situação.
- Críticas: obra parada, sem medição há 60 dias, sem ART, prazo vencido.

**HU 7.4 — Plano Diretor (10.13).**
- Fases, equipe, eixos de atuação e ações estratégicas, com página pública.

**HU 7.5 — Frota municipal (11.1–11.4).**
- Cadastro com todos os campos obrigatórios: placa, ano de fabricação, Renavam, modelo, entrada e saída/baixa, tipo, situação de uso, secretaria, indicador de máquina de obra e finalidade.
- Foto do veículo.
- Controle de seguro, IPVA e manutenção, com alertas de vencimento.
- Busca pública por modelo/marca, secretaria ou placa.

**HU 7.6 — Conselhos municipais (12.1–12.6).**
- Cadastro do conselho com criação, descrição, ato/lei, vigência e competências.
- Membros (titular, suplente, sociedade civil ou governo) com mandato.
- Histórico de atas, reuniões, palestras e pautas.
- Documentos próprios de cada conselho.
- Página própria e personalizável de cada conselho (texto, cor de destaque, imagem).
- Críticas: mandato vencido, conselho sem reunião há 90 dias, sem ata.

---

## Sprint 8 — Carta de Serviços, e-SIC e Ouvidoria completos (Módulos 5 e 15)

**HU 8.1 — Carta de Serviços estruturada (15.1, 15.5, 15.7–15.10, 15.15).**
- Serviço com descrição, público-alvo, requisitos, etapas ordenadas, prazo, custo, link online e tags.
- Setor e perfil responsável pelo atendimento.
- Anexos e formulários guardados no próprio banco de dados (exigência 15.5).
- Página pública com busca por tags.

**HU 8.2 — Avaliação do Ouvidor e satisfação (15.11, 15.12).**
- Tela do Ouvidor Geral para dar parecer técnico sobre cada serviço (aprovado ou com ajustes), com histórico.
- Avaliação do cidadão ("Este serviço foi útil?", nota de 1 a 5).
- Estatísticas de visualizações, solicitações e satisfação.

**HU 8.3 — Modelo em branco e pendências (15.13, 15.14).**
- Relatório "ficha técnica de serviço em branco" para impressão.
- Críticas: serviço sem etapas, sem setor responsável, sem link ou sem parecer do Ouvidor.

**HU 8.4 — e-SIC com prazos (5.1, 5.3).**
- Prazo de 20 dias com prorrogação de mais 10 e contagem regressiva.
- Situações: recebido, em análise, prorrogado, respondido, recurso.
- Encaminhamento a outra secretaria.
- Resposta com anexo.
- Recurso de 1ª e 2ª instância.
- Aviso por e-mail ao cidadão quando a resposta sair.

**HU 8.5 — Ouvidoria integrada (5.5).**
- Tipos de manifestação, anonimato, prazo de 30 dias (Lei 13.460), encaminhamento e resposta.
- Relatório anual da ouvidoria.

**HU 8.6 — Críticas do portal público (5.17).**
- Relatório consolidado de pendências de todos os módulos numa só tela.

---

## Sprint 9 — Gestão pelo celular e Inteligência Artificial ATRICON (Módulos 13 e 14)

**HU 9.1 — Aplicativo de gestão (13.1–13.8).**
- Versão instalável do painel, que vira um ícone na tela do celular e abre como aplicativo, com:
  - notícias publicadas (13.1);
  - cadastrar e editar notícia com foto da câmera (13.2, 13.3);
  - estatísticas de acesso ao vivo (13.4);
  - cadastrar editais e seletivos (13.5);
  - publicar RREO/RGF (13.6), leis (13.7) e decretos (13.8) com envio rápido de PDF.
- Empacotamento do mesmo aplicativo para Android e iOS, para distribuição pelas lojas ou por instalação direta. Depende das contas de desenvolvedor da Prefeitura ou da empresa.

**HU 9.2 — Varredura com IA de pendências fiscais (14.1).**
- Varredura que cruza todos os módulos (RREO/RGF em atraso, receitas e despesas desatualizadas, e-SIC fora do prazo, LOA/LDO ausentes, contratos sem publicação).
- Resumo e priorização feitos pela IA.

**HU 9.3 — Os 88 pontos da ATRICON (14.2, 14.4).**
- Checklist dos 88 pontos com a situação de cada um (Atende, Não atende ou Portal de terceiro), calculada na hora a partir dos dados.
- Ajuste manual com justificativa e link de comprovação.
- Percentual de aderência por dimensão e geral.
- Simulação: "se eu publicar X, minha nota sobe para Y".
- Relatório imprimível.

**HU 9.4 — Anexo Técnico automático (14.3).**
- A IA gera o Anexo Técnico com a solução e o caminho técnico para cada ponto pendente, além de um cronograma de 30/60/90 dias.
- Salvo no histórico, com versão para impressão e PDF.

---

## Sprint 10 — Dados de demonstração, qualidade, segurança e ensaio da PoC

**HU 10.1 — Carga completa de dados fictícios.**
- Dados de demonstração em todos os módulos, com volume realista: 12 meses de receitas e despesas, 150 servidores, 30 licitações, 15 obras, 40 veículos, 8 conselhos, 25 serviços, 20 notícias, 10 álbuns e 50 pedidos do e-SIC.
- Arquivos-modelo de importação (contábil, folha, TCE) prontos para demonstrar ao vivo.

**HU 10.2 — Matriz de rastreabilidade da PoC.**
- Tela no painel listando cada item do roteiro (1.1 a 15.15), com onde demonstrar (link direto), o que mostrar e a situação.
- Versão para impressão no formato da ficha da CMPD (Funcionalidade, Demonstrado por, Evidência, Observação).

**HU 10.3 — Segurança e LGPD.**
- Revisão de todas as regras de acesso aos dados.
- Varredura de segurança do sistema.
- Bloqueio de senhas vazadas.
- Tempo de sessão.
- Política de privacidade revisada.
- Registro de consentimento.

**HU 10.4 — Qualidade e acessibilidade.**
- Testes automáticos das regras principais (prazos do e-SIC, cálculo de aditivos, situação ATRICON, importações).
- Revisão de acessibilidade (contraste, teclado, leitor de tela, VLibras).
- Teste em celular, tablet e computador.
- Desempenho da página inicial.

**HU 10.5 — Ensaio geral da PoC.**
- Roteiro passo a passo na ordem do Anexo, com usuário e senha de administrador para a comissão.
- Ensaio cronometrado.
- Correção do que falhar.
- Publicação final e congelamento da versão.

---

## Detalhes técnicos

- **Estrutura existente mantida:**
  - configuração central dos módulos, que alimenta as consultas públicas e o cadastro genérico do painel;
  - leituras públicas por funções de servidor com chave pública;
  - escrita protegida por regras de acesso no banco;
  - auditoria por gatilhos em todas as tabelas.
- **Correção inicial (Sprint 1):**
  - criar as rotas de entrada, redefinição de senha, área autenticada, conta e painel;
  - corrigir os erros de tipo em CrudModule, esic, busca e atricon;
  - aceitar o tipo de registro com campos opcionais.
- **Tabelas novas previstas:**
  - permissões por módulo, configurações do site (tema, Facebook), links úteis, documentos e tipos, concursos e etapas, unidades gestoras;
  - andamentos de licitação, anexos de licitação, atas de registro de preço e adesões, aditivos, membros e comissões, parcerias e fomento;
  - concedentes, convenentes, tipos de convênio, metas, plano de aplicação, parcelas, obrigações, vínculo convênio–contrato;
  - itens do Município, empenhos, liquidações, pagamentos, medicamentos, rubricas da folha e lançamentos por servidor, importações (histórico e desfazer), boletim epidemiológico;
  - processos de engenharia, andamentos, medições, ARTs, fotos datadas, plano diretor (fases, equipe, eixos, ações);
  - seguros e manutenções da frota, membros e ações de conselhos;
  - etapas de serviços, pareceres do Ouvidor, avaliações de serviços, prazos e tramitação do e-SIC, anexos guardados no banco (15.5), anexos técnicos ATRICON salvos, pedidos de aprimoramento, versões do sistema.
- **Vínculos:** o cadastro genérico ganha o tipo "relacionamento" (escolher o contrato, o credor, o convênio) e telas de detalhe com abas para os registros filhos (aditivos, parcelas, medições).
- **Críticas e pendências (2.14, 3.18, 4.13, 5.17, 10.12, 11.3, 12.4, 15.14):** um único motor de regras por módulo, mostrado numa tela de pendências e alimentando a varredura da IA.
- **Integrações (7.1, 7.2, 8.9, 9.1, 9.2):** rotas públicas de recebimento com chave por sistema de origem, validadas no servidor; mais importação manual por CSV/JSON com conferência prévia.
- **Atualização remota (1.2, 15.3):** número de versão gerado na publicação, conferido ao entrar, com recarga automática.
- **Aplicativo (Módulo 13):** painel instalável no celular e empacotamento nativo Android/iOS do mesmo código. A publicação nas lojas depende das contas de desenvolvedor.
- **IA (Módulo 14):** Lovable AI no servidor, com mensagens claras quando faltar crédito ou houver limite de uso.
- **Fora do escopo:** Módulo 16 (Webmail), deixado para depois por decisão do cliente.
