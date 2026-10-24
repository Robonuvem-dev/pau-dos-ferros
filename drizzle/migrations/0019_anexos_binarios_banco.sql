-- M15.5: preservar os bytes dos anexos administrativos no PostgreSQL.
-- O Object Storage continua servindo a cópia pública; binários no banco são privados.
CREATE TABLE public.arquivos_binarios(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 storage_path text NOT NULL UNIQUE CHECK(length(trim(storage_path))>0),
 nome text NOT NULL CHECK(length(trim(nome))>0),
 mime text NOT NULL,
 conteudo bytea NOT NULL CHECK(octet_length(conteudo) BETWEEN 1 AND 52428800),
 tamanho integer GENERATED ALWAYS AS (octet_length(conteudo)) STORED,
 sha256 text GENERATED ALWAYS AS (encode(sha256(conteudo),'hex')) STORED,
 user_id uuid NOT NULL DEFAULT auth.uid(),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.arquivos_binarios ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT ON public.arquivos_binarios TO authenticated;
GRANT ALL ON public.arquivos_binarios TO service_role;
CREATE POLICY "staff read" ON public.arquivos_binarios FOR SELECT TO authenticated USING(public.is_staff(auth.uid()));
CREATE POLICY "staff insert" ON public.arquivos_binarios FOR INSERT TO authenticated WITH CHECK(public.is_staff(auth.uid()) AND user_id=auth.uid());
CREATE FUNCTION public.auditar_arquivo_binario() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 INSERT INTO public.auditoria(user_id,tabela,acao,registro_id,dados)
 VALUES(auth.uid(),'arquivos_binarios','INSERT',NEW.id::text,jsonb_build_object('storage_path',NEW.storage_path,'nome',NEW.nome,'mime',NEW.mime,'tamanho',NEW.tamanho,'sha256',NEW.sha256));
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.auditar_arquivo_binario() FROM PUBLIC;
CREATE TRIGGER auditoria_arquivos_binarios AFTER INSERT ON public.arquivos_binarios FOR EACH ROW EXECUTE FUNCTION public.auditar_arquivo_binario();
