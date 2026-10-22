create table public.permissoes_modulo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, tabela text not null,
  created_at timestamptz not null default now(),
  unique (user_id, tabela)
);
grant select, insert, update, delete on public.permissoes_modulo to authenticated;
grant all on public.permissoes_modulo to service_role;
alter table public.permissoes_modulo enable row level security;
create policy "own or admin read" on public.permissoes_modulo for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin manage" on public.permissoes_modulo for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.pode_editar(_user_id uuid, _tabela text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(_user_id,'admin') or (
    public.has_role(_user_id,'editor') and (
      not exists (select 1 from public.permissoes_modulo where user_id = _user_id)
      or exists (select 1 from public.permissoes_modulo where user_id = _user_id and tabela = _tabela)))
$$;

do $$
declare t text;
begin
  foreach t in array array['noticias','banners','albuns','midias','agentes_politicos','secretarias','licitacoes','contratos','empresas_inidoneas','convenios','publicacoes','receitas','despesas','servidores','obras','veiculos','conselhos','servicos','credores'] loop
    execute format('drop policy if exists "staff insert" on public.%I', t);
    execute format('drop policy if exists "staff update" on public.%I', t);
    execute format('drop policy if exists "staff delete" on public.%I', t);
    execute format('create policy "module insert" on public.%1$I for insert to authenticated with check (public.pode_editar(auth.uid(), %2$L))', t, t);
    execute format('create policy "module update" on public.%1$I for update to authenticated using (public.pode_editar(auth.uid(), %2$L)) with check (public.pode_editar(auth.uid(), %2$L))', t, t);
    execute format('create policy "module delete" on public.%1$I for delete to authenticated using (public.pode_editar(auth.uid(), %2$L))', t, t);
  end loop;
end $$;

create trigger auditoria_permissoes_modulo after insert or update or delete on public.permissoes_modulo for each row execute function public.registrar_auditoria();

create or replace function public.registrar_acesso(_evento text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or _evento not in ('LOGIN','LOGOUT') then return; end if;
  insert into public.auditoria(user_id, tabela, acao, registro_id, dados)
  values (auth.uid(), 'sessao', _evento, auth.uid()::text, jsonb_build_object('email', auth.jwt()->>'email'));
end $$;
revoke execute on function public.registrar_acesso(text) from anon, public;
grant execute on function public.registrar_acesso(text) to authenticated;

create table public.solicitacoes_melhoria (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  titulo text not null check (char_length(titulo) between 3 and 150),
  descricao text not null check (char_length(descricao) <= 4000),
  modulo text, prioridade text not null default 'Média',
  status text not null default 'Aberta', resposta text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.solicitacoes_melhoria to authenticated;
grant all on public.solicitacoes_melhoria to service_role;
alter table public.solicitacoes_melhoria enable row level security;
create policy "own or admin read" on public.solicitacoes_melhoria for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "staff create" on public.solicitacoes_melhoria for insert to authenticated with check (user_id = auth.uid() and public.is_staff(auth.uid()));
create policy "admin update" on public.solicitacoes_melhoria for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin delete" on public.solicitacoes_melhoria for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger touch_solicitacoes_melhoria before update on public.solicitacoes_melhoria for each row execute function public.touch_updated_at();
create trigger auditoria_solicitacoes_melhoria after insert or update or delete on public.solicitacoes_melhoria for each row execute function public.registrar_auditoria();