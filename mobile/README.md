# Aplicativos de demonstração Android e iOS

Aplicativos híbridos com contêineres nativos Android (WebView) e iOS (WKWebView). Acessam a solução publicada por HTTPS e a autenticação/RLS existente. Não são telas estáticas e não incluem senha, token ou acesso automático de administrador.

O menu nativo abre notícias, gestão, nova notícia, editais, relatórios fiscais, leis, decretos e estatísticas. A edição das notícias existentes é feita pelo painel autenticado. O seletor nativo de arquivos permite anexar documentos e fotos. Operações exigem conexão; o aplicativo não armazena dados administrativos offline. Links externos abrem no navegador do aparelho.

Android: o CI compila um APK de demonstração assinado com chave de debug, instala em emulador e registra a abertura. Esse APK é para a PoC; distribuição definitiva precisa de chave de assinatura da organização.

iOS: o CI compila o aplicativo para simulador e para dispositivo sem assinatura. Instalar em iPhone/iPad físico requer assinatura com equipe Apple autorizada; nenhum certificado foi presumido nem incluído. Não declarar homologação física sem instalar e ensaiar.

## Ensaio M13
1. Instalar e abrir em Android e iOS; registrar modelo/versão e captura.
2. Notícias: ler uma publicação pública.
3. Autenticar com conta de teste e criar/editar uma notícia fictícia; verificar publicação.
4. Conferir estatísticas no painel.
5. Cadastrar edital, relatório fiscal, lei e decreto com arquivo fictício.
6. Confirmar acesso público e auditoria de cada operação.
7. Sair e tentar gravar: deve exigir acesso autorizado.

O contêiner híbrido deve ser confrontado com a exigência de visualização nativa do edital. Build, abertura e menu não equivalem ao aceite de todos os oito requisitos.
