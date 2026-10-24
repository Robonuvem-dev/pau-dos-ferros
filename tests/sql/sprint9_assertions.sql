BEGIN;
CREATE FUNCTION pg_temp.assert_true(ok boolean,label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'ASSERT: %',label; END IF; RAISE NOTICE 'PASS: %',label; END $$;
CREATE FUNCTION pg_temp.expect_error(stmt text,code text,label text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE caught text; BEGIN
 BEGIN EXECUTE stmt; EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS caught=RETURNED_SQLSTATE; END;
 IF caught IS DISTINCT FROM code THEN RAISE EXCEPTION 'ASSERT: %, wanted %, got %',label,code,caught; END IF;
 RAISE NOTICE 'PASS: %',label;
END $$;
INSERT INTO auth.users(id,email) VALUES('00000000-0000-0000-0000-000000000041','admin-s9@poc.invalid'),('00000000-0000-0000-0000-000000000042','cidadao-s9@poc.invalid');
INSERT INTO public.user_roles(user_id,role) VALUES('00000000-0000-0000-0000-000000000041','admin');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000041',true);
INSERT INTO public.municipio_informacoes(categoria,titulo,descricao) VALUES('Escolas','POC Escola ficticia','Conteudo sintetico sem validade administrativa');
SELECT pg_temp.expect_error($q$INSERT INTO public.atricon_avaliacoes(criterio,status) VALUES('01','atende')$q$,'23514','positive evaluation requires evidence');
SELECT pg_temp.expect_error($q$INSERT INTO public.atricon_avaliacoes(criterio,status,link,observacao) VALUES('01','terceiro','javascript:alert(1)','Observacao suficiente')$q$,'23514','invalid evidence URL rejected');
INSERT INTO public.atricon_avaliacoes(criterio,status,link,observacao) VALUES('01','atende','https://example.invalid/poc','Verificacao ficticia para testar persistencia');
INSERT INTO public.atricon_relatorios(modelo,texto,analise_ia,resultados) SELECT 'Modelo de teste','Anexo ficticio','Inferencia testada separadamente',jsonb_agg(n) FROM generate_series(1,88)n;
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.atricon_relatorios),'report with 88 results persists');
SELECT pg_temp.expect_error($q$INSERT INTO public.atricon_relatorios(modelo,texto,analise_ia,resultados) VALUES('Teste','Teste','Teste','[]')$q$,'23514','incomplete report rejected');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000042',true);
SELECT pg_temp.assert_true((SELECT count(*)=0 FROM public.atricon_relatorios),'citizen cannot read staff reports');
SELECT pg_temp.expect_error($q$INSERT INTO public.municipio_informacoes(categoria,titulo,descricao) VALUES('Escolas','Sem acesso','Sem acesso')$q$,'42501','citizen cannot edit municipality');
RESET ROLE;
INSERT INTO public.atendimentos(id,protocolo,canal,tipo,nome,email,assunto,mensagem,created_at)
VALUES('70000000-0000-0000-0000-000000000001','PF-TESTE-RECURSO','esic','Recurso','Pessoa ficticia','recurso@poc.invalid','POC recurso','Mensagem ficticia','2026-10-24T01:00:00Z');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000041',true);
SELECT pg_temp.expect_error($q$SELECT public.prorrogar_esic('70000000-0000-0000-0000-000000000001','Justificativa ficticia suficiente')$q$,'P0001','appeal cannot use initial request extension');
SET LOCAL ROLE anon;
SELECT pg_temp.assert_true((SELECT prazo_final='2026-10-28'::date FROM public.consultar_protocolo_seguro('PF-TESTE-RECURSO','recurso@poc.invalid')),'public appeal deadline is five days in municipal timezone');
RESET ROLE;
SET LOCAL ROLE anon;
SELECT pg_temp.assert_true(EXISTS(SELECT 1 FROM public.municipio_informacoes WHERE titulo='POC Escola ficticia'),'municipality publicly readable');
SELECT pg_temp.expect_error($q$SELECT * FROM public.atricon_relatorios$q$,'42501','anonymous report access denied');
RESET ROLE;
ROLLBACK;
