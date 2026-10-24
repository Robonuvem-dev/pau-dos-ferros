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

INSERT INTO auth.users(id,email) VALUES('00000000-0000-0000-0000-000000000031','admin-carga@poc.invalid'),('00000000-0000-0000-0000-000000000032','editor-carga@poc.invalid');
INSERT INTO public.user_roles(user_id,role) VALUES('00000000-0000-0000-0000-000000000031','admin'),('00000000-0000-0000-0000-000000000032','editor');
INSERT INTO public.permissoes_modulo(user_id,tabela) VALUES('00000000-0000-0000-0000-000000000032','noticias');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000031',true);
SELECT pg_temp.assert_true(public.importar_dados_poc('credores','POC-CARGA','[{"nome":"POC fornecedor","cpf_cnpj":"POC-SEM-CNPJ","tipo":"Pessoa jurídica","chave_externa":"C1"}]')=1,'synthetic creditor imported');
SELECT pg_temp.assert_true(public.importar_dados_poc('agentes-politicos','POC-CARGA','[{"nome":"POC agente","cargo":"POC cargo","email":"agente@teste.invalid","chave_externa":"A1"}]')=1,'synthetic public agent imported');
SELECT pg_temp.expect_error($q$SELECT public.importar_dados_poc('agentes-politicos','POC-CARGA','[{"nome":"POC repetido","cargo":"POC cargo","chave_externa":"A1"}]')$q$,'23505','agent duplicate prevented');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000032',true);
SELECT pg_temp.expect_error($q$SELECT public.importar_dados_poc('agentes-politicos','POC-CARGA','[{"nome":"POC sem acesso","cargo":"POC cargo","chave_externa":"A2"}]')$q$,'42501','agent table permission respected');
SET LOCAL ROLE anon;
SELECT pg_temp.assert_true(EXISTS(SELECT 1 FROM public.agentes_politicos WHERE email='agente@teste.invalid'),'synthetic agent visible publicly');
RESET ROLE;
ROLLBACK;
