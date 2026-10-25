CREATE OR REPLACE FUNCTION public.sincronizar_dados_poc(_modulo text,_origem text,_linhas jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE cols text[]; obrigatorios text[]; item jsonb; campo text; coluna_sql text; total integer:=0; tabela text; atualizacoes text;
BEGIN
 tabela:=CASE WHEN _modulo='agentes-politicos' THEN 'agentes_politicos' ELSE _modulo END;
 IF auth.uid() IS NULL OR NOT public.pode_editar(auth.uid(),tabela) THEN RAISE EXCEPTION 'Sem permissao de importacao' USING ERRCODE='42501'; END IF;
 IF _modulo='receitas' THEN
  cols:=ARRAY['ano','mes','categoria','descricao','previsto','arrecadado','natureza','data_receita','codigo_receita','fonte_recurso','chave_externa'];
  obrigatorios:=ARRAY['ano','mes','categoria','chave_externa'];
 ELSIF _modulo='despesas' THEN
  cols:=ARRAY['ano','mes','orgao','funcao','elemento','credor','empenho','empenhado','liquidado','pago','natureza','processo','data_empenho','liquidacao','data_liquidacao','ordem_bancaria','data_pagamento','fonte_recurso','chave_externa'];
  obrigatorios:=ARRAY['ano','mes','orgao','chave_externa'];
 ELSIF _modulo='servidores' THEN
  cols:=ARRAY['nome','matricula','cargo','vinculo','lotacao','admissao','remuneracao','competencia','subsidio','vantagens','descontos','chave_externa'];
  obrigatorios:=ARRAY['nome','competencia','chave_externa'];
 ELSIF _modulo='credores' THEN
  cols:=ARRAY['nome','cpf_cnpj','tipo','municipio','uf','chave_externa'];
  obrigatorios:=ARRAY['nome','chave_externa'];
 ELSIF _modulo='agentes-politicos' THEN
  cols:=ARRAY['nome','cargo','partido','mandato','email','telefone','biografia','ordem','chave_externa'];
  obrigatorios:=ARRAY['nome','cargo','chave_externa'];
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
  SELECT string_agg(format('%I=EXCLUDED.%I',c,c),',') INTO atualizacoes FROM jsonb_object_keys(item) c WHERE c<>'chave_externa';
  item:=item||jsonb_build_object('origem',trim(_origem));
  EXECUTE format('INSERT INTO public.%1$I(%2$s) SELECT %2$s FROM jsonb_populate_record(NULL::public.%1$I,$1) ON CONFLICT (origem,chave_externa) WHERE chave_externa IS NOT NULL DO UPDATE SET %3$s',tabela,coluna_sql,atualizacoes) USING item;
  total:=total+1;
 END LOOP;
 RETURN total;
END $$;
REVOKE ALL ON FUNCTION public.sincronizar_dados_poc(text,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sincronizar_dados_poc(text,text,jsonb) TO authenticated;
