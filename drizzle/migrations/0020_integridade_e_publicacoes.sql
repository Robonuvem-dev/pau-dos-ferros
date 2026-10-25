-- Revisão dos itens parciais. Não preenche lacunas legadas com dados inventados.
DROP TRIGGER contratos_base ON public.contratos;
DROP TRIGGER contratos_recalc ON public.contratos;
ALTER TABLE public.contratos ADD COLUMN contrato_origem_id uuid REFERENCES public.contratos(id) ON DELETE RESTRICT;
UPDATE public.contratos c SET contrato_origem_id=p.id
FROM (SELECT numero,min(id::text)::uuid id FROM public.contratos WHERE coalesce(tipo,'Contrato') IN ('Contrato','Ata de Registro de Preços') GROUP BY numero HAVING count(*)=1) p
WHERE c.contrato_origem=p.numero AND c.tipo IN ('Aditivo','Adesão (Carona)') AND c.id<>p.id;
ALTER TABLE public.contratos ADD CONSTRAINT origem_instrumento_obrigatoria CHECK(tipo NOT IN ('Aditivo','Adesão (Carona)') OR contrato_origem_id IS NOT NULL) NOT VALID;
CREATE OR REPLACE FUNCTION public.recalcular_contrato(_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 UPDATE public.contratos p SET valor_atualizado=coalesce(p.valor,0)+coalesce((SELECT sum(a.valor) FROM public.contratos a WHERE a.contrato_origem_id=p.id AND a.tipo='Aditivo'),0),
 data_fim_atualizada=greatest(p.data_fim,(SELECT max(a.data_fim) FROM public.contratos a WHERE a.contrato_origem_id=p.id AND a.tipo='Aditivo')) WHERE p.id=_id;
END $$;
REVOKE ALL ON FUNCTION public.recalcular_contrato(uuid) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.recalcular_contrato(_numero text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE target uuid;
BEGIN
 IF (SELECT count(*) FROM public.contratos WHERE numero=_numero AND contrato_origem_id IS NULL)<>1 THEN RAISE EXCEPTION 'Número ambíguo ou inexistente; utilize o identificador'; END IF;
 SELECT id INTO target FROM public.contratos WHERE numero=_numero AND contrato_origem_id IS NULL;
 PERFORM public.recalcular_contrato(target);
END $$;
REVOKE ALL ON FUNCTION public.recalcular_contrato(text) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.contratos_base() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE origem public.contratos%ROWTYPE;
BEGIN
 IF NEW.contrato_origem_id IS NOT NULL THEN
  SELECT * INTO origem FROM public.contratos WHERE id=NEW.contrato_origem_id FOR NO KEY UPDATE;
  IF NOT FOUND OR origem.id=NEW.id OR coalesce(origem.tipo,'Contrato') NOT IN ('Contrato','Ata de Registro de Preços') THEN RAISE EXCEPTION 'Contrato ou ata de origem inválido' USING ERRCODE='23514'; END IF;
  IF NEW.tipo='Adesão (Carona)' AND origem.tipo IS DISTINCT FROM 'Ata de Registro de Preços' THEN RAISE EXCEPTION 'Adesão deve vincular uma ata' USING ERRCODE='23514'; END IF;
  IF NEW.tipo NOT IN ('Aditivo','Adesão (Carona)') THEN RAISE EXCEPTION 'Tipo não admite instrumento de origem' USING ERRCODE='23514'; END IF;
  NEW.contrato_origem:=origem.numero;
 ELSE NEW.contrato_origem:=NULL;
 END IF;
 IF NEW.contrato_origem_id IS NULL THEN
  NEW.valor_atualizado:=coalesce(NEW.valor,0)+coalesce((SELECT sum(a.valor) FROM public.contratos a WHERE a.contrato_origem_id=NEW.id AND a.tipo='Aditivo'),0);
  NEW.data_fim_atualizada:=greatest(NEW.data_fim,(SELECT max(a.data_fim) FROM public.contratos a WHERE a.contrato_origem_id=NEW.id AND a.tipo='Aditivo'));
 END IF;
 RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.contratos_recalc() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_OP<>'DELETE' AND NEW.contrato_origem_id IS NOT NULL THEN PERFORM public.recalcular_contrato(NEW.contrato_origem_id); END IF;
 IF TG_OP<>'INSERT' AND OLD.contrato_origem_id IS NOT NULL AND (TG_OP='DELETE' OR OLD.contrato_origem_id IS DISTINCT FROM NEW.contrato_origem_id) THEN PERFORM public.recalcular_contrato(OLD.contrato_origem_id); END IF;
 RETURN NULL;
END $$;
CREATE TRIGGER contratos_base BEFORE INSERT OR UPDATE ON public.contratos FOR EACH ROW EXECUTE FUNCTION public.contratos_base();
CREATE TRIGGER contratos_recalc AFTER INSERT OR UPDATE OR DELETE ON public.contratos FOR EACH ROW EXECUTE FUNCTION public.contratos_recalc();

ALTER TABLE public.convenios ADD CONSTRAINT convenio_campos_obrigatorios CHECK (
 nullif(trim(concedente),'') IS NOT NULL AND nullif(trim(convenente),'') IS NOT NULL AND nullif(trim(responsavel_concedente),'') IS NOT NULL AND nullif(trim(responsavel_convenente),'') IS NOT NULL AND valor_global IS NOT NULL AND valor_global>=0
) NOT VALID;
ALTER TABLE public.convenio_parcelas ADD CONSTRAINT parcela_cronograma_obrigatorio CHECK(vencimento IS NOT NULL) NOT VALID;
ALTER TABLE public.convenio_obrigacoes ADD COLUMN parte_obrigada text;
ALTER TABLE public.convenio_obrigacoes ADD CONSTRAINT obrigacao_parte_definida CHECK(parte_obrigada IS NOT NULL AND parte_obrigada IN ('Concedente','Convenente','Ambos')) NOT VALID;
ALTER TABLE public.obras ADD CONSTRAINT obra_campos_obrigatorios CHECK (
 data_inicio IS NOT NULL AND previsao_fim IS NOT NULL AND nullif(trim(descricao),'') IS NOT NULL AND valor IS NOT NULL AND valor>=0
 AND aditivo_acrescimo IS NOT NULL AND aditivo_acrescimo>=0 AND aditivo_supressao IS NOT NULL AND aditivo_supressao>=0
 AND nullif(trim(origem_recurso),'') IS NOT NULL AND nullif(trim(numero_processo),'') IS NOT NULL AND nullif(trim(tipo_guarda_chuva),'') IS NOT NULL
 AND nullif(trim(secretaria),'') IS NOT NULL AND nullif(trim(local),'') IS NOT NULL AND nullif(trim(objeto_contrato),'') IS NOT NULL AND nullif(trim(justificativa),'') IS NOT NULL
 AND (situacao IS DISTINCT FROM 'Concluída' OR data_fim IS NOT NULL) AND previsao_fim>=data_inicio AND (data_fim IS NULL OR data_fim>=data_inicio)
) NOT VALID;
ALTER TABLE public.veiculos ADD CONSTRAINT veiculo_campos_obrigatorios CHECK (
 ano IS NOT NULL AND nullif(trim(renavam),'') IS NOT NULL AND entrada_frota IS NOT NULL AND nullif(trim(tipo),'') IS NOT NULL
 AND nullif(trim(situacao),'') IS NOT NULL AND nullif(trim(secretaria),'') IS NOT NULL AND nullif(trim(finalidade),'') IS NOT NULL
 AND (situacao IS DISTINCT FROM 'Baixado' OR baixa_frota IS NOT NULL) AND (baixa_frota IS NULL OR baixa_frota>=entrada_frota)
) NOT VALID;
ALTER TABLE public.conselhos ADD CONSTRAINT conselho_campos_obrigatorios CHECK (
 data_criacao IS NOT NULL AND nullif(trim(descricao),'') IS NOT NULL AND nullif(trim(lei_criacao),'') IS NOT NULL
 AND vigencia_inicio IS NOT NULL AND vigencia_fim IS NOT NULL AND vigencia_fim>=vigencia_inicio AND nullif(trim(competencias),'') IS NOT NULL
) NOT VALID;

CREATE TABLE public.licitacao_publicacoes(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),licitacao_id uuid REFERENCES public.licitacoes(id) ON DELETE SET NULL,
 numero text NOT NULL,objeto text,evento text NOT NULL,publicado_em timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.licitacao_publicacoes ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.licitacao_publicacoes TO anon,authenticated;
GRANT ALL ON public.licitacao_publicacoes TO service_role;
CREATE POLICY "public read" ON public.licitacao_publicacoes FOR SELECT TO anon,authenticated USING(true);
CREATE FUNCTION public.registrar_publicacao_licitacao() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 INSERT INTO public.licitacao_publicacoes(licitacao_id,numero,objeto,evento) VALUES(NEW.id,NEW.numero,NEW.objeto,CASE WHEN TG_OP='INSERT' THEN 'Cadastro publicado' ELSE 'Atualização publicada' END);
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.registrar_publicacao_licitacao() FROM PUBLIC;
CREATE TRIGGER registrar_publicacao_licitacao AFTER INSERT OR UPDATE ON public.licitacoes FOR EACH ROW EXECUTE FUNCTION public.registrar_publicacao_licitacao();
