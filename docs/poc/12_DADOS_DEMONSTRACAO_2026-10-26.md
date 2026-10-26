# População de demonstração — 26/10/2026

- Acrescentados 20 registros em cada um dos 62 cadastros/categorias abrangidos, distribuídos em 50 tabelas: 1.240 registros principais, preservando os existentes.
- Publicações receberam 20 por categoria (12 categorias; 240 linhas). Concedentes e convenentes receberam 20 de cada papel (40 linhas na tabela compartilhada).
- As demais 48 tabelas de cadastros receberam 20 linhas cada, incluindo atendimentos, solicitações, avaliações de serviços, medicamentos e pedidos de melhoria.
- Identificadores determinísticos: `md5('poc-20261026:<tabela ou cadastro>:<índice>')::uuid`; publicações incluem categoria antes do índice. Concedentes/convenentes têm namespaces separados. Operações usam conflitos para evitar duplicação.
- Vínculos completos entre secretarias, credores, licitações, contratos, convênios, parcelas, aplicações, obrigações, processos, obras, medições, ARTs, conselhos e planos diretores.
- Contratos incluem 16 instrumentos-base, dois aditivos e duas adesões a atas; gatilhos recalcularam os valores dos instrumentos-base.
- CNPJs dos credores têm dígitos verificadores calculados; não foram consultados cadastros de pessoas ou empresas reais. Contatos usam domínio reservado `example.org`. Os números não comprovam inscrição real.
- Fotos usam imagem municipal ilustrativa já existente; álbuns e fotos de obras indicam essa condição. Vídeos são panoramas ilustrativos locais, não gravações de acontecimentos inventados.
- Vinte PDFs locais contêm objeto, referência, cronograma e aviso de simulação sem validade oficial. URLs: `/demonstracao/dossie-01.pdf` a `dossie-20.pdf`.
- Preservados usuários, perfis, papéis, permissões, configurações do site e avaliações/relatórios ATRICON. Não se inventaram evidências de conformidade nem relatórios de IA. Arquivos binários privados e documentos gerados continuam sendo produzidos pelos fluxos próprios, não por registros falsos. Auditoria e publicações de licitação foram geradas pelos gatilhos reais das inserções.
- Os pedidos de melhoria vinculados ao administrador declaram explicitamente que são cenários de demonstração solicitados para o teste, não pedidos enviados por ele.

## Verificação

- Consultas de leitura confirmaram 20 linhas novas em todos os cadastros e em cada categoria de publicação.
- Navegação autenticada confirmou Isabela Moreira Campos no cadastro de servidores.
- Consulta pública confirmou CT-731/2026 com fornecedor e licitação vinculados.
- Notícia `veredas-acao-comunitaria-1-2026` exibiu conteúdo e imagem carregada.
- PDF respondeu com assinatura `%PDF-`; vídeo respondeu 200. Nenhum erro de execução nas páginas verificadas.
- Capturas locais: `/tmp/browser/seed-data/admin-servidores.png` e `public-contract.png`.
- Esta população não altera classificações do checklist e não certifica homologação, implantação ou validade dos documentos.