-- LAI art.15, paragrafo unico: prazo de resposta ao recurso de cinco dias.
-- Pedido inicial continua com 20 dias e prorrogacao justificada de dez dias.
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
          CASE WHEN a.canal = 'esic' AND a.tipo='Recurso' THEN 5
               WHEN a.canal = 'esic' THEN (CASE WHEN a.prorrogado THEN 30 ELSE 20 END)
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
 IF a.tipo='Recurso' THEN RAISE EXCEPTION 'Recurso tem prazo proprio de cinco dias e nao admite esta prorrogacao'; END IF;
 IF a.prorrogado THEN RAISE EXCEPTION 'O prazo já foi prorrogado'; END IF;
 IF a.respondido_em IS NOT NULL OR a.status = 'Respondido' THEN RAISE EXCEPTION 'Pedido já respondido'; END IF;
 IF (now() AT TIME ZONE 'America/Fortaleza')::date > (a.created_at AT TIME ZONE 'America/Fortaleza')::date + 20
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

