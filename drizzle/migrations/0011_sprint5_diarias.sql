-- Sprint 5 / M05: metadados de diárias em publicações. As categorias
-- resolucao, edital e lrf reutilizam a coluna categoria já existente.
ALTER TABLE public.publicacoes
 ADD COLUMN IF NOT EXISTS beneficiario text,
 ADD COLUMN IF NOT EXISTS destino text,
 ADD COLUMN IF NOT EXISTS justificativa text;
