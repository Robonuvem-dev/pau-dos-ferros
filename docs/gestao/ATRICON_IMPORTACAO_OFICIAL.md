# Publicações oficiais da ATRICON no módulo 14

A página `/admin/atricon` consulta o catálogo em https://radardatransparencia.atricon.org.br/downloads.html. Os endereços dos arquivos são extraídos da publicação atual; não há arquivos anuais presumidos ou resultados inventados.

## Utilização

1. Selecione o ciclo (2025, 2024, 2023, 2022 ou outro ciclo publicado).
2. Selecione a planilha de avaliações nacionais ou uma planilha de respostas por UF. A matriz e a cartilha de 2026 também são identificadas na fonte atual.
3. Opcionalmente, informe município ou órgão para restringir os registros importados. O arquivo original é preservado integralmente, e o recorte fica identificado.
4. Clique em **Importar publicação oficial**. Após a conclusão, **Ver dados baixados** abre o modal com as abas/planilhas, pesquisa, paginação, origem, ciclo, tamanho e SHA-256. PDFs são exibidos no próprio navegador.
5. A publicação selecionada passa a constar nas evidências salvas e no anexo técnico. Descrições de critérios presentes no arquivo são confrontadas pela IA local com as páginas públicas lidas. Isso não atribui automaticamente atendimento aos 88 pontos.

As importações e os arquivos originais ficam no IndexedDB deste navegador; não são compartilhados automaticamente com outros computadores. A referência e as análises são preservadas nos registros e relatórios do banco quando o operador salva uma evidência ou gera o anexo. Não são necessárias migrações do banco para esta funcionalidade.

## Arquivos grandes

O pacote nacional de 2025 tem 338.558.947 bytes. Para evitar transferi-lo inteiro ao navegador, o servidor lê o índice ZIP por intervalos HTTP e extrai apenas a planilha selecionada. O CRC do membro e o SHA-256 do conteúdo são verificados antes da importação.

O limite é de 20 MB por planilha/documento extraído, 256 MB de expansão XML e 300 mil registros/8 milhões de células no navegador. Planilhas maiores continuam disponíveis pelo link para o pacote completo na fonte. A leitura incremental das planilhas grandes permite filtrar a instituição sem manter todo o XML em memória. Nenhum limite é tratado como uma importação concluída com dados truncados.

Há uma alternativa para abrir um arquivo já baixado da fonte, com origem explicitamente registrada como informada pelo operador. Suporta XLSX, CSV UTF-8/Windows-1252, JSON, ZIP e PDF. Planilhas XLS antigas precisam de conversão para XLSX/CSV. O arquivo local não é apresentado como download automaticamente validado no catálogo.

## Módulo 14 do edital

- **14.1:** mantém a detecção de pendências e acrescenta comparação semântica das descrições realmente presentes nas publicações importadas. Usa o modelo local existente; não chama IA paga nem envia os arquivos a esse tipo de serviço.
- **14.2:** preserva os 88 pontos contratuais como avaliação interna. Os instrumentos oficiais variam por ano e poder; os IDs/linhas do arquivo não substituem automaticamente os 88 critérios internos.
- **14.3:** anexo inclui ciclo, nome do arquivo, URL oficial, membro do ZIP, hash, data de importação, recorte e comparação quando aplicável.
- **14.4:** mantém os estados individuais, URL e verificação manual. Uma avaliação histórica de outro órgão/ano não aprova o portal atual.

## Validação com a fonte real — 27/10/2026

A página oficial foi recuperada via HTTPS. Foram identificadas 114 opções de arquivos/planilhas, incluindo os pacotes históricos e a documentação de 2026.

| Ciclo | Arquivo extraído | Registros na avaliação nacional | SHA-256 do XLSX |
|---|---|---:|---|
| 2025 | `pntp_2025/avaliacoes_pntp_2025.xlsx` | 11.697 | `9081ba2b302e5bc031b2f89415ddddf24a403a48d61a597e1ec21c00dd00c50f` |
| 2024 | `pntp_2024/avaliacoes_pntp_2024.xlsx` | 11.697 | `2bf7c0a9d29ad45460903ce750968c34a81a2af5686fa4a94141a07fc8ed95d3` |
| 2023 | `pntp_2023/avaliacoes_pntp_2023.xlsx` | 11.697 | `21793aac74e7c379f37308a5f1ac0c9ba8eb6459cba4d24f93a083f53ec5adea` |
| 2022 | `pntp_2022/avaliacoes_pntp_2022.xlsx` | 8.019 | `3d7715463c29c038926ae441b945501a39bedfd3361f2dc59e58a467fe7add12` |

A matriz de 2026 contém 193 linhas na planilha principal e 187 descrições distintas reconhecidas; não foi reduzida artificialmente a 88. A extração de respostas RN/2025 leu 108.981 registros, selecionando 637 correspondências para “Pau dos Ferros”, com 102 descrições distintas de critérios entre os órgãos encontrados. A leitura não cria registros nem muda os dados oficiais para a identidade do portal.

Os testes incluem a página real e o ZIP real da matriz de 2026 em `src/test/fixtures`, além de transporte por intervalos, integridade, leitura de XLSX/CSV/JSON/ZIP/PDF, persistência e interação do modal. Arquivos completos dos resultados nacionais não foram incluídos no repositório.

Em ambientes Node com proxy HTTP de saída, a validação da fonte utilizou `NODE_USE_ENV_PROXY=1 NODE_USE_SYSTEM_CA=1` com Node 24. No runtime Cloudflare, utiliza-se o `fetch` da plataforma. A captura da página não representa garantia de disponibilidade futura da fonte.
