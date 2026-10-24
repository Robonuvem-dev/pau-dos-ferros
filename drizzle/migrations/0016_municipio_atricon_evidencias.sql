-- Sprint 5/M05 e Sprint 9/M14: conteudo institucional e relatorios com evidencias.
CREATE TABLE public.municipio_informacoes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 categoria text NOT NULL CHECK(categoria IN ('História','A cidade','Praças','Sítios','Postos de saúde','Distritos','Escolas','Prédios públicos','Eventos','Agenda do gestor')),
 titulo text NOT NULL CHECK(length(trim(titulo))>0),
 descricao text NOT NULL CHECK(length(trim(descricao))>0),
 endereco text, horario text, contato text, data_evento date, foto_url text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.municipio_informacoes ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.municipio_informacoes TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.municipio_informacoes TO authenticated;
GRANT ALL ON public.municipio_informacoes TO service_role;
CREATE POLICY "public read" ON public.municipio_informacoes FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "staff insert" ON public.municipio_informacoes FOR INSERT TO authenticated WITH CHECK(public.pode_editar(auth.uid(),'municipio_informacoes'));
CREATE POLICY "staff update" ON public.municipio_informacoes FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'municipio_informacoes')) WITH CHECK(public.pode_editar(auth.uid(),'municipio_informacoes'));
CREATE POLICY "staff delete" ON public.municipio_informacoes FOR DELETE TO authenticated USING(public.pode_editar(auth.uid(),'municipio_informacoes'));
CREATE TRIGGER touch_municipio_informacoes BEFORE UPDATE ON public.municipio_informacoes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_municipio_informacoes AFTER INSERT OR UPDATE OR DELETE ON public.municipio_informacoes FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();
ALTER TABLE public.atricon_avaliacoes ADD CONSTRAINT atricon_evidencia_positiva CHECK(
 status='nao_atende' OR coalesce((link ~ '^https?://' AND link !~ '^https?://[^/]*@' AND length(trim(observacao))>=10),false)
) NOT VALID;
CREATE TABLE public.atricon_relatorios(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(),
 modelo text NOT NULL, texto text NOT NULL, analise_ia text NOT NULL,
 resultados jsonb NOT NULL CHECK(jsonb_typeof(resultados)='array' AND jsonb_array_length(resultados)=88),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.atricon_relatorios ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT ON public.atricon_relatorios TO authenticated;
GRANT ALL ON public.atricon_relatorios TO service_role;
CREATE POLICY "staff read" ON public.atricon_relatorios FOR SELECT TO authenticated USING(public.is_staff(auth.uid()));
CREATE POLICY "staff insert" ON public.atricon_relatorios FOR INSERT TO authenticated WITH CHECK(public.is_staff(auth.uid()) AND user_id=auth.uid());
CREATE TRIGGER auditoria_atricon_relatorios AFTER INSERT ON public.atricon_relatorios FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();
