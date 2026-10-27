# Aplicativos, instalação e responsividade — 26/10/2026

## Alterações

- Android e iOS nativos: versão 1.1.0, build 3, brasão municipal e início no portal publicado. Notícias nativas continuam disponíveis em Notícias. Portal/Notícias/Menu substituem a barra extensa de atalhos. Retirado o rótulo fixo nativo de Sistema Municipal/dados de referência.
- As telas web dos aplicativos usam o mesmo endereço do site. Mudanças publicadas no portal são recebidas ao abrir/navegar/recarregar; alterações no contêiner nativo exigem um novo pacote. Não existe atualização automática do binário pela loja.
- Cabeçalho menor no celular, navegação pública com quebra de linha, menu administrativo recolhível, formulários com fonte de pelo menos 16 px no celular e diálogos limitados à altura da tela, com rolagem interna.
- `/instalar.html`: instalação pelo navegador em Android/iOS com manifesto e ícones municipais. O service worker não intercepta requisições nem mantém páginas, sessões, APIs ou dados administrativos em cache. Conexão é necessária.
- Mantido o aviso condicional de referência do site. A remoção dessa identificação do site foi rejeitada pela revisão automática; isso não impediu retirar o rótulo próprio dos aplicativos.

## Evidências e limites

- 220 testes em 27 arquivos, TypeScript, lint semântico e build aprovados localmente. Os avisos legados de formatação não foram usados para mascarar erro de código.
- Ensaio visual de início, serviços, transparência, login e instalação em 320, 390, 768 e 1366 px: 20 combinações sem overflow horizontal da página. Menu aberto e fonte ampliada em 320/390 px também passaram, totalizando 22 combinações. Não é uma homologação de todos os cadastros administrativos.
- Resultados locais: `output/mobile-1.1.0/responsividade.json` e capturas da mesma pasta. O primeiro ensaio local sem configuração pública do banco abriu a página de erro e foi descartado; o ensaio válido foi repetido com as páginas reais carregadas.
- Fonte da revisão funcional: `be796b2c2685d36bacff2133a7d17a80bb0935fd`. Teste Android ampliado e configuração de DNS somente do emulador: `37d5a93406ca7939c5cfec2d53a375695c0c51c4`.
- A primeira execução Android compilou e instalou o APK, mas falhou na abertura do portal por `ERR_NAME_NOT_RESOLVED` no emulador. Esse resultado não foi contado como aprovação. O teste novo exige portal remoto carregado, menu e notícias nativas, com XML e captura em caso de falha.
- Execução final [40264587043](https://github.com/Robonuvem-dev/pau-dos-ferros/actions/runs/40264587043): Android e iOS aprovados. Capturas Android conferidas: portal remoto carregado, Portal/Notícias/Menu e ausência da faixa fixa nativa. Qualidade e SQL do commit `37d5a93406ca7939c5cfec2d53a375695c0c51c4` aprovados na execução [40264587002](https://github.com/Robonuvem-dev/pau-dos-ferros/actions/runs/40264587002).
- APK publicado em `/downloads/PauDosFerros-Android.apk`: 70.039 bytes, SHA256 `8058763f9c4a96901d89dbd4531fba9633e3e311c1cf0f0c0d19e7c9b2ad8354`. Origem e integridade também registradas em `/downloads/android.json`. Artefato ZIP aprovado `12625867958`, SHA256 `f0355e76828ab1f0282e2ec5ad53aa795ab596e137380d7ac86534527ae133e2`, conferido antes da extração.
- Assinatura e instalação em iPhone/iPad físico continuam pendentes. O build para dispositivo é sem assinatura; o build para simulador não é um IPA distribuível.
- O APK de ensaio usa assinatura debug do CI. A página de download não remove verificações do Android. Não orientar desativação de Play Protect. Distribuição definitiva requer assinatura estável e canal autorizado da organização; chaves de ensaios diferentes podem exigir reinstalação.
- A versão web instalável facilita o acesso e acompanha o site; não substitui a avaliação do aplicativo nativo exigido no M13.

## Para testar no aparelho

1. Abrir `/instalar.html` no Chrome Android ou Safari iOS e seguir a orientação de instalação na tela inicial.
2. Conferir brasão, abertura do portal, menu, orientação vertical/horizontal e texto ampliado.
3. No Android nativo atualizado, conferir Portal, Notícias e Menu; não deve existir a faixa fixa nativa antiga.
4. Com conta de teste autorizada, conferir os fluxos 13.2–13.8 do checklist. Build e abertura não comprovam o cadastro completo em aparelho físico.
5. Após nova publicação do site, recarregar o portal dentro do app e conferir a versão em Sobre o sistema. Mudança em recurso nativo precisa de novo pacote.
