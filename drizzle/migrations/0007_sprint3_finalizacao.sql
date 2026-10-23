ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS agendar_para date, ADD COLUMN IF NOT EXISTS evento text, ADD COLUMN IF NOT EXISTS evento_data date, ADD COLUMN IF NOT EXISTS evento_local text;
ALTER TABLE public.albuns ADD COLUMN IF NOT EXISTS legendas text;
ALTER TABLE public.agentes_politicos ADD COLUMN IF NOT EXISTS partido text, ADD COLUMN IF NOT EXISTS mandato text;
ALTER TABLE public.publicacoes ADD COLUMN IF NOT EXISTS etapas text, ADD COLUMN IF NOT EXISTS situacao text;