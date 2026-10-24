# Revisão pública — 24/10/2026

## Correções
- Atalhos da página inicial acima da imagem de destaque, sem serem encobertos.
- Consultas públicas e configurações atualizadas a cada 15 segundos enquanto a página está aberta, com atualização ao retornar à aba.
- Alterações administrativas invalidam as consultas públicas compartilhadas, inclusive cadastros relacionados.
- Banners respeitam imagem preenchida, ativação, ordem e datas de início/fim. Vigência calculada no servidor com a data de São Paulo; banner sem imagem não é exibido.
- Link cadastrado do banner disponível na página inicial; controles de rotação ficam junto ao destaque.
- Configurações carregadas antes da construção inicial da página, evitando divergência entre servidor e navegador.
- Compartilhamento de notícias inicializado depois da montagem, evitando divergências nos endereços.

## Evidências
- 75 endereços públicos verificados no navegador, incluindo todas as consultas públicas do catálogo, aliases e quatro notícias existentes: HTTP 200, sem erros de execução/hidratação ou telas de falha.
- Edição temporária do título do banner com imagem no painel administrativo refletiu na página inicial já aberta de visitante sem sessão; título original restaurado.
- Imagem e atalhos inspecionados em 1280px, 918px e 390px; sem rolagem horizontal na página inicial.
- 171 testes automatizados passaram, incluindo quatro testes de ativação, vigência e data municipal.

## Limitações
- Facebook bloqueou sua própria incorporação por política externa no navegador de teste; esse bloqueio não é erro de construção do HTML e não foi alterado nesta revisão.
- A varredura de renderização e a atualização real de banner não substituem a homologação individual de todas as operações previstas no edital.