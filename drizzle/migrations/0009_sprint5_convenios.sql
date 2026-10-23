-- Sprint 5 / M04: ampliar convênios e registrar parcelas/obrigações, sem modificar tabelas de outros módulos.
alter table public.convenios
 add column if not exists responsavel_concedente text,
 add column if not exists responsavel_convenente text,
 add column if not exists valor_global numeric(14,2),
 add column if not exists metas text,
 add column if not exists plano_aplicacao text,
 add column if not exists contrato_numero text,
 add column if not exists periodicidade_prestacao text,
 add column if not exists observacoes text;

update public.convenios set valor_global=valor where valor_global is null and valor is not null;

create table if not exists public.convenio_parcelas (
 id uuid primary key default gen_random_uuid(),
 convenio_id uuid not null references public.convenios(id) on delete cascade,
 numero integer not null check (numero > 0),
 valor numeric(14,2) not null check (valor >= 0),
 vencimento date,
 recebido_em date,
 status text not null default 'Programada' check (status in ('Programada','Recebida','Cancelada')),
 descricao text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (convenio_id, numero)
);
create table if not exists public.convenio_obrigacoes (
 id uuid primary key default gen_random_uuid(),
 convenio_id uuid not null references public.convenios(id) on delete cascade,
 titulo text not null,
 vencimento date,
 cumprida_em date,
 situacao text not null default 'Pendente' check (situacao in ('Pendente','Cumprida','Cancelada')),
 descricao text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists convenio_parcelas_convenio on public.convenio_parcelas(convenio_id);
create index if not exists convenio_obrigacoes_convenio on public.convenio_obrigacoes(convenio_id);

do $$
declare t text;
begin
 foreach t in array array['convenio_parcelas','convenio_obrigacoes'] loop
  execute format('grant select on public.%I to anon, authenticated',t);
  execute format('grant insert,update,delete on public.%I to authenticated',t);
  execute format('grant all on public.%I to service_role',t);
  execute format('alter table public.%I enable row level security',t);
  execute format('create policy "leitura publica" on public.%I for select to anon,authenticated using (true)',t);
  execute format('create policy "insercao autorizada" on public.%I for insert to authenticated with check (public.pode_editar(auth.uid(), %L))',t,'convenios');
  execute format('create policy "atualizacao autorizada" on public.%I for update to authenticated using (public.pode_editar(auth.uid(), %L)) with check (public.pode_editar(auth.uid(), %L))',t,'convenios','convenios');
  execute format('create policy "exclusao autorizada" on public.%I for delete to authenticated using (public.pode_editar(auth.uid(), %L))',t,'convenios');
  execute format('create trigger touch_%1$s before update on public.%1$I for each row execute function public.touch_updated_at()',t);
  execute format('create trigger auditoria_%1$s after insert or update or delete on public.%1$I for each row execute function public.registrar_auditoria()',t);
 end loop;
end $$;
