-- Sprints 6/7: classificacao fiscal, detalhamento da folha e importacao atomica.
ALTER TABLE public.receitas
 ADD COLUMN natureza text CHECK (natureza IN ('Orçamentária','Extraorçamentária')),
 ADD COLUMN data_receita date,
 ADD COLUMN codigo_receita text,
 ADD COLUMN fonte_recurso text,
 ADD COLUMN origem text,
 ADD COLUMN chave_externa text;
ALTER TABLE public.despesas
 ADD COLUMN natureza text CHECK (natureza IN ('Orçamentária','Extraorçamentária')),
 ADD COLUMN processo text,
 ADD COLUMN data_empenho date,
 ADD COLUMN liquidacao text,
 ADD COLUMN data_liquidacao date,
 ADD COLUMN ordem_bancaria text,
 ADD COLUMN data_pagamento date,
 ADD COLUMN fonte_recurso text,
 ADD COLUMN origem text,
 ADD COLUMN chave_externa text;
ALTER TABLE public.servidores
 ADD COLUMN subsidio numeric(14,2),
 ADD COLUMN vantagens numeric(14,2),
 ADD COLUMN descontos numeric(14,2),
 ADD COLUMN origem text,
 ADD COLUMN chave_externa text;
-- Legado sem classificacao permanece explicitamente sem classificacao; nao inferir natureza.
ALTER TABLE public.receitas ADD CONSTRAINT receitas_mes_valido CHECK (mes BETWEEN 1 AND 12) NOT VALID;
ALTER TABLE public.despesas ADD CONSTRAINT despesas_mes_valido CHECK (mes BETWEEN 1 AND 12) NOT VALID;
ALTER TABLE public.servidores ADD CONSTRAINT servidores_componentes_validos CHECK (
 (subsidio IS NULL OR subsidio>=0) AND (vantagens IS NULL OR vantagens>=0) AND (descontos IS NULL OR descontos>=0)
) NOT VALID;
CREATE TABLE public.medicamentos (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 descricao text NOT NULL CHECK (length(trim(descricao))>0),
 unidade_compra text NOT NULL CHECK (length(trim(unidade_compra))>0),
 unidade_estoque text NOT NULL CHECK (length(trim(unidade_estoque))>0),
 grupo text NOT NULL CHECK (length(trim(grupo))>0),
 subgrupo text NOT NULL CHECK (length(trim(subgrupo))>0),
 categoria text NOT NULL CHECK (length(trim(categoria))>0),
 subcategoria text NOT NULL CHECK (length(trim(subcategoria))>0),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.medicamentos TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.medicamentos TO authenticated;
GRANT ALL ON public.medicamentos TO service_role;
CREATE POLICY "public read" ON public.medicamentos FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "staff insert" ON public.medicamentos FOR INSERT TO authenticated WITH CHECK(public.pode_editar(auth.uid(),'medicamentos'));
CREATE POLICY "staff update" ON public.medicamentos FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'medicamentos')) WITH CHECK(public.pode_editar(auth.uid(),'medicamentos'));
CREATE POLICY "staff delete" ON public.medicamentos FOR DELETE TO authenticated USING(public.pode_editar(auth.uid(),'medicamentos'));
CREATE TRIGGER touch_medicamentos BEFORE UPDATE ON public.medicamentos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_medicamentos AFTER INSERT OR UPDATE OR DELETE ON public.medicamentos FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

DO $$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['receitas','despesas','servidores'] LOOP
  EXECUTE format('CREATE UNIQUE INDEX %I ON public.%I(origem,chave_externa) WHERE chave_externa IS NOT NULL',t||'_origem_chave',t);
 END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.importar_dados_poc(_modulo text,_origem text,_linhas jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE cols text[]; obrigatorios text[]; item jsonb; campo text; coluna_sql text; total integer:=0;
BEGIN
 IF auth.uid() IS NULL OR NOT public.pode_editar(auth.uid(),_modulo) THEN RAISE EXCEPTION 'Sem permissao de importacao' USING ERRCODE='42501'; END IF;
 IF _modulo='receitas' THEN
  cols:=ARRAY['ano','mes','categoria','descricao','previsto','arrecadado','natureza','data_receita','codigo_receita','fonte_recurso','chave_externa'];
  obrigatorios:=ARRAY['ano','mes','categoria','chave_externa'];
 ELSIF _modulo='despesas' THEN
  cols:=ARRAY['ano','mes','orgao','funcao','elemento','credor','empenho','empenhado','liquidado','pago','natureza','processo','data_empenho','liquidacao','data_liquidacao','ordem_bancaria','data_pagamento','fonte_recurso','chave_externa'];
  obrigatorios:=ARRAY['ano','mes','orgao','chave_externa'];
 ELSIF _modulo='servidores' THEN
  cols:=ARRAY['nome','matricula','cargo','vinculo','lotacao','admissao','remuneracao','competencia','subsidio','vantagens','descontos','chave_externa'];
  obrigatorios:=ARRAY['nome','competencia','chave_externa'];
 ELSE RAISE EXCEPTION 'Modulo de importacao nao suportado'; END IF;
 IF length(trim(coalesce(_origem,'')))<3 OR length(_origem)>120 THEN RAISE EXCEPTION 'Informe a origem do arquivo'; END IF;
 IF jsonb_typeof(_linhas) IS DISTINCT FROM 'array' OR jsonb_array_length(_linhas) NOT BETWEEN 1 AND 500 THEN RAISE EXCEPTION 'Importe entre 1 e 500 linhas'; END IF;
 SELECT string_agg(quote_ident(c),',') INTO coluna_sql FROM unnest(cols||ARRAY['origem']) c;
 FOR item IN SELECT value FROM jsonb_array_elements(_linhas) LOOP
  IF jsonb_typeof(item) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Linha invalida'; END IF;
  FOR campo IN SELECT jsonb_object_keys(item) LOOP
   IF NOT campo=ANY(cols) THEN RAISE EXCEPTION 'Coluna nao permitida: %',campo; END IF;
  END LOOP;
  FOREACH campo IN ARRAY obrigatorios LOOP
   IF length(trim(coalesce(item->>campo,'')))=0 THEN RAISE EXCEPTION 'Campo obrigatorio ausente: %',campo; END IF;
  END LOOP;
  item:=item||jsonb_build_object('origem',trim(_origem));
  EXECUTE format('INSERT INTO public.%1$I(%2$s) SELECT %2$s FROM jsonb_populate_record(NULL::public.%1$I,$1)',_modulo,coluna_sql) USING item;
  total:=total+1;
 END LOOP;
 RETURN total;
END $$;
REVOKE ALL ON FUNCTION public.importar_dados_poc(text,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.importar_dados_poc(text,text,jsonb) TO authenticated;
