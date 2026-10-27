# Sprint 5 — validação executada e ensaio público parcial
Referência: 23/10/2026, America/Sao_Paulo. **Não é homologação integral da Sistema Municipal.**

## Evidência técnica
HEAD Vette `10f027e8a7f326d4d7c177858275bf8772ca67f6`:
[CI de push aprovado](https://github.com/Robonuvem-dev/pau-dos-ferros/actions/runs/40045034592).
58 testes unitários/componentes, 37 asserts SQL, TypeScript, lint semântico e build aprovados.
PostgreSQL 16 descartável: migrations 0000–0012 aplicadas em ordem, RLS e RPCs exercitadas, dados de teste revertidos.
Desvios explícitos: 6 avisos React Refresh; Prettier legado não bloqueante, 72 arquivos.

## Integração e ambiente
O usuário autorizou expressamente o merge e a atualização, permitindo o Cloud existente e proibindo prompts e IA paga.
[PR #3 mesclado](https://github.com/Robonuvem-dev/pau-dos-ferros/pull/3), merge `aa79eb4f5797d42b077b307c9a13154f178eab2f`.
Lovable sincronizou esse commit; migrations 0009–0012 aplicadas após preflight do schema em transação.
Tabelas novas com RLS ativa; RPC antiga consultar_protocolo sem EXECUTE para anon/authenticated.
Publicação solicitada pela ferramenta direta, sem enviar mensagem ao agente Lovable.
[Portal](https://pau-dos-ferros.lovable.app) verificado no navegador com os novos componentes.

## M04 — o que foi demonstrado
[Convênios](https://pau-dos-ferros.lovable.app/transparencia/convenios), registro Sistema Municipal-de referência-001:
- Valor global 10.000; parcelas válidas 6.000; recebido 2.500; saldo a programar 4.000.
- Parcela cancelada de 999 excluída da soma.
- Dois contratos vinculados: Sistema Municipal-CONTRATO-A (1.000) e Sistema Municipal-CONTRATO-B (2.000).
- Uma obrigação pendente/vencida; gráfico 25% recebido.
- Detalhes expandidos exibiram metas, especificações e plano de aplicação.
A carga foi feita por SQL autorizado e a consulta pública foi exercitada no navegador. **CRUD pelo painel ainda não ensaiado**, portanto não se marca todo o módulo como homologado.

## M05 — o que foi demonstrado
[/esic](https://pau-dos-ferros.lovable.app/esic): pedido identificado criado pelo formulário público com nome/e-mail/mensagem de referência.
Protocolo com 38 caracteres; consulta com e-mail incorreto bloqueada e com e-mail correto retornou assunto, situação e prazo 12/11/2026.
Conferência no banco: e-mail incorreto retornou zero registros, correto retornou um.
A estatística ficou desatualizada após o envio: correção e teste de regressão no PR subsequente.
**Prorrogação/resposta/recurso no painel aguardam login do administrador**. Os testes SQL passaram, mas não substituem esse ensaio.

## M14 e créditos
Gateway Lovable removido. IA requer modelo local explicitamente configurado; nenhum modelo local foi executado.
ATRICON mantém 88 pontos e exige evidência individual para marcação positiva; cadastros populados não geram aprovação.
Não houve prompts/agentes nem IA paga do Lovable. Cloud existente passou a ser permitido pelo usuário; não se afirma consumo zero de infraestrutura.

## Pendências e decisão
- Login administrador e ensaio autenticado; publicação da correção estatística e nova conferência.
- Sprints 6–8 e funcionalidades faltantes dos módulos fiscais/setoriais.
- M07: leiautes e amostras autorizadas; M13: instalação Android/iOS; M14: modelo local e ensaio dos 88 pontos.
- M16: evidências do responsável externo.
- Convocação/ata atual do pregão ainda não confirmada. Não presumir prazo futuro.
**NO-GO para declarar os 168 requisitos concluídos.** Checklist continua sem homologação integral.
