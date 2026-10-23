# Novo plano de sprints — entrega completa do edital (sem Webmail)

Base: matriz oficial do Anexo I (itens 1.1 a 15.15), o checklist de 168 itens em `docs/poc` e o que já existe. O Módulo 16 (Webmail, 23 itens) fica fora, porque já existe em outro repositório. **Total no escopo: 145 itens, em 15 módulos.**

## Regras para todas as sprints

- Um item só conta como "Atende" quando funciona de ponta a ponta: cadastro no painel → publicação → consulta pública → filtro → relatório ou exportação. Ter só a tabela ou a tela não basta.
- Do repositório Guarama vêm apenas regras e validações, adaptadas para este sistema. Nada é copiado inteiro.
- Cada item tem dados fictícios marcados como tais, registro na auditoria, funciona no celular e tem um teste automático das regras de prazo, valor e situação.
- Ao fim de cada sprint, os itens dela são marcados no checklist com a evidência: link, passo a passo e resultado.
- Nada de recursos simulados: o aplicativo e as integrações precisam funcionar de verdade.

## Ponto de partida (Sprint 1 concluída)

Já existem: entrada no sistema, perfis e permissões por módulo, painel em janelas, cadastro genérico, auditoria com filtros e registro de entradas e saídas, aviso de nova versão, "Sobre o sistema", pedidos de melhoria, site oficial básico, Transparência com consultas, e-SIC/Ouvidoria, LGPD e o checklist ATRICON (com o falso positivo ainda por corrigir). **Nenhum item foi homologado ainda.**

---

## Sprint 2 — Auditoria do que existe e fechamento do M01 (5 itens)
- Percorrer os 145 itens e classificar cada um como demonstrável, parcial, faltante ou bloqueado.
- Liberar a conta de administrador da PoC e criar as contas de teste de editor e de cidadão.
- Fechar o M01 (1.1 a 1.5) com evidências: janelas, atualização remota, nuvem, HTTPS e aprimoramentos.
- Criar o vínculo entre cadastros (escolher contrato, credor, convênio) e as telas de detalhe com abas para registros filhos. As Sprints 3 a 8 dependem disso.
- Criar o motor único de "críticas e pendências", que será usado por todos os módulos.

## Sprint 3 — Site oficial M02 (14 itens) e Carta de Serviços M15 (15 itens)
- **M02:** notícias com capa, galeria, vídeo, áudio e agendamento; álbuns; agentes políticos; quadro do Facebook; temas e cores em tempo real; links úteis; banners rotativos; documentos em JPG/PDF; concursos com etapas; unidades gestoras; críticas do site.
- **M15:** serviço com etapas, setor, perfil, tags e anexos guardados no banco; parecer do Ouvidor Geral; avaliação de satisfação; estatísticas; ficha em branco para impressão; críticas.

## Sprint 4 — Licitações, contratos e aditivos M03 (18 itens)
- Integrar as regras de fases da licitação e do ciclo do contrato vindas do Guarama.
- Modalidades da Lei 14.133, dispensa e inexigibilidade com fundamentação legal, anexos e linha do tempo.
- Atas de registro de preços, adesões ("carona"), empresas inidôneas com alerta, contratos e aditivos com valor recalculado sozinho.
- Ficha do credor, equipes e comissões, parcerias e fomento com OSC.
- Boletim do dia, mapa de licitações, contratos a vencer e críticas.

## Sprint 5 — Convênios M04 (13 itens) e Portais do Município M05 (17 itens)
- **M04:** concedente e convenente, tipos, metas, plano de aplicação, parcelas, obrigações, contratos vinculados com saldo, página pública com gráfico, relatórios e críticas.
- **M05:** e-SIC com prazo de 20+10 dias, situações, encaminhamento, recursos e aviso por e-mail; ouvidoria (Lei 13.460); leis e atos com busca avançada e a relação "altera/revoga"; LRF; diárias com tabela de valores; páginas de "O Município"; painel ao vivo; críticas do portal.

## Sprint 6 — Transparência fiscal LC 131 M08 (10 itens) e Integrações M07 (3 itens)
- Receitas e despesas, orçamentárias e extraorçamentárias.
- Empenho → liquidação → pagamento encadeados, com a trilha pública de cada um.
- Comparativo empenhado × liquidado × pago em tempo real, com gráficos e exportação.
- Medicamentos.
- Leiaute contábil documentado em CSV/JSON, importação com conferência prévia e opção de desfazer, endereço de integração automática protegido por chave e página pública do leiaute.
- **Bloqueio a resolver:** amostras reais ou autorizadas dos arquivos do TCE-RN e do sistema contábil.

## Sprint 7 — Pessoal e folha M09 (7 itens), importação TCE (M07) e COVID-19 M06 (8 itens)
- Leiaute da folha de vários sistemas, importação manual e automática.
- Consultas por cargo, secretaria e vínculo; quadro geral; ficha individual conforme a LAI.
- Importação de agentes e credores do TCE com reconhecimento de colunas e sem duplicar CPF/CNPJ.
- COVID: marca "emergência" nos cadastros, boletim epidemiológico e página única com gráficos.

## Sprint 8 — Obras M10 (13 itens), Frota M11 (4 itens) e Conselhos M12 (6 itens)
- **Obras:** processos de engenharia, todos os campos obrigatórios, físico-financeiro, contratos e aditivos puxados das licitações, medições, ARTs, fotos datadas, mapa, relatórios, críticas e Plano Diretor.
- **Frota:** todos os campos obrigatórios, foto, seguro, IPVA e manutenção com alertas, busca pública.
- **Conselhos:** membros com mandato, atas e reuniões, documentos, página personalizável, críticas.

## Sprint 9 — Aplicativo Android/iOS M13 (8 itens) e IA/ATRICON M14 (4 itens)
- **Aplicativo de gestão:** notícias, foto pela câmera, estatísticas ao vivo, editais e seletivos, RREO/RGF, leis e decretos. Instalável no celular e empacotado para Android e iOS.
- **Bloqueio a resolver:** contas de desenvolvedor da Google e da Apple, ou outro meio de instalação aceito pela comissão.
- **ATRICON:** corrigir o falso positivo; situação dos 88 pontos calculada a partir dos dados; ajuste manual com justificativa; percentual por dimensão; simulação; varredura de pendências pela IA; Anexo Técnico gerado e salvo, com versão para impressão.

## Sprint 10 — Dados de demonstração, segurança e ensaio da PoC
- Carga completa de dados fictícios: 12 meses de dados fiscais, cerca de 150 servidores, 30 licitações, 15 obras, 40 veículos, 8 conselhos, 25 serviços, 20 notícias e 50 pedidos do e-SIC. Mais os arquivos-modelo de importação.
- Matriz de rastreabilidade no painel, com cada item, um link direto e a ficha no formato da comissão (CMPD).
- Segurança e LGPD: revisão das regras de acesso, varredura de segurança, bloqueio de senhas vazadas, tempo de sessão e registro de consentimento.
- Acessibilidade (contraste, teclado, VLibras) e teste em celular, tablet e computador.
- Ensaio cronometrado de 1.1 a 15.15, feito por outro operador sem mexer no código. Resultado ATENDE ou NÃO ATENDE em cada item, correção do que falhar e congelamento da versão.
- **Regra final:** GO só com os 145 itens demonstráveis. Se faltar algum, NO-GO, com a lista do que falta.

---

## Bloqueios que não dependem de código
1. Amostras dos arquivos do TCE-RN, do sistema contábil e da folha (Sprints 6 e 7).
2. Contas de desenvolvedor Android e iOS (Sprint 9).
3. Confirmação da data de convocação da PoC.
4. Dados reais de contato do encarregado da LGPD.

## Detalhes técnicos
- Manter a configuração central dos módulos, as leituras públicas por funções de servidor, a escrita protegida por regras de acesso no banco e a auditoria por gatilhos.
- Cada sprint cria suas tabelas com permissões e regras de acesso no mesmo passo, e adiciona os módulos à configuração central.
- As integrações usam rotas públicas com chave por sistema de origem, validada no servidor.
- O aplicativo usa o mesmo código, empacotado para as lojas.
- A IA usa o Lovable AI no servidor.
- Os testes automáticos ficam em `src/test`, um por regra (prazos, aditivos, saldo de convênio, situação ATRICON, importações).
