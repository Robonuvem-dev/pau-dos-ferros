# Identidade de Aurora das Veredas

A identidade do portal está centralizada em `src/lib/municipal-brand.ts`. O brasão é a imagem fornecida pelo responsável pelo sistema, hospedada na Wikimedia. O nome institucional aparece no cabeçalho, metadados, relatórios, páginas públicas, painel e PWA.

Os módulos administrativos estão em `/admin/modulos/:id`. Os documentos públicos estão em `/arquivos/`. O painel móvel exige o PWA instalado.

## Arquivos de imagem

O ambiente de desenvolvimento recusou o download do brasão com HTTP 403 no proxy. As páginas e o manifesto referenciam diretamente o endereço informado. A exibição e a instalação precisam ser verificadas no navegador com acesso à imagem.

Para incorporar a imagem ao repositório e atualizar também os ícones dos aplicativos nativos, obtenha o arquivo original e execute:

```sh
python3 scripts/atualizar-brasao.py /caminho/brasao.png
```

O comando requer Pillow e gera favicon, imagens proporcionais de 192/512 pixels, Apple Touch Icon e ícones Android/iOS. Em seguida, execute as verificações do README e recompile os aplicativos nativos. O pacote Android com a identidade anterior foi retirado da distribuição pública.

## Compatibilidade

Os identificadores das funções SQL e o histórico das migrações existentes permanecem compatíveis com o banco conectado. A normalização de apresentação preserva IDs, chaves de integração e valores numéricos. A alteração de identidade não publica o site nem configura um novo domínio.
