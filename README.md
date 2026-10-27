# Prefeitura de Aurora das Veredas

Portal institucional, painel de gestão, transparência municipal, e-SIC, ouvidoria e serviços ao cidadão.

## Desenvolvimento

Requisitos: Node.js 24 e Bun 1.3.14.

```sh
bun install --frozen-lockfile
bun run dev
```

## Verificação

```sh
bun run test
bunx tsc --noEmit
bunx eslint . --rule "prettier/prettier: off"
bun run build
```

## Acesso

O painel está em `/admin`, com módulos em `/admin/modulos/:id`. No celular, o acesso ao painel exige abrir o PWA instalado. O portal público permanece disponível no navegador.

As integrações utilizam as permissões e a auditoria do banco. Consulte `docs/gestao` para a documentação técnica.
