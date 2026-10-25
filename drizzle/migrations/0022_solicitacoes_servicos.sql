CREATE TABLE public.servico_solicitacoes(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),servico_id uuid NOT NULL REFERENCES public.servicos(id) ON DELETE RESTRICT,
 protocolo text NOT NULL UNIQUE DEFAULT 'CS-'||upper(gen_random_uuid()::text),nome text NOT NULL,email text NOT NULL,mensagem text NOT NULL,
 status text NOT NULL DEFAULT 'Recebida' CHECK(status IN ('Recebida','Em atendimento','Concluída')),resposta text,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX servico_solicitacoes_parent ON public.servico_solicitacoes(servico_id);
ALTER TABLE public.servico_solicitacoes ENABLE ROW LEVEL SECURITY;
GRANT SELECT,UPDATE ON public.servico_solicitacoes TO authenticated;
GRANT ALL ON public.servico_solicitacoes TO service_role;
CREATE POLICY "staff read" ON public.servico_solicitacoes FOR SELECT TO authenticated USING(public.pode_editar(auth.uid(),'servicos'));
CREATE POLICY "staff update" ON public.servico_solicitacoes FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'servicos')) WITH CHECK(public.pode_editar(auth.uid(),'servicos'));
CREATE TRIGGER touch_servico_solicitacoes BEFORE UPDATE ON public.servico_solicitacoes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_servico_solicitacoes AFTER INSERT OR UPDATE OR DELETE ON public.servico_solicitacoes FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();
CREATE FUNCTION public.solicitar_servico(_servico uuid,_nome text,_email text,_mensagem text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE protocolo_criado text;
BEGIN
 IF length(trim(coalesce(_nome,''))) NOT BETWEEN 2 AND 200 OR length(trim(coalesce(_mensagem,''))) NOT BETWEEN 10 AND 4000
  OR length(coalesce(_email,''))>320 OR coalesce(_email,'') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Confira nome, e-mail e descrição da solicitação' USING ERRCODE='22023'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.servicos WHERE id=_servico) THEN RAISE EXCEPTION 'Serviço indisponível' USING ERRCODE='22023'; END IF;
 IF (SELECT count(*) FROM public.servico_solicitacoes WHERE servico_id=_servico AND email=lower(trim(_email)) AND created_at>now()-interval '1 hour')>=5 THEN RAISE EXCEPTION 'Aguarde antes de enviar novas solicitações' USING ERRCODE='22023'; END IF;
 INSERT INTO public.servico_solicitacoes(servico_id,nome,email,mensagem) VALUES(_servico,trim(_nome),lower(trim(_email)),trim(_mensagem)) RETURNING protocolo INTO protocolo_criado;
 RETURN protocolo_criado;
END $$;
REVOKE ALL ON FUNCTION public.solicitar_servico(uuid,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.solicitar_servico(uuid,text,text,text) TO anon,authenticated;
DROP FUNCTION public.estatisticas_servicos();
CREATE FUNCTION public.estatisticas_servicos() RETURNS TABLE(servico_id uuid,avaliacoes bigint,media numeric,uteis bigint,solicitacoes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT s.id,(SELECT count(*) FROM public.servico_avaliacoes a WHERE a.servico_id=s.id),
 (SELECT round(avg(a.nota)::numeric,1) FROM public.servico_avaliacoes a WHERE a.servico_id=s.id),
 (SELECT count(*) FROM public.servico_avaliacoes a WHERE a.servico_id=s.id AND a.util),
 (SELECT count(*) FROM public.servico_solicitacoes r WHERE r.servico_id=s.id) FROM public.servicos s
$$;
REVOKE ALL ON FUNCTION public.estatisticas_servicos() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.estatisticas_servicos() TO anon,authenticated;
