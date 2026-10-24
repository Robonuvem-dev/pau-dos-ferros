-- Sprint 8: obras, frota, conselhos e Plano Diretor.
ALTER TABLE public.obras
 ADD COLUMN data_fim date, ADD COLUMN aditivo_acrescimo numeric(14,2), ADD COLUMN aditivo_supressao numeric(14,2),
 ADD COLUMN origem_recurso text, ADD COLUMN numero_processo text, ADD COLUMN tipo_guarda_chuva text,
 ADD COLUMN secretaria text, ADD COLUMN objeto_contrato text, ADD COLUMN justificativa text,
 ADD COLUMN credor_id uuid REFERENCES public.credores(id) ON DELETE RESTRICT,
 ADD COLUMN contrato_id uuid REFERENCES public.contratos(id) ON DELETE RESTRICT;
ALTER TABLE public.veiculos
 ADD COLUMN renavam text, ADD COLUMN entrada_frota date, ADD COLUMN baixa_frota date,
 ADD COLUMN maquina_obra boolean NOT NULL DEFAULT false, ADD COLUMN finalidade text, ADD COLUMN foto_url text,
 ADD COLUMN seguro_vencimento date, ADD COLUMN ipva_vencimento date, ADD COLUMN manutencao_prevista date;
ALTER TABLE public.conselhos
 ADD COLUMN data_criacao date, ADD COLUMN vigencia_inicio date, ADD COLUMN vigencia_fim date,
 ADD COLUMN competencias text, ADD COLUMN cor text, ADD COLUMN imagem_url text;
ALTER TABLE public.publicacoes ADD COLUMN conselho_id uuid REFERENCES public.conselhos(id) ON DELETE RESTRICT;

CREATE TABLE public.obra_andamentos (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 obra_id uuid REFERENCES public.obras(id) ON DELETE RESTRICT NOT NULL,
 data date NOT NULL,
 descricao text NOT NULL CHECK(length(trim(descricao))>0),
 percentual numeric(5,2) CHECK (percentual BETWEEN 0 AND 100),
 valor_executado numeric(14,2) CHECK (valor_executado>=0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX obra_andamentos_parent_idx ON public.obra_andamentos(obra_id);
ALTER TABLE public.obra_andamentos ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.obra_andamentos TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.obra_andamentos TO authenticated;
GRANT ALL ON public.obra_andamentos TO service_role;
CREATE POLICY "public read" ON public.obra_andamentos FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "staff insert" ON public.obra_andamentos FOR INSERT TO authenticated WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff update" ON public.obra_andamentos FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'obras')) WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff delete" ON public.obra_andamentos FOR DELETE TO authenticated USING(public.pode_editar(auth.uid(),'obras'));
CREATE TRIGGER touch_obra_andamentos BEFORE UPDATE ON public.obra_andamentos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_obra_andamentos AFTER INSERT OR UPDATE OR DELETE ON public.obra_andamentos FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TABLE public.obra_medicoes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 obra_id uuid REFERENCES public.obras(id) ON DELETE RESTRICT NOT NULL,
 numero text NOT NULL CHECK(length(trim(numero))>0),
 data date NOT NULL,
 descricao text NOT NULL CHECK(length(trim(descricao))>0),
 valor numeric(14,2) NOT NULL CHECK (valor>=0),
 aprovada boolean NOT NULL DEFAULT false,
 responsavel text,
 arquivo_url text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX obra_medicoes_parent_idx ON public.obra_medicoes(obra_id);
ALTER TABLE public.obra_medicoes ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.obra_medicoes TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.obra_medicoes TO authenticated;
GRANT ALL ON public.obra_medicoes TO service_role;
CREATE POLICY "public read" ON public.obra_medicoes FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "staff insert" ON public.obra_medicoes FOR INSERT TO authenticated WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff update" ON public.obra_medicoes FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'obras')) WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff delete" ON public.obra_medicoes FOR DELETE TO authenticated USING(public.pode_editar(auth.uid(),'obras'));
CREATE TRIGGER touch_obra_medicoes BEFORE UPDATE ON public.obra_medicoes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_obra_medicoes AFTER INSERT OR UPDATE OR DELETE ON public.obra_medicoes FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TABLE public.obra_arts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 obra_id uuid REFERENCES public.obras(id) ON DELETE RESTRICT NOT NULL,
 numero text NOT NULL CHECK(length(trim(numero))>0),
 responsavel text NOT NULL CHECK(length(trim(responsavel))>0),
 registro_profissional text,
 data date,
 arquivo_url text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX obra_arts_parent_idx ON public.obra_arts(obra_id);
ALTER TABLE public.obra_arts ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.obra_arts TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.obra_arts TO authenticated;
GRANT ALL ON public.obra_arts TO service_role;
CREATE POLICY "public read" ON public.obra_arts FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "staff insert" ON public.obra_arts FOR INSERT TO authenticated WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff update" ON public.obra_arts FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'obras')) WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff delete" ON public.obra_arts FOR DELETE TO authenticated USING(public.pode_editar(auth.uid(),'obras'));
CREATE TRIGGER touch_obra_arts BEFORE UPDATE ON public.obra_arts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_obra_arts AFTER INSERT OR UPDATE OR DELETE ON public.obra_arts FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TABLE public.obra_fotos (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 obra_id uuid REFERENCES public.obras(id) ON DELETE RESTRICT NOT NULL,
 data date NOT NULL,
 legenda text NOT NULL CHECK(length(trim(legenda))>0),
 foto_url text NOT NULL CHECK(length(trim(foto_url))>0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX obra_fotos_parent_idx ON public.obra_fotos(obra_id);
ALTER TABLE public.obra_fotos ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.obra_fotos TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.obra_fotos TO authenticated;
GRANT ALL ON public.obra_fotos TO service_role;
CREATE POLICY "public read" ON public.obra_fotos FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "staff insert" ON public.obra_fotos FOR INSERT TO authenticated WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff update" ON public.obra_fotos FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'obras')) WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff delete" ON public.obra_fotos FOR DELETE TO authenticated USING(public.pode_editar(auth.uid(),'obras'));
CREATE TRIGGER touch_obra_fotos BEFORE UPDATE ON public.obra_fotos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_obra_fotos AFTER INSERT OR UPDATE OR DELETE ON public.obra_fotos FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TABLE public.planos_diretores (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 nome text NOT NULL CHECK(length(trim(nome))>0),
 lei text,
 descricao text,
 arquivo_url text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.planos_diretores ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.planos_diretores TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.planos_diretores TO authenticated;
GRANT ALL ON public.planos_diretores TO service_role;
CREATE POLICY "public read" ON public.planos_diretores FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "staff insert" ON public.planos_diretores FOR INSERT TO authenticated WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff update" ON public.planos_diretores FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'obras')) WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff delete" ON public.planos_diretores FOR DELETE TO authenticated USING(public.pode_editar(auth.uid(),'obras'));
CREATE TRIGGER touch_planos_diretores BEFORE UPDATE ON public.planos_diretores FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_planos_diretores AFTER INSERT OR UPDATE OR DELETE ON public.planos_diretores FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TABLE public.plano_diretor_fases (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 plano_id uuid REFERENCES public.planos_diretores(id) ON DELETE RESTRICT NOT NULL,
 nome text NOT NULL CHECK(length(trim(nome))>0),
 inicio date,
 fim date,
 situacao text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX plano_diretor_fases_parent_idx ON public.plano_diretor_fases(plano_id);
ALTER TABLE public.plano_diretor_fases ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.plano_diretor_fases TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.plano_diretor_fases TO authenticated;
GRANT ALL ON public.plano_diretor_fases TO service_role;
CREATE POLICY "public read" ON public.plano_diretor_fases FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "staff insert" ON public.plano_diretor_fases FOR INSERT TO authenticated WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff update" ON public.plano_diretor_fases FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'obras')) WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff delete" ON public.plano_diretor_fases FOR DELETE TO authenticated USING(public.pode_editar(auth.uid(),'obras'));
CREATE TRIGGER touch_plano_diretor_fases BEFORE UPDATE ON public.plano_diretor_fases FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_plano_diretor_fases AFTER INSERT OR UPDATE OR DELETE ON public.plano_diretor_fases FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TABLE public.plano_diretor_equipe (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 plano_id uuid REFERENCES public.planos_diretores(id) ON DELETE RESTRICT NOT NULL,
 nome text NOT NULL CHECK(length(trim(nome))>0),
 funcao text,
 representacao text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX plano_diretor_equipe_parent_idx ON public.plano_diretor_equipe(plano_id);
ALTER TABLE public.plano_diretor_equipe ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.plano_diretor_equipe TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.plano_diretor_equipe TO authenticated;
GRANT ALL ON public.plano_diretor_equipe TO service_role;
CREATE POLICY "public read" ON public.plano_diretor_equipe FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "staff insert" ON public.plano_diretor_equipe FOR INSERT TO authenticated WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff update" ON public.plano_diretor_equipe FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'obras')) WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff delete" ON public.plano_diretor_equipe FOR DELETE TO authenticated USING(public.pode_editar(auth.uid(),'obras'));
CREATE TRIGGER touch_plano_diretor_equipe BEFORE UPDATE ON public.plano_diretor_equipe FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_plano_diretor_equipe AFTER INSERT OR UPDATE OR DELETE ON public.plano_diretor_equipe FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TABLE public.plano_diretor_eixos (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 plano_id uuid REFERENCES public.planos_diretores(id) ON DELETE RESTRICT NOT NULL,
 nome text NOT NULL CHECK(length(trim(nome))>0),
 descricao text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX plano_diretor_eixos_parent_idx ON public.plano_diretor_eixos(plano_id);
ALTER TABLE public.plano_diretor_eixos ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.plano_diretor_eixos TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.plano_diretor_eixos TO authenticated;
GRANT ALL ON public.plano_diretor_eixos TO service_role;
CREATE POLICY "public read" ON public.plano_diretor_eixos FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "staff insert" ON public.plano_diretor_eixos FOR INSERT TO authenticated WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff update" ON public.plano_diretor_eixos FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'obras')) WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff delete" ON public.plano_diretor_eixos FOR DELETE TO authenticated USING(public.pode_editar(auth.uid(),'obras'));
CREATE TRIGGER touch_plano_diretor_eixos BEFORE UPDATE ON public.plano_diretor_eixos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_plano_diretor_eixos AFTER INSERT OR UPDATE OR DELETE ON public.plano_diretor_eixos FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TABLE public.plano_diretor_acoes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 plano_id uuid REFERENCES public.planos_diretores(id) ON DELETE RESTRICT NOT NULL,
 eixo_id uuid REFERENCES public.plano_diretor_eixos(id) ON DELETE RESTRICT NOT NULL,
 nome text NOT NULL CHECK(length(trim(nome))>0),
 descricao text,
 prazo date,
 responsavel text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX plano_diretor_acoes_parent_idx ON public.plano_diretor_acoes(plano_id);
ALTER TABLE public.plano_diretor_acoes ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.plano_diretor_acoes TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.plano_diretor_acoes TO authenticated;
GRANT ALL ON public.plano_diretor_acoes TO service_role;
CREATE POLICY "public read" ON public.plano_diretor_acoes FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "staff insert" ON public.plano_diretor_acoes FOR INSERT TO authenticated WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff update" ON public.plano_diretor_acoes FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'obras')) WITH CHECK(public.pode_editar(auth.uid(),'obras'));
CREATE POLICY "staff delete" ON public.plano_diretor_acoes FOR DELETE TO authenticated USING(public.pode_editar(auth.uid(),'obras'));
CREATE TRIGGER touch_plano_diretor_acoes BEFORE UPDATE ON public.plano_diretor_acoes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_plano_diretor_acoes AFTER INSERT OR UPDATE OR DELETE ON public.plano_diretor_acoes FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TABLE public.conselho_membros (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 conselho_id uuid REFERENCES public.conselhos(id) ON DELETE RESTRICT NOT NULL,
 nome text NOT NULL CHECK(length(trim(nome))>0),
 tipo text NOT NULL CHECK (tipo IN ('Titular','Suplente')),
 representacao text NOT NULL CHECK (representacao IN ('Sociedade civil','Governo')),
 entidade text,
 inicio date,
 fim date,
 ativo boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX conselho_membros_parent_idx ON public.conselho_membros(conselho_id);
ALTER TABLE public.conselho_membros ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.conselho_membros TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.conselho_membros TO authenticated;
GRANT ALL ON public.conselho_membros TO service_role;
CREATE POLICY "public read" ON public.conselho_membros FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "staff insert" ON public.conselho_membros FOR INSERT TO authenticated WITH CHECK(public.pode_editar(auth.uid(),'conselhos'));
CREATE POLICY "staff update" ON public.conselho_membros FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'conselhos')) WITH CHECK(public.pode_editar(auth.uid(),'conselhos'));
CREATE POLICY "staff delete" ON public.conselho_membros FOR DELETE TO authenticated USING(public.pode_editar(auth.uid(),'conselhos'));
CREATE TRIGGER touch_conselho_membros BEFORE UPDATE ON public.conselho_membros FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_conselho_membros AFTER INSERT OR UPDATE OR DELETE ON public.conselho_membros FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TABLE public.conselho_acoes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 conselho_id uuid REFERENCES public.conselhos(id) ON DELETE RESTRICT NOT NULL,
 tipo text NOT NULL CHECK (tipo IN ('Reunião','Ata','Palestra','Pauta','Outra ação')),
 titulo text NOT NULL CHECK(length(trim(titulo))>0),
 data date NOT NULL,
 descricao text,
 arquivo_url text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX conselho_acoes_parent_idx ON public.conselho_acoes(conselho_id);
ALTER TABLE public.conselho_acoes ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.conselho_acoes TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.conselho_acoes TO authenticated;
GRANT ALL ON public.conselho_acoes TO service_role;
CREATE POLICY "public read" ON public.conselho_acoes FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "staff insert" ON public.conselho_acoes FOR INSERT TO authenticated WITH CHECK(public.pode_editar(auth.uid(),'conselhos'));
CREATE POLICY "staff update" ON public.conselho_acoes FOR UPDATE TO authenticated USING(public.pode_editar(auth.uid(),'conselhos')) WITH CHECK(public.pode_editar(auth.uid(),'conselhos'));
CREATE POLICY "staff delete" ON public.conselho_acoes FOR DELETE TO authenticated USING(public.pode_editar(auth.uid(),'conselhos'));
CREATE TRIGGER touch_conselho_acoes BEFORE UPDATE ON public.conselho_acoes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER auditoria_conselho_acoes AFTER INSERT OR UPDATE OR DELETE ON public.conselho_acoes FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

-- Frente COVID: vinculo explicito de acao emergencial nos registros de origem.
ALTER TABLE public.publicacoes ADD COLUMN acao_emergencial text,
 ADD COLUMN casos_confirmados integer CHECK(casos_confirmados>=0),
 ADD COLUMN casos_ativos integer CHECK(casos_ativos>=0),
 ADD COLUMN obitos integer CHECK(obitos>=0),
 ADD COLUMN recuperados integer CHECK(recuperados>=0);
ALTER TABLE public.contratos ADD COLUMN acao_emergencial text;
ALTER TABLE public.receitas ADD COLUMN acao_emergencial text;
ALTER TABLE public.despesas ADD COLUMN acao_emergencial text;
ALTER TABLE public.servidores ADD COLUMN acao_emergencial text;

ALTER TABLE public.plano_diretor_eixos ADD CONSTRAINT eixo_plano_par UNIQUE(plano_id,id);
ALTER TABLE public.plano_diretor_acoes ADD CONSTRAINT acao_eixo_mesmo_plano FOREIGN KEY(plano_id,eixo_id) REFERENCES public.plano_diretor_eixos(plano_id,id) ON DELETE RESTRICT;
