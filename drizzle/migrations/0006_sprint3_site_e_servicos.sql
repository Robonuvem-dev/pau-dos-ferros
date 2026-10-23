create table public.links_uteis (id uuid primary key default gen_random_uuid(), titulo text not null, url text not null, icone text, ordem integer default 0, ativo boolean default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.unidades_gestoras (id uuid primary key default gen_random_uuid(), nome text not null, codigo text, cnpj text, responsavel text, secretaria text, tipo text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.documentos (id uuid primary key default gen_random_uuid(), titulo text not null, tipo text not null default 'Outros', descricao text, data date, arquivo_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.configuracoes_site (chave text primary key, valor text, updated_at timestamptz not null default now());

do $$
declare t text;
begin
  foreach t in array array['links_uteis','unidades_gestoras','documentos'] loop
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

grant select on public.configuracoes_site to anon, authenticated;
grant insert, update, delete on public.configuracoes_site to authenticated;
grant all on public.configuracoes_site to service_role;
alter table public.configuracoes_site enable row level security;
create policy "public read" on public.configuracoes_site for select to anon, authenticated using (chave is not null);
create policy "admin write" on public.configuracoes_site for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update" on public.configuracoes_site for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger touch_configuracoes_site before update on public.configuracoes_site for each row execute function public.touch_updated_at();

alter table public.banners add column if not exists inicio date, add column if not exists fim date;
alter table public.servicos add column if not exists etapas text, add column if not exists perfil_atendimento text, add column if not exists parecer_ouvidor text, add column if not exists parecer_status text, add column if not exists anexo_url text, add column if not exists visualizacoes integer not null default 0;

create table public.servico_avaliacoes (id uuid primary key default gen_random_uuid(), servico_id uuid not null references public.servicos(id) on delete cascade, nota integer not null, util boolean, comentario text, created_at timestamptz not null default now());
grant select on public.servico_avaliacoes to authenticated;
grant all on public.servico_avaliacoes to service_role;
alter table public.servico_avaliacoes enable row level security;
create policy "staff read" on public.servico_avaliacoes for select to authenticated using (public.is_staff(auth.uid()));

create or replace function public.avaliar_servico(_servico uuid, _nota integer, _util boolean, _comentario text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if _nota < 1 or _nota > 5 then raise exception 'Nota deve ser de 1 a 5'; end if;
  insert into public.servico_avaliacoes(servico_id, nota, util, comentario) values (_servico, _nota, _util, left(_comentario, 1000));
end $$;
grant execute on function public.avaliar_servico(uuid, integer, boolean, text) to anon, authenticated;

create or replace function public.estatisticas_servicos()
returns table(servico_id uuid, avaliacoes bigint, media numeric, uteis bigint)
language sql stable security definer set search_path = public as $$
  select servico_id, count(*), round(avg(nota)::numeric, 1), count(*) filter (where util) from public.servico_avaliacoes group by servico_id
$$;
grant execute on function public.estatisticas_servicos() to anon, authenticated;

create or replace function public.registrar_visualizacao_servico(_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.servicos set visualizacoes = visualizacoes + 1 where id = _id
$$;
grant execute on function public.registrar_visualizacao_servico(uuid) to anon, authenticated;