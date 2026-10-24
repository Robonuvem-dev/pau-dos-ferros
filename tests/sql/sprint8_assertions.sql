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

INSERT INTO auth.users(id,email) VALUES ('00000000-0000-0000-0000-000000000021','admin-s8@poc.invalid'),('00000000-0000-0000-0000-000000000022','editor-s8@poc.invalid');
INSERT INTO public.user_roles(user_id,role) VALUES ('00000000-0000-0000-0000-000000000021','admin'),('00000000-0000-0000-0000-000000000022','editor');
INSERT INTO public.permissoes_modulo(user_id,tabela) VALUES ('00000000-0000-0000-0000-000000000022','noticias');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000021',true);
INSERT INTO public.obras(id,nome,numero_processo,secretaria,origem_recurso) VALUES('80000000-0000-0000-0000-000000000001','POC obra','POC-1','POC Secretaria','Recurso ficticio');
INSERT INTO public.obra_andamentos(obra_id,data,descricao,percentual,valor_executado) VALUES ('80000000-0000-0000-0000-000000000001','2026-10-23','POC andamento',40,400);
INSERT INTO public.obra_medicoes(obra_id,numero,data,descricao,valor,aprovada) VALUES ('80000000-0000-0000-0000-000000000001','M1','2026-10-23','POC medicao',400,true);
INSERT INTO public.obra_arts(obra_id,numero,responsavel) VALUES ('80000000-0000-0000-0000-000000000001','ART-POC','Engenheiro ficticio');
INSERT INTO public.obra_fotos(obra_id,data,legenda,foto_url) VALUES ('80000000-0000-0000-0000-000000000001','2026-10-23','Foto ficticia','https://example.invalid/poc.jpg');
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.obra_medicoes WHERE aprovada),'approved measurement persists');
SELECT pg_temp.expect_error($q$INSERT INTO public.obra_andamentos(obra_id,data,descricao,percentual) VALUES ('80000000-0000-0000-0000-000000000001','2026-10-23','Invalido',101)$q$,'23514','physical percentage constrained');
SELECT pg_temp.expect_error($q$INSERT INTO public.obra_medicoes(obra_id,numero,data,descricao,valor) VALUES ('ffffffff-ffff-ffff-ffff-ffffffffffff','M2','2026-10-23','Orfa',10)$q$,'23503','orphan measurement rejected');
SELECT pg_temp.expect_error($q$DELETE FROM public.obras WHERE id='80000000-0000-0000-0000-000000000001'$q$,'23503','work history prevents silent parent deletion');
INSERT INTO public.planos_diretores(id,nome) VALUES('80000000-0000-0000-0000-000000000002','POC plano diretor');
INSERT INTO public.plano_diretor_eixos(id,plano_id,nome) VALUES('80000000-0000-0000-0000-000000000003','80000000-0000-0000-0000-000000000002','POC eixo');
INSERT INTO public.plano_diretor_acoes(plano_id,eixo_id,nome) VALUES('80000000-0000-0000-0000-000000000002','80000000-0000-0000-0000-000000000003','POC acao');
INSERT INTO public.plano_diretor_fases(plano_id,nome) VALUES('80000000-0000-0000-0000-000000000002','POC fase');
INSERT INTO public.plano_diretor_equipe(plano_id,nome) VALUES('80000000-0000-0000-0000-000000000002','POC integrante');
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.plano_diretor_acoes),'strategic actions persist');
INSERT INTO public.planos_diretores(id,nome) VALUES('80000000-0000-0000-0000-000000000005','POC outro plano');
SELECT pg_temp.expect_error($q$INSERT INTO public.plano_diretor_acoes(plano_id,eixo_id,nome) VALUES('80000000-0000-0000-0000-000000000005','80000000-0000-0000-0000-000000000003','Eixo de outro plano')$q$,'23503','axis from other plan rejected');
INSERT INTO public.conselhos(id,nome,lei_criacao,competencias,data_criacao) VALUES('80000000-0000-0000-0000-000000000004','POC conselho','POC lei','Competencias ficticias','2026-10-23');
INSERT INTO public.conselho_membros(conselho_id,nome,tipo,representacao,ativo) VALUES('80000000-0000-0000-0000-000000000004','POC membro','Titular','Sociedade civil',true);
INSERT INTO public.conselho_acoes(conselho_id,tipo,titulo,data) VALUES('80000000-0000-0000-0000-000000000004','Ata','POC reuniao','2026-10-23');
INSERT INTO public.publicacoes(categoria,titulo,conselho_id) VALUES('conselho-doc','POC documento','80000000-0000-0000-0000-000000000004');
SELECT pg_temp.expect_error($q$INSERT INTO public.conselho_membros(conselho_id,nome,tipo,representacao) VALUES('80000000-0000-0000-0000-000000000004','POC invalido','Inventado','Governo')$q$,'23514','member type constrained');
INSERT INTO public.publicacoes(categoria,titulo,data,casos_confirmados,obitos,acao_emergencial) VALUES('covid','POC boletim','2026-10-23',10,0,'COVID-19');
SELECT pg_temp.expect_error($q$INSERT INTO public.publicacoes(categoria,titulo,obitos) VALUES('covid','POC invalido',-1)$q$,'23514','epidemiological totals nonnegative');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000022',true);
SELECT pg_temp.expect_error($q$INSERT INTO public.obra_arts(obra_id,numero,responsavel) VALUES('80000000-0000-0000-0000-000000000001','SEM-PERMISSAO','POC')$q$,'42501','restricted editor cannot edit work child');
SELECT pg_temp.expect_error($q$INSERT INTO public.conselho_acoes(conselho_id,tipo,titulo,data) VALUES('80000000-0000-0000-0000-000000000004','Ata','SEM-PERMISSAO','2026-10-23')$q$,'42501','restricted editor cannot edit council child');
SET LOCAL ROLE anon;
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.obra_fotos),'public photos with date available');
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.conselho_membros),'public council members available');
SELECT pg_temp.expect_error($q$INSERT INTO public.planos_diretores(nome) VALUES('SEM-PERMISSAO')$q$,'42501','anonymous write denied');
RESET ROLE;
SELECT pg_temp.assert_true((SELECT count(*)>=8 FROM public.auditoria WHERE tabela IN ('obra_arts','obra_fotos','obra_medicoes','obra_andamentos','conselho_membros','conselho_acoes','plano_diretor_acoes','plano_diretor_equipe')),'child record actions audited');

-- M10.1: persistencia, campos obrigatorios, FK e permissao herdada de obras.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000021',true);
INSERT INTO public.contratos(id,numero,fornecedor,objeto,valor) VALUES('81000000-0000-0000-0000-000000000001','POC-ENG-1','POC Fornecedor','POC Contrato ficticio',1000);
INSERT INTO public.processos_engenharia(id,numero,data_processo,valor_contrato_inicial,contrato_id,fonte_recurso) VALUES('81000000-0000-0000-0000-000000000002','POC Processo 1','2026-10-24',1000,'81000000-0000-0000-0000-000000000001','POC Recurso');
UPDATE public.obras SET processo_engenharia_id='81000000-0000-0000-0000-000000000002' WHERE id='80000000-0000-0000-0000-000000000001';
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.processos_engenharia),'engineering process persists');
SELECT pg_temp.expect_error($q$INSERT INTO public.processos_engenharia(numero,data_processo,valor_contrato_inicial,contrato_id,fonte_recurso) VALUES('POC','2026-10-24',1,'ffffffff-ffff-ffff-ffff-ffffffffffff','POC')$q$,'23503','engineering contract must exist');
SELECT pg_temp.expect_error($q$INSERT INTO public.processos_engenharia(numero,data_processo,valor_contrato_inicial,contrato_id,fonte_recurso) VALUES('POC',NULL,1,'81000000-0000-0000-0000-000000000001','POC')$q$,'23502','engineering process date mandatory');
SELECT pg_temp.expect_error($q$INSERT INTO public.processos_engenharia(numero,data_processo,valor_contrato_inicial,contrato_id,fonte_recurso) VALUES('POC','2026-10-24',-1,'81000000-0000-0000-0000-000000000001','POC')$q$,'23514','engineering initial value nonnegative');
SELECT pg_temp.expect_error($q$INSERT INTO public.processos_engenharia(numero,data_processo,valor_contrato_inicial,contrato_id,fonte_recurso) VALUES('POC','2026-10-24',1,'81000000-0000-0000-0000-000000000001','   ')$q$,'23514','engineering resource mandatory');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000022',true);
UPDATE public.processos_engenharia SET numero='Sem permissao';
SELECT pg_temp.assert_true((SELECT numero='POC Processo 1' FROM public.processos_engenharia LIMIT 1),'unpermitted editor cannot change engineering');
SET LOCAL ROLE anon;
SELECT pg_temp.assert_true((SELECT count(*)=1 FROM public.processos_engenharia),'engineering process publicly readable');
RESET ROLE;

ROLLBACK;
