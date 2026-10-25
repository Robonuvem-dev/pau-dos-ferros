-- Preservar também visualizações no arquivo estatístico da Carta.
CREATE OR REPLACE FUNCTION public.gerar_documento_carta(_formato text,_ids uuid[] DEFAULT NULL)
RETURNS TABLE(documento_id uuid,conteudo text,mime text,nome text) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE registros jsonb; body text; tipo text; filename text; target uuid; cols text[];
BEGIN
 IF _formato NOT IN ('csv','json','ficha','estatisticas') THEN RAISE EXCEPTION 'Formato não permitido' USING ERRCODE='22023'; END IF;
 IF _ids IS NOT NULL AND cardinality(_ids)>10000 THEN RAISE EXCEPTION 'Seleção muito extensa' USING ERRCODE='22023'; END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object('nome',s.nome,'descricao',s.descricao,'secretaria',s.secretaria,'publico',s.publico,'requisitos',s.requisitos,'prazo',s.prazo,'custo',s.custo,'link',s.link,'tags',s.tags,'etapas',s.etapas,'perfil_atendimento',s.perfil_atendimento,'parecer_status',s.parecer_status,'anexo_url',s.anexo_url) ORDER BY s.nome,s.id),'[]'::jsonb)
 INTO registros FROM public.servicos s WHERE _ids IS NULL OR s.id=ANY(_ids);
 IF _formato='json' THEN body:=jsonb_pretty(registros);tipo:='application/json';filename:='carta-servicos.json';
 ELSIF _formato='csv' THEN
  cols:=ARRAY['nome','descricao','secretaria','publico','requisitos','prazo','custo','link','tags','etapas','perfil_atendimento','parecer_status','anexo_url'];
  SELECT string_agg('"'||c||'"',';' ORDER BY n) INTO body FROM unnest(cols) WITH ORDINALITY t(c,n);
  body:=body||E'\n'||coalesce((SELECT string_agg(linha,E'\n' ORDER BY ord) FROM (
   SELECT ord,(SELECT string_agg('"'||replace(coalesce(r->>c,''),'"','""')||'"',';' ORDER BY n) FROM unnest(cols) WITH ORDINALITY t(c,n)) linha FROM jsonb_array_elements(registros) WITH ORDINALITY a(r,ord)
  ) linhas),'');tipo:='text/csv;charset=utf-8';filename:='carta-servicos.csv';
 ELSIF _formato='estatisticas' THEN
  SELECT jsonb_pretty(coalesce(jsonb_agg(to_jsonb(st)||jsonb_build_object('nome',s.nome,'visualizacoes',s.visualizacoes) ORDER BY s.nome,s.id),'[]'::jsonb)) INTO body FROM public.estatisticas_servicos() st JOIN public.servicos s ON s.id=st.servico_id;
  tipo:='application/json';filename:='estatisticas-servicos.json';
 ELSE
  body:='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Ficha técnica de serviço</title><style>body{font:14px Arial;margin:32px}p{height:44px;border-bottom:1px dashed #888}h1{font-size:20px}</style><h1>Prefeitura Municipal de Pau dos Ferros/RN — Carta de Serviços</h1>';
  SELECT body||string_agg('<p>'||c||'</p>','' ORDER BY n)||'</html>' INTO body FROM unnest(ARRAY['Nome do serviço','Descrição','Público-alvo','Setor responsável','Perfil de atendimento','Requisitos e documentos','Prazo','Custo','Forma de acesso / link','Tags','Parecer do Ouvidor','Etapa 1','Etapa 2','Etapa 3','Etapa 4','Etapa 5']) WITH ORDINALITY t(c,n);
  tipo:='text/html;charset=utf-8';filename:='ficha-servico.html';
 END IF;
 INSERT INTO public.documentos_carta_gerados(formato,mime,conteudo) VALUES(_formato,tipo,convert_to(body,'UTF8'))
 ON CONFLICT(formato,sha256) DO UPDATE SET formato=EXCLUDED.formato RETURNING id INTO target;
 RETURN QUERY SELECT target,body,tipo,filename;
END $$;
