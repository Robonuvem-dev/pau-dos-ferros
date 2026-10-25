\set ON_ERROR_STOP on
BEGIN;
CREATE FUNCTION pg_temp.assert_true(ok boolean,label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAIL: %',label; END IF; RAISE NOTICE 'PASS: %',label; END $$;
CREATE FUNCTION pg_temp.expect_error(stmt text,code text,label text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE caught text; BEGIN
 BEGIN EXECUTE stmt; EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS caught=RETURNED_SQLSTATE; END;
 PERFORM pg_temp.assert_true(caught=code,label||' SQLSTATE='||coalesce(caught,'NO ERROR'));
END $$;
INSERT INTO auth.users(id,email) VALUES ('00200000-0000-4000-8000-000000000001','admin-parciais@poc.invalid'),('00200000-0000-4000-8000-000000000002','editor-parciais@poc.invalid');
INSERT INTO public.user_roles(user_id,role) VALUES ('00200000-0000-4000-8000-000000000001','admin'),('00200000-0000-4000-8000-000000000002','editor');
INSERT INTO public.permissoes_modulo(user_id,tabela) VALUES ('00200000-0000-4000-8000-000000000002','noticias');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00200000-0000-4000-8000-000000000001',true);
SELECT pg_temp.expect_error($q$INSERT INTO public.obras(nome) VALUES('POC incompleta')$q$,'23514','obra incompleta recusada pelo banco');
SELECT pg_temp.expect_error($q$INSERT INTO public.veiculos(placa,modelo) VALUES('POC-TEST','Modelo ficticio')$q$,'23514','frota incompleta recusada pelo banco');
SELECT pg_temp.expect_error($q$INSERT INTO public.conselhos(nome) VALUES('Conselho ficticio')$q$,'23514','conselho incompleto recusado pelo banco');
SELECT pg_temp.expect_error($q$SELECT public.salvar_cadastro_composto('convenios','{"numero":"POC-SEM-PARCELA","concedente":"POC","convenente":"POC","responsavel_concedente":"POC","responsavel_convenente":"POC","objeto":"Ficticio","valor_global":1000}')$q$,'23514','convênio sem parcela falha atomicamente');
SELECT pg_temp.assert_true(NOT EXISTS(SELECT 1 FROM public.convenios WHERE numero='POC-SEM-PARCELA'),'falha não deixa convênio incompleto');
SELECT public.salvar_cadastro_composto('convenios','{"numero":"POC-COMPOSTO","concedente":"POC","convenente":"POC","responsavel_concedente":"POC","responsavel_convenente":"POC","objeto":"Ficticio","valor_global":1000}',NULL,'{"parcela":{"valor":200,"vencimento":"2026-12-30"}}') AS convenio \gset
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.convenio_parcelas WHERE convenio_id=:'convenio'),'convênio e parcela inicial gravados juntos');
SELECT pg_temp.expect_error(format($q$INSERT INTO public.convenio_parcelas(convenio_id,numero,valor) VALUES(%L,2,100)$q$,:'convenio'),'23514','vencimento obrigatório na parcela');
SELECT pg_temp.expect_error(format($q$INSERT INTO public.convenio_obrigacoes(convenio_id,titulo) VALUES(%L,'POC')$q$,:'convenio'),'23514','parte obrigada obrigatória');
INSERT INTO public.convenio_obrigacoes(convenio_id,titulo,parte_obrigada) VALUES(:'convenio','Obrigação fictícia do concedente','Concedente');
INSERT INTO public.convenio_aplicacoes(convenio_id,descricao,natureza,valor) VALUES(:'convenio','Aplicação fictícia','Equipamentos',600);
CREATE FUNCTION pg_temp.exceder_aplicacao(target uuid) RETURNS void LANGUAGE plpgsql AS $$ BEGIN
 INSERT INTO public.convenio_aplicacoes(convenio_id,descricao,natureza,valor) VALUES(target,'Outra aplicação','Teste',500);
 SET CONSTRAINTS ALL IMMEDIATE;
END $$;
SELECT pg_temp.expect_error(format('SELECT pg_temp.exceder_aplicacao(%L)',:'convenio'),'23514','aplicação não pode exceder valor global');
CREATE FUNCTION pg_temp.excluir_ultima_parcela(target uuid) RETURNS void LANGUAGE plpgsql AS $$ BEGIN
 DELETE FROM public.convenio_parcelas WHERE convenio_id=target;
 SET CONSTRAINTS ALL IMMEDIATE;
END $$;
SELECT pg_temp.expect_error(format('SELECT pg_temp.excluir_ultima_parcela(%L)',:'convenio'),'23514','última parcela não pode ser excluída');

INSERT INTO public.contratos(id,numero,tipo,fornecedor,objeto,valor,data_fim) VALUES
 ('00200000-0000-4000-8000-000000000010','POC-DUPLICADO','Contrato','Fictício','Fictício',100,'2026-12-31'),
 ('00200000-0000-4000-8000-000000000011','POC-DUPLICADO','Contrato','Fictício','Fictício',200,'2026-12-31'),
 ('00200000-0000-4000-8000-000000000012','POC-ATA','Ata de Registro de Preços','Fictício','Fictício',500,'2026-12-31');
INSERT INTO public.contratos(numero,tipo,fornecedor,objeto,valor,data_fim,contrato_origem_id) VALUES('POC-ADITIVO','Aditivo','Fictício','Fictício',10,'2027-12-31','00200000-0000-4000-8000-000000000010');
SELECT pg_temp.assert_true((SELECT valor_atualizado=110 AND data_fim_atualizada='2027-12-31' FROM public.contratos WHERE id='00200000-0000-4000-8000-000000000010'),'aditivo recalcula apenas o contrato por UUID');
SELECT pg_temp.assert_true((SELECT valor_atualizado=200 FROM public.contratos WHERE id='00200000-0000-4000-8000-000000000011'),'número duplicado não contamina outro contrato');
SELECT pg_temp.expect_error($q$INSERT INTO public.contratos(numero,tipo,fornecedor,objeto,contrato_origem_id) VALUES('POC-CARONA','Adesão (Carona)','Fictício','Fictício','00200000-0000-4000-8000-000000000010')$q$,'23514','carona exige origem do tipo ata');
INSERT INTO public.contratos(numero,tipo,fornecedor,objeto,contrato_origem_id) VALUES('POC-CARONA-OK','Adesão (Carona)','Fictício','Fictício','00200000-0000-4000-8000-000000000012');
SELECT pg_temp.expect_error($q$DELETE FROM public.contratos WHERE id='00200000-0000-4000-8000-000000000010'$q$,'23503','contrato de origem referenciado não vira órfão');

SELECT pg_temp.expect_error($q$SELECT public.salvar_cadastro_composto('plano-diretor','{"nome":"POC-PLANO-INCOMPLETO"}',NULL,'{"fase":"Fase"}')$q$,'23514','plano sem quatro componentes recusado');
SELECT pg_temp.assert_true(NOT EXISTS(SELECT 1 FROM public.planos_diretores WHERE nome='POC-PLANO-INCOMPLETO'),'plano incompleto não persiste');
SELECT public.salvar_cadastro_composto('plano-diretor','{"nome":"POC-PLANO-COMPLETO"}',NULL,'{"fase":"Fase fictícia","integrante":"Integrante fictício","eixo":"Eixo fictício","acao":"Ação fictícia"}') AS plano \gset
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.plano_diretor_acoes WHERE plano_id=:'plano'),'plano completo cria ação vinculada ao eixo');
CREATE FUNCTION pg_temp.excluir_ultima_fase(target uuid) RETURNS void LANGUAGE plpgsql AS $$ BEGIN DELETE FROM public.plano_diretor_fases WHERE plano_id=target; SET CONSTRAINTS ALL IMMEDIATE; END $$;
SELECT pg_temp.expect_error(format('SELECT pg_temp.excluir_ultima_fase(%L)',:'plano'),'23514','plano mantém quatro componentes após edição');

INSERT INTO public.licitacoes(id,numero,objeto) VALUES('00200000-0000-4000-8000-000000000020','POC-PUBLICACOES','Objeto fictício');
UPDATE public.licitacoes SET objeto='Objeto fictício atualizado' WHERE id='00200000-0000-4000-8000-000000000020';
SELECT pg_temp.assert_true((SELECT count(*)=2 FROM public.licitacao_publicacoes WHERE licitacao_id='00200000-0000-4000-8000-000000000020'),'cadastro e alteração geram eventos reais de publicação');

INSERT INTO public.servicos(id,nome) VALUES('00200000-0000-4000-8000-000000000030','Serviço fictício da PoC');
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub','',true);
SELECT pg_temp.expect_error($q$SELECT * FROM public.servico_solicitacoes$q$,'42501','solicitações pessoais não são públicas');
SELECT pg_temp.expect_error($q$SELECT public.solicitar_servico('00200000-0000-4000-8000-000000000030','POC','invalido','Mensagem fictícia')$q$,'22023','solicitação valida contato');
SELECT public.solicitar_servico('00200000-0000-4000-8000-000000000030','Pessoa fictícia','pessoa@poc.invalid','Solicitação fictícia para testar o fluxo') AS protocolo \gset
SELECT pg_temp.assert_true(length(:'protocolo')>20,'cidadão recebe protocolo persistido');
SELECT public.avaliar_servico('00200000-0000-4000-8000-000000000030',5,true,'Avaliação fictícia');
SELECT pg_temp.assert_true((SELECT solicitacoes=1 AND avaliacoes=1 FROM public.estatisticas_servicos() WHERE servico_id='00200000-0000-4000-8000-000000000030'),'estatística contabiliza solicitações e satisfação separadamente');
SELECT pg_temp.expect_error($q$SELECT * FROM public.documentos_carta_gerados$q$,'42501','bytes arquivados não são uma tabela pública de uploads');
SELECT documento_id AS doc1 FROM public.gerar_documento_carta('json',ARRAY['00200000-0000-4000-8000-000000000030'::uuid]) \gset
SELECT documento_id AS doc2 FROM public.gerar_documento_carta('json',ARRAY['00200000-0000-4000-8000-000000000030'::uuid]) \gset
SELECT pg_temp.assert_true(:'doc1'=:'doc2','mesmo conteúdo público reutiliza arquivo por hash');
SELECT pg_temp.assert_true((SELECT conteudo LIKE '%Serviço fictício%' FROM public.gerar_documento_carta('csv',ARRAY['00200000-0000-4000-8000-000000000030'::uuid])),'CSV público é gerado e preservado no servidor');
SELECT pg_temp.assert_true((SELECT conteudo LIKE '%Etapa 5%' FROM public.gerar_documento_carta('ficha')),'modelo em branco tem bytes arquivados');
SELECT pg_temp.expect_error($q$SELECT * FROM public.gerar_documento_carta('arbitrario')$q$,'22023','visitante não injeta bytes arbitrários no arquivo');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00200000-0000-4000-8000-000000000002',true);
SELECT pg_temp.assert_true((SELECT count(*)=0 FROM public.servico_solicitacoes),'editor de outro módulo não lê solicitações');
SELECT pg_temp.expect_error($q$SELECT public.salvar_cadastro_composto('convenios','{"numero":"POC-INDEVIDO"}')$q$,'42501','cadastro composto respeita permissão do módulo');
SELECT set_config('request.jwt.claim.sub','00200000-0000-4000-8000-000000000001',true);
UPDATE public.servico_solicitacoes SET status='Concluída',resposta='Providência de teste registrada' WHERE protocolo=:'protocolo';
SELECT pg_temp.assert_true((SELECT status='Concluída' FROM public.servico_solicitacoes WHERE protocolo=:'protocolo'),'gestor trata solicitação no painel privado');
SELECT pg_temp.expect_error(format('UPDATE public.servico_solicitacoes SET email=%L WHERE protocolo=%L','outro@poc.invalid',:'protocolo'),'42501','gestor não altera identidade da solicitação');
SELECT pg_temp.assert_true((SELECT octet_length(conteudo)>0 AND length(sha256)=64 FROM public.documentos_carta_gerados WHERE id=:'doc1'),'arquivo preservado em bytes com checksum');
SELECT public.sincronizar_dados_poc('receitas','POC-AUTOMATICA','[{"ano":2026,"mes":10,"categoria":"POC","chave_externa":"POC-X1","arrecadado":100}]');
SELECT public.sincronizar_dados_poc('receitas','POC-AUTOMATICA','[{"ano":2026,"mes":10,"categoria":"POC","chave_externa":"POC-X1","arrecadado":250}]');
SELECT pg_temp.assert_true((SELECT count(*)=1 AND max(arrecadado)=250 FROM public.receitas WHERE origem='POC-AUTOMATICA' AND chave_externa='POC-X1'),'sincronização idempotente atualiza valor sem duplicar');
SELECT public.sincronizar_dados_poc('receitas','POC-AUTOMATICA','[{"ano":2026,"mes":10,"categoria":"POC","chave_externa":"POC-X1"}]');
SELECT pg_temp.assert_true((SELECT arrecadado=250 FROM public.receitas WHERE origem='POC-AUTOMATICA' AND chave_externa='POC-X1'),'coluna ausente do arquivo não apaga valor existente');
SELECT set_config('request.jwt.claim.sub','00200000-0000-4000-8000-000000000002',true);
SELECT pg_temp.expect_error($q$SELECT public.sincronizar_dados_poc('receitas','POC-AUTOMATICA','[{"ano":2026,"mes":10,"categoria":"POC","chave_externa":"POC-X2"}]')$q$,'42501','sincronização respeita permissão de escrita do módulo');
SET CONSTRAINTS ALL IMMEDIATE;
ROLLBACK;
