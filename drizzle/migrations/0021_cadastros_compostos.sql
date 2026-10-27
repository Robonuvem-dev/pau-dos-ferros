CREATE TABLE public.convenio_aplicacoes(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),convenio_id uuid NOT NULL REFERENCES public.convenios(id) ON DELETE RESTRICT,
 descricao text NOT NULL CHECK(length(trim(descricao))>0),natureza text NOT NULL CHECK(length(trim(natureza))>0),
 valor numeric(14,2) NOT NULL CHECK(valor>=0),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.convenio_aplicacoes ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.convenio_aplicacoes TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.convenio_aplicacoes TO authenticated;
GRANT ALL ON public.convenio_aplicacoes TO service_role;
CREATE POLICY "public read" ON public.convenio_aplicacoes FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "staff insert" ON public.convenio_aplicacoes FOR INSERT TO authenticated WITH CHECK(public.pode_editar(auth.uid(),'convenios'));
CREATE POLICY "staff update" ON public.convenio_aplicacoes FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'convenios')) WITH CHECK(public.pode_editar(auth.uid(),'convenios'));
CREATE POLICY "staff delete" ON public.convenio_aplicacoes FOR DELETE TO authenticated USING(public.pode_editar(auth.uid(),'convenios'));
CREATE TRIGGER touch_convenio_aplicacoes BEFORE UPDATE ON public.convenio_aplicacoes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_convenio_aplicacoes AFTER INSERT OR UPDATE OR DELETE ON public.convenio_aplicacoes FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE FUNCTION public.validar_componentes_poc() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE targets uuid[]; target uuid; total numeric; limite numeric;
BEGIN
 IF TG_TABLE_NAME IN ('convenios','planos_diretores') THEN targets:=ARRAY[NEW.id];
 ELSIF TG_TABLE_NAME LIKE 'convenio_%' THEN
  IF TG_OP='INSERT' THEN targets:=ARRAY[NEW.convenio_id]; ELSIF TG_OP='DELETE' THEN targets:=ARRAY[OLD.convenio_id]; ELSE targets:=ARRAY[OLD.convenio_id,NEW.convenio_id]; END IF;
 ELSE
  IF TG_OP='INSERT' THEN targets:=ARRAY[NEW.plano_id]; ELSIF TG_OP='DELETE' THEN targets:=ARRAY[OLD.plano_id]; ELSE targets:=ARRAY[OLD.plano_id,NEW.plano_id]; END IF;
 END IF;
 FOREACH target IN ARRAY targets LOOP
  IF TG_TABLE_NAME='convenios' OR TG_TABLE_NAME LIKE 'convenio_%' THEN
   SELECT valor_global INTO limite FROM public.convenios WHERE id=target FOR NO KEY UPDATE;
   IF NOT FOUND THEN CONTINUE; END IF;
   IF NOT EXISTS(SELECT 1 FROM public.convenio_parcelas WHERE convenio_id=target) THEN RAISE EXCEPTION 'Convênio deve possuir ao menos uma parcela com cronograma' USING ERRCODE='23514'; END IF;
   SELECT coalesce(sum(valor),0) INTO total FROM public.convenio_aplicacoes WHERE convenio_id=target;
   IF total>limite THEN RAISE EXCEPTION 'Plano de aplicação excede o valor global do convênio' USING ERRCODE='23514'; END IF;
  ELSE
   PERFORM 1 FROM public.planos_diretores WHERE id=target FOR NO KEY UPDATE;
   IF NOT FOUND THEN CONTINUE; END IF;
   IF NOT EXISTS(SELECT 1 FROM public.plano_diretor_fases WHERE plano_id=target)
    OR NOT EXISTS(SELECT 1 FROM public.plano_diretor_equipe WHERE plano_id=target)
    OR NOT EXISTS(SELECT 1 FROM public.plano_diretor_eixos WHERE plano_id=target)
    OR NOT EXISTS(SELECT 1 FROM public.plano_diretor_acoes WHERE plano_id=target)
   THEN RAISE EXCEPTION 'Plano Diretor exige fase, equipe, eixo e ação estratégica' USING ERRCODE='23514'; END IF;
  END IF;
 END LOOP;
 RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.validar_componentes_poc() FROM PUBLIC;
CREATE CONSTRAINT TRIGGER convenio_componentes AFTER INSERT OR UPDATE ON public.convenios DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.validar_componentes_poc();
CREATE CONSTRAINT TRIGGER parcela_componentes AFTER INSERT OR UPDATE OR DELETE ON public.convenio_parcelas DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.validar_componentes_poc();
CREATE CONSTRAINT TRIGGER aplicacao_componentes AFTER INSERT OR UPDATE OR DELETE ON public.convenio_aplicacoes DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.validar_componentes_poc();
CREATE CONSTRAINT TRIGGER plano_componentes AFTER INSERT OR UPDATE ON public.planos_diretores DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.validar_componentes_poc();
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['plano_diretor_fases','plano_diretor_equipe','plano_diretor_eixos','plano_diretor_acoes'] LOOP
  EXECUTE format('CREATE CONSTRAINT TRIGGER componente_plano AFTER INSERT OR UPDATE OR DELETE ON public.%I DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.validar_componentes_poc()',t);
 END LOOP;
END $$;

-- Um único comando evita pais incompletos quando a gravação dos filhos falha.
CREATE FUNCTION public.salvar_cadastro_composto(_modulo text,_dados jsonb,_id uuid DEFAULT NULL,_complementos jsonb DEFAULT '{}'::jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE tabela text; permissao text; k text; cols text; target uuid; eixo uuid; parcela jsonb;
BEGIN
 tabela:=CASE _modulo WHEN 'convenios' THEN 'convenios' WHEN 'plano-diretor' THEN 'planos_diretores' ELSE NULL END;
 permissao:=CASE _modulo WHEN 'convenios' THEN 'convenios' ELSE 'obras' END;
 IF tabela IS NULL OR auth.uid() IS NULL OR NOT public.pode_editar(auth.uid(),permissao) THEN RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
 IF jsonb_typeof(_dados) IS DISTINCT FROM 'object' OR jsonb_typeof(_complementos) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Cadastro inválido'; END IF;
 FOR k IN SELECT jsonb_object_keys(_dados) LOOP
  IF k IN ('id','created_at','updated_at') OR NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=tabela AND column_name=k) THEN RAISE EXCEPTION 'Campo não permitido: %',k; END IF;
 END LOOP;
 SELECT string_agg(quote_ident(key),',') INTO cols FROM jsonb_object_keys(_dados) key;
 IF cols IS NULL THEN RAISE EXCEPTION 'Cadastro vazio'; END IF;
 IF _id IS NULL THEN
  EXECUTE format('INSERT INTO public.%1$I(%2$s) SELECT %2$s FROM jsonb_populate_record(NULL::public.%1$I,$1) RETURNING id',tabela,cols) INTO target USING _dados;
 ELSE
  EXECUTE format('UPDATE public.%1$I SET (%2$s)=(SELECT %2$s FROM jsonb_populate_record(NULL::public.%1$I,$1)) WHERE id=$2 RETURNING id',tabela,cols) INTO target USING _dados,_id;
  IF target IS NULL THEN RAISE EXCEPTION 'Registro inexistente ou sem permissão' USING ERRCODE='42501'; END IF;
 END IF;
 IF _modulo='convenios' THEN
  parcela:=_complementos->'parcela';
  IF parcela IS NOT NULL AND parcela<>'null'::jsonb THEN
   IF jsonb_typeof(parcela->'valor') IS DISTINCT FROM 'number' OR nullif(parcela->>'vencimento','') IS NULL THEN RAISE EXCEPTION 'Informe valor e vencimento da parcela inicial' USING ERRCODE='23514'; END IF;
   INSERT INTO public.convenio_parcelas(convenio_id,numero,valor,vencimento,status) SELECT target,coalesce(max(numero),0)+1,(parcela->>'valor')::numeric,(parcela->>'vencimento')::date,'Programada' FROM public.convenio_parcelas WHERE convenio_id=target;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.convenio_parcelas WHERE convenio_id=target) THEN RAISE EXCEPTION 'Informe a primeira parcela do convênio' USING ERRCODE='23514'; END IF;
 ELSE
  IF nullif(trim(_complementos->>'fase'),'') IS NOT NULL THEN INSERT INTO public.plano_diretor_fases(plano_id,nome) VALUES(target,_complementos->>'fase'); END IF;
  IF nullif(trim(_complementos->>'integrante'),'') IS NOT NULL THEN INSERT INTO public.plano_diretor_equipe(plano_id,nome) VALUES(target,_complementos->>'integrante'); END IF;
  SELECT id INTO eixo FROM public.plano_diretor_eixos WHERE plano_id=target ORDER BY created_at,id LIMIT 1;
  IF nullif(trim(_complementos->>'eixo'),'') IS NOT NULL THEN INSERT INTO public.plano_diretor_eixos(plano_id,nome) VALUES(target,_complementos->>'eixo') RETURNING id INTO eixo; END IF;
  IF nullif(trim(_complementos->>'acao'),'') IS NOT NULL THEN INSERT INTO public.plano_diretor_acoes(plano_id,eixo_id,nome) VALUES(target,eixo,_complementos->>'acao'); END IF;
  IF NOT EXISTS(SELECT 1 FROM public.plano_diretor_fases WHERE plano_id=target) OR NOT EXISTS(SELECT 1 FROM public.plano_diretor_equipe WHERE plano_id=target) OR NOT EXISTS(SELECT 1 FROM public.plano_diretor_eixos WHERE plano_id=target) OR NOT EXISTS(SELECT 1 FROM public.plano_diretor_acoes WHERE plano_id=target) THEN RAISE EXCEPTION 'Preencha fase, equipe, eixo e ação do Plano Diretor' USING ERRCODE='23514'; END IF;
 END IF;
 RETURN target;
END $$;
REVOKE ALL ON FUNCTION public.salvar_cadastro_composto(text,jsonb,uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.salvar_cadastro_composto(text,jsonb,uuid,jsonb) TO authenticated;
