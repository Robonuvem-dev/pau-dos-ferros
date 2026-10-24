-- PostgreSQL descartavel apenas; rollback integral.
BEGIN;
CREATE FUNCTION pg_temp.assert_true(ok boolean,label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'ASSERT: %',label; END IF; RAISE NOTICE 'PASS: %',label; END $$;
CREATE FUNCTION pg_temp.expect_error(stmt text,code text,label text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE caught text; BEGIN
 BEGIN EXECUTE stmt; EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS caught=RETURNED_SQLSTATE; END;
 IF caught IS DISTINCT FROM code THEN RAISE EXCEPTION 'ASSERT: %, wanted %, got %',label,code,caught; END IF;
 RAISE NOTICE 'PASS: %',label;
END $$;
INSERT INTO auth.users(id,email) VALUES
 ('00000000-0000-0000-0000-000000000011','admin-s6@poc.invalid'),
 ('00000000-0000-0000-0000-000000000012','editor-s6@poc.invalid');
INSERT INTO public.user_roles(user_id,role) VALUES
 ('00000000-0000-0000-0000-000000000011','admin'),
 ('00000000-0000-0000-0000-000000000012','editor');
INSERT INTO public.permissoes_modulo(user_id,tabela) VALUES ('00000000-0000-0000-0000-000000000012','noticias');
SET LOCAL ROLE anon;
SELECT pg_temp.expect_error($q$SELECT public.importar_dados_poc('receitas','POC','[]')$q$,'42501','anon cannot import');
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000012',true);
SELECT pg_temp.expect_error($q$SELECT public.importar_dados_poc('receitas','POC','[{"ano":2026,"mes":10,"categoria":"Teste","chave_externa":"1"}]')$q$,'42501','restricted editor cannot import');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000011',true);
SELECT pg_temp.assert_true(public.importar_dados_poc('receitas','POC-S6','[{"ano":2026,"mes":10,"categoria":"Ficticia","natureza":"Extraorçamentária","arrecadado":1234.56,"chave_externa":"R1"}]')=1,'admin imports receipt');
SELECT pg_temp.assert_true((SELECT arrecadado=1234.56 AND natureza='Extraorçamentária' FROM public.receitas WHERE origem='POC-S6' AND chave_externa='R1'),'receipt persisted with classification and cents');
SELECT pg_temp.expect_error($q$SELECT public.importar_dados_poc('receitas','POC-S6','[{"ano":2026,"mes":10,"categoria":"Ficticia","chave_externa":"R1"}]')$q$,'23505','duplicate import rejected');
SELECT pg_temp.expect_error($q$SELECT public.importar_dados_poc('receitas','POC-S6','[{"ano":2026,"mes":10,"categoria":"Ficticia","chave_externa":"ROLLBACK"},{"ano":2026,"mes":13,"categoria":"Ficticia","chave_externa":"INVALID"}]')$q$,'23514','invalid last row rejects whole batch');
SELECT pg_temp.assert_true(NOT EXISTS(SELECT 1 FROM public.receitas WHERE chave_externa='ROLLBACK'),'no partial rows survive');
SELECT pg_temp.expect_error($q$SELECT public.importar_dados_poc('receitas','POC-S6','[{"ano":2026,"mes":10,"categoria":"Ficticia","chave_externa":"X","id":"ffffffff-ffff-ffff-ffff-ffffffffffff"}]')$q$,'P0001','protected columns rejected');
SELECT pg_temp.expect_error($q$SELECT public.importar_dados_poc('receitas','POC-S6','[{"ano":2026,"mes":10,"categoria":" ","chave_externa":"X"}]')$q$,'P0001','blank required value rejected');
SELECT pg_temp.expect_error($q$SELECT public.importar_dados_poc('user_roles','POC-S6','[{"role":"admin"}]')$q$,'P0001','unsupported target rejected');
SELECT pg_temp.assert_true(public.importar_dados_poc('despesas','POC-S6','[{"ano":2026,"mes":10,"orgao":"Ficticio","credor":"Credor ficticio","natureza":"Orçamentária","empenho":"E-1","empenhado":1000,"liquidacao":"L-1","liquidado":600,"ordem_bancaria":"OB-1","pago":200,"chave_externa":"D1"}]')=1,'expense with stages imported');
SELECT pg_temp.assert_true(public.importar_dados_poc('servidores','POC-FOLHA','[{"nome":"Pessoa ficticia","competencia":"2026-10","cargo":"Cargo ficticio","subsidio":1000,"vantagens":300,"descontos":100,"remuneracao":1200,"chave_externa":"S1"}]')=1,'payroll components imported');
SELECT pg_temp.expect_error($q$SELECT public.importar_dados_poc('servidores','POC-FOLHA','[{"nome":"Pessoa ficticia","competencia":"2026-10","descontos":-1,"chave_externa":"S2"}]')$q$,'23514','negative deduction rejected');
INSERT INTO public.medicamentos(descricao,unidade_compra,unidade_estoque,grupo,subgrupo,categoria,subcategoria)
 VALUES('POC medicamento ficticio','Caixa','Unidade','Grupo','Subgrupo','Categoria','Subcategoria');
SET LOCAL ROLE anon;
SELECT pg_temp.assert_true(EXISTS(SELECT 1 FROM public.medicamentos WHERE descricao='POC medicamento ficticio'),'medicine publicly available');
SELECT pg_temp.assert_true((SELECT ordem_bancaria='OB-1' FROM public.despesas WHERE chave_externa='D1'),'public banking-order reference available');
SELECT pg_temp.assert_true((SELECT subsidio=1000 AND vantagens=300 AND descontos=100 FROM public.servidores WHERE chave_externa='S1'),'public payroll details available');
RESET ROLE;
SELECT pg_temp.assert_true((SELECT count(*)>=3 FROM public.auditoria WHERE tabela IN ('receitas','despesas','servidores') AND acao='INSERT'),'import audit produced');
ROLLBACK;
