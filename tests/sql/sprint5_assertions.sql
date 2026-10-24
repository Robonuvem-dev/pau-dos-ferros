\set ON_ERROR_STOP on
BEGIN;
CREATE FUNCTION pg_temp.assert_true(ok boolean, description text) RETURNS void
LANGUAGE plpgsql AS $$ BEGIN
 IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAIL: %', description; END IF;
 RAISE NOTICE 'PASS: %', description;
END $$;
CREATE FUNCTION pg_temp.expect_error(statement text, expected_state text, description text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE caught text;
BEGIN
 BEGIN EXECUTE statement; EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS caught = RETURNED_SQLSTATE; END;
 PERFORM pg_temp.assert_true(caught = expected_state, description || ' SQLSTATE=' || coalesce(caught,'NO ERROR'));
END $$;

-- Explicit fictional identities, never a production account or a privileged signup.
INSERT INTO auth.users(id,email) VALUES
 ('00000000-0000-0000-0000-000000000001','admin@poc.invalid'),
 ('00000000-0000-0000-0000-000000000002','editor@poc.invalid'),
 ('00000000-0000-0000-0000-000000000003','cidadao@poc.invalid');
SELECT pg_temp.assert_true(NOT EXISTS(SELECT 1 FROM public.user_roles), 'signup never creates staff');
INSERT INTO public.user_roles(user_id,role) VALUES
 ('00000000-0000-0000-0000-000000000001','admin'),
 ('00000000-0000-0000-0000-000000000002','editor');
INSERT INTO public.permissoes_modulo(user_id,tabela)
VALUES ('00000000-0000-0000-0000-000000000002','noticias');
INSERT INTO public.convenios(id,numero,concedente,convenente,objeto,valor_global)
VALUES ('10000000-0000-0000-0000-000000000001','POC-FICTICIO-001','Concedente ficticio','Convenente ficticio','Somente teste',10000);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
SELECT pg_temp.expect_error(
 $$INSERT INTO public.convenio_parcelas(convenio_id,numero,valor) VALUES ('10000000-0000-0000-0000-000000000001',1,100)$$,
 '42501','citizen cannot insert installment');
SELECT pg_temp.expect_error(
 $$SELECT public.prorrogar_esic('20000000-0000-0000-0000-000000000001','Justificativa ficticia')$$,
 'P0001','citizen cannot extend SIC');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
SELECT pg_temp.expect_error(
 $$INSERT INTO public.convenio_obrigacoes(convenio_id,titulo) VALUES ('10000000-0000-0000-0000-000000000001','Obrigacao ficticia')$$,
 '42501','editor restricted to noticias cannot write convenio');

SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
INSERT INTO public.convenio_parcelas(id,convenio_id,numero,valor)
VALUES ('11000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',1,1000);
INSERT INTO public.convenio_obrigacoes(convenio_id,titulo) VALUES ('10000000-0000-0000-0000-000000000001','Obrigacao ficticia');
SELECT pg_temp.expect_error(
 $$INSERT INTO public.convenio_parcelas(convenio_id,numero,valor) VALUES ('10000000-0000-0000-0000-000000000001',1,100)$$,
 '23505','installment number unique within convenio');
SELECT pg_temp.expect_error(
 $$INSERT INTO public.convenio_parcelas(convenio_id,numero,valor) VALUES ('10000000-0000-0000-0000-000000000001',2,-1)$$,
 '23514','negative installment rejected');
SELECT pg_temp.expect_error(
 $$INSERT INTO public.convenio_obrigacoes(convenio_id,titulo) VALUES ('99999999-0000-0000-0000-000000000099','Orphan')$$,
 '23503','orphan obligation rejected');
UPDATE public.convenio_parcelas SET status='Recebida', recebido_em=current_date WHERE id='11000000-0000-0000-0000-000000000001';
SELECT pg_temp.assert_true((SELECT status='Recebida' FROM public.convenio_parcelas WHERE id='11000000-0000-0000-0000-000000000001'),'admin updates installment');

SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
WITH changed AS (UPDATE public.convenio_parcelas SET valor=1 WHERE id='11000000-0000-0000-0000-000000000001' RETURNING 1)
SELECT pg_temp.assert_true((SELECT count(*)=0 FROM changed),'restricted editor cannot update installment');
WITH removed AS (DELETE FROM public.convenio_obrigacoes WHERE convenio_id='10000000-0000-0000-0000-000000000001' RETURNING 1)
SELECT pg_temp.assert_true((SELECT count(*)=0 FROM removed),'restricted editor cannot delete obligation');
SELECT pg_temp.assert_true((SELECT count(*)=0 FROM public.auditoria),'editor cannot read audit');

RESET ROLE;
INSERT INTO public.atendimentos(id,protocolo,assunto,mensagem,email,created_at) VALUES
 ('20000000-0000-0000-0000-000000000001','PF-POC-IDENTIFICADO','Pedido ficticio','Mensagem ficticia de teste','cidadao@poc.invalid',now()),
 ('20000000-0000-0000-0000-000000000002','PF-POC-VENCIDO','Pedido vencido','Mensagem ficticia de teste','cidadao@poc.invalid',now()-interval '21 days');
INSERT INTO public.atendimentos(protocolo,canal,anonimo,assunto,mensagem)
VALUES ('PF2026ABCDEF0123456789ABCDEF0123456789','ouvidoria',true,'Anonimo ficticio','Mensagem ficticia de teste');

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub','',true);
SELECT pg_temp.assert_true(NOT has_function_privilege('public.consultar_protocolo(text)','EXECUTE'),'legacy protocol RPC revoked for anon');
SELECT pg_temp.expect_error($$SELECT * FROM public.atendimentos$$,'42501','anon cannot read raw SIC');
SELECT pg_temp.assert_true((SELECT count(*)=0 FROM public.consultar_protocolo_seguro('PF-POC-IDENTIFICADO','errado@poc.invalid')),'wrong email reveals nothing');
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.consultar_protocolo_seguro(' pf-poc-identificado ',' CIDADAO@POC.INVALID ')),'correct email and normalized protocol work');
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.consultar_protocolo_seguro('PF2026ABCDEF0123456789ABCDEF0123456789','')),'anonymous bearer protocol works');
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.convenio_parcelas WHERE id='11000000-0000-0000-0000-000000000001'),'public can read installment');
SELECT pg_temp.expect_error(
 $$INSERT INTO public.convenio_parcelas(convenio_id,numero,valor) VALUES ('10000000-0000-0000-0000-000000000001',2,10)$$,
 '42501','anon cannot write installment');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
SELECT pg_temp.assert_true(NOT has_function_privilege('public.consultar_protocolo(text)','EXECUTE'),'legacy protocol RPC revoked for authenticated');
SELECT pg_temp.expect_error(
 $$SELECT public.prorrogar_esic('20000000-0000-0000-0000-000000000001','curta')$$,
 'P0001','short justification rejected');
SELECT public.prorrogar_esic('20000000-0000-0000-0000-000000000001','Justificativa ficticia com detalhes');
SELECT pg_temp.assert_true(
 (SELECT prazo_final=(created_at AT TIME ZONE 'America/Fortaleza')::date+30 FROM public.consultar_protocolo_seguro('PF-POC-IDENTIFICADO','cidadao@poc.invalid')),
 'extension gives 30 calendar days in municipal timezone');
SELECT pg_temp.expect_error(
 $$SELECT public.prorrogar_esic('20000000-0000-0000-0000-000000000001','Outra justificativa ficticia')$$,
 'P0001','second extension rejected');
SELECT pg_temp.expect_error(
 $$SELECT public.prorrogar_esic('20000000-0000-0000-0000-000000000002','Justificativa fora do prazo')$$,
 'P0001','expired request cannot be extended');
SELECT public.encaminhar_atendimento('20000000-0000-0000-0000-000000000001','Setor ficticio');
SELECT public.responder_atendimento('20000000-0000-0000-0000-000000000001','Resposta ficticia para teste');
SELECT pg_temp.expect_error(
 $$SELECT public.encaminhar_atendimento('20000000-0000-0000-0000-000000000001','Outro setor')$$,
 'P0001','answered request cannot be forwarded');

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub','',true);
SELECT pg_temp.expect_error(
 $$SELECT public.registrar_recurso_esic('PF-POC-IDENTIFICADO','errado@poc.invalid','Mensagem ficticia de recurso')$$,
 'P0001','appeal with wrong email rejected');
SELECT pg_temp.assert_true(
 length(public.registrar_recurso_esic('PF-POC-IDENTIFICADO','cidadao@poc.invalid','Mensagem ficticia de recurso'))=38,
 'appeal generates unpredictable 38-character protocol');
SELECT pg_temp.expect_error(
 $$SELECT public.registrar_recurso_esic('PF-POC-IDENTIFICADO','cidadao@poc.invalid','Outra mensagem ficticia de recurso')$$,
 'P0001','duplicate appeal rejected');

RESET ROLE;
SELECT pg_temp.assert_true(
 (SELECT count(*)>=4 FROM public.auditoria WHERE tabela='atendimentos' AND registro_id='20000000-0000-0000-0000-000000000001'),
 'SIC decisions audited');
SELECT pg_temp.assert_true(
 EXISTS(SELECT 1 FROM public.auditoria WHERE tabela='convenio_parcelas' AND acao='UPDATE'),
 'installment changes audited');
INSERT INTO public.publicacoes(categoria,titulo,beneficiario,destino,justificativa)
VALUES ('diaria','POC FICTICIA','Pessoa ficticia','Destino ficticio','Justificativa ficticia');
SELECT pg_temp.assert_true(
 EXISTS(SELECT 1 FROM public.publicacoes WHERE titulo='POC FICTICIA' AND beneficiario='Pessoa ficticia' AND destino='Destino ficticio' AND justificativa='Justificativa ficticia'),
 '0011 metadata persists');

-- M04 4.2/4.11: two real contracts point to the same convenio.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
INSERT INTO public.contratos(id,numero,fornecedor,objeto,valor,convenio_id) VALUES
 ('30000000-0000-0000-0000-000000000001','POC-CONTRATO-1','Fornecedor ficticio','Teste de vinculo',1000,'10000000-0000-0000-0000-000000000001'),
 ('30000000-0000-0000-0000-000000000002','POC-CONTRATO-2','Fornecedor ficticio','Outro vinculo',2000,'10000000-0000-0000-0000-000000000001');
SELECT pg_temp.assert_true(
 (SELECT count(*)=2 AND sum(valor)=3000 FROM public.contratos WHERE convenio_id='10000000-0000-0000-0000-000000000001'),
 'multiple contracts persist for one convenio');
SELECT pg_temp.expect_error(
 $INSERT INTO public.contratos(numero,fornecedor,objeto,convenio_id) VALUES ('POC-ORFAO','Ficticio','Teste','99999999-0000-0000-0000-000000000099')$,
 '23503','orphan contract-convenio link rejected');
SELECT pg_temp.expect_error(
 $DELETE FROM public.convenios WHERE id='10000000-0000-0000-0000-000000000001'$,
 '23503','convenio with contracts cannot be silently deleted');
INSERT INTO public.convenio_entidades(papel,nome,responsavel) VALUES
 ('concedente','Entidade concedente ficticia','Responsavel ficticio'),
 ('convenente','Entidade convenente ficticia','Responsavel ficticio');
INSERT INTO public.convenio_tipos(nome,descricao) VALUES ('Categoria ficticia','Somente PoC');
SELECT pg_temp.expect_error(
 $INSERT INTO public.convenio_entidades(papel,nome) VALUES ('outro','Entidade ficticia')$,
 '23514','entity role constrained');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
SELECT pg_temp.expect_error(
 $INSERT INTO public.convenio_tipos(nome) VALUES ('Sem permissao')$,
 '42501','restricted editor cannot create convenio categories');
SET LOCAL ROLE anon;
SELECT pg_temp.assert_true(
 (SELECT count(*)=2 FROM public.contratos WHERE convenio_id='10000000-0000-0000-0000-000000000001'),
 'public sees multiple linked contracts');
SELECT pg_temp.assert_true(
 EXISTS(SELECT 1 FROM public.convenio_tipos WHERE nome='Categoria ficticia'),
 'public sees convenio categories');
RESET ROLE;

ROLLBACK;
\echo 'Sprint 5 SQL assertions completed; all test data rolled back.'
