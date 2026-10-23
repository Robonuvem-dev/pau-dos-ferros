-- PoC Sprint 5 / M05: e-SIC com prazo, prorrogação justificada, encaminhamento e recurso.
-- Somente migração de código: NÃO é aplicada automaticamente por este commit.
ALTER TABLE public.atendimentos
  ADD COLUMN IF NOT EXISTS prorrogado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS justificativa_prorrogacao text,
  ADD COLUMN IF NOT EXISTS prorrogado_em timestamptz,
  ADD COLUMN IF NOT EXISTS setor_destino text,
  ADD COLUMN IF NOT EXISTS protocolo_origem uuid REFERENCES public.atendimentos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS atendimentos_esic_prazo_idx
  ON public.atendimentos(canal, status, created_at);
CREATE INDEX IF NOT EXISTS atendimentos_recurso_origem_idx
  ON public.atendimentos(protocolo_origem);

-- Novos protocolos devem ser imprevisíveis: evita enumeração por sequência de 6 dígitos.
ALTER TABLE public.atendimentos ALTER COLUMN protocolo SET DEFAULT
 ('PF' || to_char(now(), 'YYYY') || upper(replace(gen_random_uuid()::text, '-', '')));

-- Desabilita a função pública antiga de consulta que revelava resposta/assunto
-- usando somente códigos curtos e previsíveis. O frontend migra para a RPC segura.
REVOKE ALL ON FUNCTION public.consultar_protocolo(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consultar_protocolo_seguro(_protocolo text, _email text)
RETURNS TABLE (
 protocolo text, canal text, assunto text, status text, resposta text,
 created_at timestamptz, respondido_em timestamptz, prorrogado boolean,
 justificativa_prorrogacao text, setor_destino text, prazo_final date,
 protocolo_origem text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT a.protocolo, a.canal, a.assunto, a.status, a.resposta, a.created_at,
        a.respondido_em, a.prorrogado, a.justificativa_prorrogacao,
        a.setor_destino,
        ((a.created_at AT TIME ZONE 'America/Fortaleza')::date +
          CASE WHEN a.canal = 'esic' THEN (CASE WHEN a.prorrogado THEN 30 ELSE 20 END)
               ELSE 30 END)::date,
        origem.protocolo
 FROM public.atendimentos a
 LEFT JOIN public.atendimentos origem ON origem.id = a.protocolo_origem
 WHERE a.protocolo = upper(trim(_protocolo))
   AND (
      (NOT coalesce(a.anonimo,false)
       AND length(trim(coalesce(_email,''))) > 3
       AND lower(trim(a.email)) = lower(trim(_email)))
      OR
      (coalesce(a.anonimo,false) AND length(a.protocolo) >= 38)
   )
 LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.consultar_protocolo_seguro(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consultar_protocolo_seguro(text,text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.prorrogar_esic(_id uuid, _justificativa text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.atendimentos%ROWTYPE;
BEGIN
 IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Acesso não autorizado'; END IF;
 SELECT * INTO a FROM public.atendimentos WHERE id = _id FOR UPDATE;
 IF NOT FOUND OR a.canal <> 'esic' THEN RAISE EXCEPTION 'Pedido e-SIC não encontrado'; END IF;
 IF a.prorrogado THEN RAISE EXCEPTION 'O prazo já foi prorrogado'; END IF;
 IF a.respondido_em IS NOT NULL OR a.status = 'Respondido' THEN RAISE EXCEPTION 'Pedido já respondido'; END IF;
 IF current_date > (a.created_at AT TIME ZONE 'America/Fortaleza')::date + 20
    THEN RAISE EXCEPTION 'Prazo original vencido'; END IF;
 IF length(trim(coalesce(_justificativa,''))) < 10 THEN
   RAISE EXCEPTION 'Justificativa de prorrogação deve ter ao menos 10 caracteres';
 END IF;
 UPDATE public.atendimentos SET prorrogado = true,
  justificativa_prorrogacao = left(trim(_justificativa),2000), prorrogado_em = now()
 WHERE id = _id;
END $$;
REVOKE ALL ON FUNCTION public.prorrogar_esic(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prorrogar_esic(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.encaminhar_atendimento(_id uuid, _setor text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Acesso não autorizado'; END IF;
 IF length(trim(coalesce(_setor,''))) < 2 THEN RAISE EXCEPTION 'Informe o setor'; END IF;
 UPDATE public.atendimentos SET setor_destino=left(trim(_setor),180),
    status='Em andamento'
 WHERE id=_id AND status <> 'Respondido';
 IF NOT FOUND THEN RAISE EXCEPTION 'Pedido inexistente ou já respondido'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.encaminhar_atendimento(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.encaminhar_atendimento(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.responder_atendimento(_id uuid, _resposta text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Acesso não autorizado'; END IF;
 IF length(trim(coalesce(_resposta,''))) < 10 THEN
   RAISE EXCEPTION 'Resposta precisa ter ao menos 10 caracteres';
 END IF;
 UPDATE public.atendimentos SET resposta=left(trim(_resposta),10000),
    respondido_em=now(), status='Respondido'
 WHERE id=_id AND status <> 'Respondido';
 IF NOT FOUND THEN RAISE EXCEPTION 'Pedido inexistente ou já respondido'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.responder_atendimento(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.responder_atendimento(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.registrar_recurso_esic(
 _protocolo text, _email text, _mensagem text
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE origem public.atendimentos%ROWTYPE; protocolo_novo text;
BEGIN
 IF length(trim(coalesce(_mensagem,''))) < 10 OR length(trim(_mensagem)) > 5000
 THEN RAISE EXCEPTION 'Recurso deve conter de 10 a 5000 caracteres'; END IF;
 SELECT * INTO origem FROM public.atendimentos
 WHERE protocolo=upper(trim(_protocolo))
   AND canal='esic'
   AND NOT coalesce(anonimo,false)
   AND lower(trim(email))=lower(trim(coalesce(_email,'')))
 FOR UPDATE;
 IF NOT FOUND OR origem.respondido_em IS NULL OR
     now() > origem.respondido_em + interval '10 days'
 THEN RAISE EXCEPTION 'Não foi possível registrar recurso para este protocolo'; END IF;
 IF EXISTS (
   SELECT 1 FROM public.atendimentos WHERE protocolo_origem=origem.id AND tipo='Recurso'
 ) THEN RAISE EXCEPTION 'Já existe recurso vinculado a este protocolo'; END IF;
 INSERT INTO public.atendimentos
 (canal,tipo,nome,email,telefone,anonimo,assunto,mensagem,protocolo_origem)
 VALUES ('esic','Recurso',origem.nome,origem.email,origem.telefone,false,
  left('Recurso ao protocolo ' || origem.protocolo,300),
  trim(_mensagem),origem.id)
 RETURNING protocolo INTO protocolo_novo;
 RETURN protocolo_novo;
END $$;
REVOKE ALL ON FUNCTION public.registrar_recurso_esic(text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registrar_recurso_esic(text,text,text) TO anon,authenticated;

-- Auditoria de todas as decisões administrativas e recursos (somente admins leem).
DROP TRIGGER IF EXISTS auditoria_atendimentos ON public.atendimentos;
CREATE TRIGGER auditoria_atendimentos
AFTER INSERT OR UPDATE OR DELETE ON public.atendimentos FOR EACH ROW
EXECUTE FUNCTION public.registrar_auditoria();
