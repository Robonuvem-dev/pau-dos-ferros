-- M04 4.2-4.5, 4.7 e 4.11: cadastros auxiliares e varios contratos por convenio.
-- Aplicacao somente apos homologacao/autorizacao do ambiente.
ALTER TABLE public.convenios
 ADD COLUMN IF NOT EXISTS especificacoes_tecnicas text,
 ADD COLUMN IF NOT EXISTS categoria text;
ALTER TABLE public.contratos
 ADD COLUMN IF NOT EXISTS convenio_id uuid REFERENCES public.convenios(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS contratos_convenio_idx ON public.contratos(convenio_id);

CREATE TABLE public.convenio_entidades (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 papel text NOT NULL CHECK (papel IN ('concedente','convenente')),
 nome text NOT NULL CHECK (length(trim(nome)) > 0),
 responsavel text,
 cnpj text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (papel,nome)
);
CREATE TABLE public.convenio_tipos (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 nome text NOT NULL UNIQUE CHECK (length(trim(nome)) > 0),
 descricao text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
-- Preserve registros anteriores; numero de contrato pode nao ser unico no legado.
-- Nao converter vinculos ambiguos automaticamente.
UPDATE public.contratos c SET convenio_id=v.id
FROM public.convenios v
WHERE c.convenio_id IS NULL AND c.numero=v.contrato_numero
 AND (SELECT count(*) FROM public.convenios x WHERE x.contrato_numero=c.numero)=1
 AND (SELECT count(*) FROM public.contratos x WHERE x.numero=c.numero)=1;

DO $$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['convenio_entidades','convenio_tipos'] LOOP
  EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated',t);
  EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated',t);
  EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('CREATE POLICY "public read" ON public.%I FOR SELECT TO anon, authenticated USING (true)',t);
  EXECUTE format('CREATE POLICY "module insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.pode_editar(auth.uid(), %L))',t,'convenios');
  EXECUTE format('CREATE POLICY "module update" ON public.%I FOR UPDATE TO authenticated USING (public.pode_editar(auth.uid(), %L)) WITH CHECK (public.pode_editar(auth.uid(), %L))',t,'convenios','convenios');
  EXECUTE format('CREATE POLICY "module delete" ON public.%I FOR DELETE TO authenticated USING (public.pode_editar(auth.uid(), %L))',t,'convenios');
  EXECUTE format('CREATE TRIGGER touch_%1$s BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()',t);
  EXECUTE format('CREATE TRIGGER auditoria_%1$s AFTER INSERT OR UPDATE OR DELETE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria()',t);
 END LOOP;
END $$;
