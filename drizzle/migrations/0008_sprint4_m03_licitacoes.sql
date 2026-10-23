alter table public.contratos
  add column if not exists contrato_origem text,
  add column if not exists valor_atualizado numeric,
  add column if not exists data_fim_atualizada date;

update public.contratos set valor_atualizado = valor where valor_atualizado is null;
update public.contratos set data_fim_atualizada = data_fim where data_fim_atualizada is null;

create table public.licitacao_andamentos (id uuid primary key default gen_random_uuid(), licitacao_numero text not null, fase text not null, data date, descricao text, arquivo_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.comissoes (id uuid primary key default gen_random_uuid(), nome text not null, tipo text, portaria text, data_inicio date, data_fim date, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.membros_equipe (id uuid primary key default gen_random_uuid(), comissao text, nome text not null, funcao text, tipo_equipe text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.parcerias (id uuid primary key default gen_random_uuid(), nome text not null, tipo text, entidade text, objeto text, valor numeric, data_inicio date, data_fim date, arquivo_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.termos_fomento (id uuid primary key default gen_random_uuid(), numero text not null, osc text not null, cnpj text, objeto text, valor numeric, data_inicio date, data_fim date, arquivo_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

do $$
declare t text;
begin
  foreach t in array array['licitacao_andamentos','comissoes','membros_equipe','parcerias','termos_fomento'] loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "module insert" on public.%I for insert to authenticated with check (public.pode_editar(auth.uid(), %L))', t, t);
    execute format('create policy "module update" on public.%I for update to authenticated using (public.pode_editar(auth.uid(), %L)) with check (public.pode_editar(auth.uid(), %L))', t, t, t);
    execute format('create policy "module delete" on public.%I for delete to authenticated using (public.pode_editar(auth.uid(), %L))', t, t);
    execute format('create trigger touch_%1$s before update on public.%1$I for each row execute function public.touch_updated_at()', t);
    execute format('create trigger auditoria_%1$s after insert or update or delete on public.%1$I for each row execute function public.registrar_auditoria()', t);
  end loop;
end $$;

create or replace function public.recalcular_contrato(_numero text) returns void language plpgsql security definer set search_path = public as $$
begin
  update public.contratos p set
    valor_atualizado = coalesce(p.valor, 0) + coalesce((select sum(a.valor) from public.contratos a where a.contrato_origem = p.numero and a.tipo = 'Aditivo'), 0),
    data_fim_atualizada = greatest(p.data_fim, (select max(a.data_fim) from public.contratos a where a.contrato_origem = p.numero and a.tipo = 'Aditivo' and a.data_fim is not null))
  where p.numero = _numero and p.contrato_origem is null;
end $$;

create or replace function public.contratos_base() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.valor_atualizado := coalesce(new.valor_atualizado, new.valor);
    new.data_fim_atualizada := coalesce(new.data_fim_atualizada, new.data_fim);
    return new;
  end if;
  if new.contrato_origem is null and (new.valor is distinct from old.valor or new.data_fim is distinct from old.data_fim) then
    new.valor_atualizado := coalesce(new.valor, 0) + coalesce((select sum(a.valor) from public.contratos a where a.contrato_origem = new.numero and a.tipo = 'Aditivo'), 0);
    new.data_fim_atualizada := greatest(new.data_fim, (select max(a.data_fim) from public.contratos a where a.contrato_origem = new.numero and a.tipo = 'Aditivo' and a.data_fim is not null));
  end if;
  return new;
end $$;

create or replace function public.contratos_recalc() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op <> 'DELETE' and new.contrato_origem is not null then perform public.recalcular_contrato(new.contrato_origem); end if;
  if tg_op <> 'INSERT' and old.contrato_origem is not null and (tg_op = 'DELETE' or old.contrato_origem is distinct from new.contrato_origem) then perform public.recalcular_contrato(old.contrato_origem); end if;
  return null;
end $$;

create trigger contratos_base before insert or update on public.contratos for each row execute function public.contratos_base();
create trigger contratos_recalc after insert or update or delete on public.contratos for each row execute function public.contratos_recalc();