# Aplicativos municipais Android e iOS

Aplicativos híbridos com contêineres nativos Android (WebView) e iOS (WKWebView). Acessam a solução publicada por HTTPS e a autenticação/RLS existente. Não são telas estáticas e não incluem senha, token ou acesso automático de administrador.

O aplicativo inicia no portal publicado. O menu compacto mantém acesso a notícias nativas, gestão, serviços, transparência, e-SIC, nova notícia, editais, relatórios fiscais, leis e decretos. A edição e as estatísticas usam o painel autenticado atual. O seletor nativo de arquivos permite anexar documentos e fotos. Operações exigem conexão; o aplicativo não armazena dados administrativos offline. Links externos abrem no navegador do aparelho.

## Instalação e atualização
- `/instalar.html` oferece a instalação web na tela inicial em Android/iOS, sem habilitar fontes desconhecidas. Essa versão acompanha o portal publicado; depende do suporte do navegador e de conexão.
- Android/iOS nativos: versão 1.1.0, build 3. Abrem o mesmo portal, sem o rótulo fixo nativo do sistema no topo. Mudanças no site aparecem ao navegar/recarregar; mudanças no contêiner exigem instalar novo binário.
- O manifest e os ícones web são servidos pelo mesmo domínio. O service worker não armazena páginas, sessões, APIs ou dados administrativos em cache; não há promessa de operação offline.
- O APK de desenvolvimento continua assinado com chave de debug do CI; não é distribuição definitiva por loja. Uma página de download não remove avisos do Android. Não orientar a desativação de Play Protect. Chaves de debug de execuções diferentes podem exigir reinstalação em vez de atualização; publicação definitiva precisa de assinatura estável da organização.
- A instalação web é alternativa de acesso; não substitui a avaliação dos requisitos de aplicativo nativo do edital.

Android: o CI compila um APK de desenvolvimento assinado com chave de debug, instala em emulador e registra a abertura. Esse APK é para uso técnico; distribuição definitiva precisa de chave de assinatura da organização.

iOS: o CI compila o aplicativo para simulador e para dispositivo sem assinatura. Instalar em iPhone/iPad físico requer assinatura com equipe Apple autorizada; nenhum certificado foi presumido nem incluído. Não declarar homologação física sem instalar e ensaiar.

## Ensaio M13
1. Instalar e abrir em Android e iOS; registrar modelo/versão e captura.
2. Notícias: ler uma publicação pública.
3. Autenticar com conta de teste e criar/editar uma notícia de referência; verificar publicação.
4. Conferir estatísticas no painel.
5. Cadastrar edital, relatório fiscal, lei e decreto com arquivo de referência.
6. Confirmar acesso público e auditoria de cada operação.
7. Sair e tentar gravar: deve exigir acesso autorizado.

O contêiner híbrido deve ser confrontado com a exigência de visualização nativa do edital. Build, abertura e menu não equivalem ao aceite de todos os oito requisitos.
