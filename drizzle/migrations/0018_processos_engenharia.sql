-- M10.1: processos de engenharia com contrato e origem de recurso.
CREATE TABLE public.processos_engenharia (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 numero text NOT NULL CHECK(length(trim(numero))>0),
 data_processo date NOT NULL,
 valor_contrato_inicial numeric(14,2) NOT NULL CHECK(valor_contrato_inicial>=0),
 contrato_id uuid NOT NULL REFERENCES public.contratos(id) ON DELETE RESTRICT,
 fonte_recurso text NOT NULL CHECK(length(trim(fonte_recurso))>0),
 descricao text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.processos_engenharia ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.processos_engenharia TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.processos_engenharia TO authenticated;
GRANT ALL ON public.processos_engenharia TO service_role;
CREATE POLICY "public read" ON public.processos_engenharia FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "staff insert" ON public.processos_engenharia FOR INSERT TO authenticated WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff update" ON public.processos_engenharia FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'obras')) WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff delete" ON public.processos_engenharia FOR DELETE TO authenticated USING(public.pode_editar(auth.uid(),'obras'));
CREATE TRIGGER touch_processos_engenharia BEFORE UPDATE ON public.processos_engenharia FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_processos_engenharia AFTER INSERT OR UPDATE OR DELETE ON public.processos_engenharia FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();
ALTER TABLE public.obras ADD COLUMN processo_engenharia_id uuid REFERENCES public.processos_engenharia(id) ON DELETE RESTRICT;
CREATE INDEX obras_processo_engenharia_idx ON public.obras(processo_engenharia_id);
