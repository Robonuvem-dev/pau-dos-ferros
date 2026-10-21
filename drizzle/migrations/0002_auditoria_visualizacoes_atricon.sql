alter table public.noticias add column if not exists visualizacoes integer not null default 0;

create or replace function public.registrar_visualizacao(_slug text)
returns void language sql security definer set search_path = public as $$
  update public.noticias set visualizacoes = visualizacoes + 1 where slug = _slug and publicado = true
$$;
grant execute on function public.registrar_visualizacao(text) to anon, authenticated;

create table public.credores (
  id uuid primary key default gen_random_uuid(),
  nome text not null, cpf_cnpj text, tipo text default 'Pessoa jurídica', municipio text, uf text, origem text default 'Cadastro manual',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select on public.credores to anon;
grant select, insert, update, delete on public.credores to authenticated;
grant all on public.credores to service_role;
alter table public.credores enable row level security;
create policy "public read" on public.credores for select to anon, authenticated using (true);
create policy "staff insert" on public.credores for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "staff update" on public.credores for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "staff delete" on public.credores for delete to authenticated using (public.is_staff(auth.uid()));
create trigger touch_credores before update on public.credores for each row execute function public.touch_updated_at();

create table public.atricon_avaliacoes (
  criterio text primary key,
  status text not null default 'nao_atende' check (status in ('atende','nao_atende','terceiro')),
  link text, observacao text,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.atricon_avaliacoes to authenticated;
grant all on public.atricon_avaliacoes to service_role;
alter table public.atricon_avaliacoes enable row level security;
create policy "staff read" on public.atricon_avaliacoes for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff insert" on public.atricon_avaliacoes for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "staff update" on public.atricon_avaliacoes for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "staff delete" on public.atricon_avaliacoes for delete to authenticated using (public.is_staff(auth.uid()));

create table public.auditoria (
  id bigserial primary key,
  user_id uuid, tabela text not null, acao text not null, registro_id text, dados jsonb,
  created_at timestamptz not null default now()
);
grant select on public.auditoria to authenticated;
grant all on public.auditoria to service_role;
alter table public.auditoria enable row level security;
create policy "admin read" on public.auditoria for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.registrar_auditoria()
returns trigger language plpgsql security definer set search_path = public as $$
declare rec jsonb;
begin
  rec := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  insert into public.auditoria(user_id, tabela, acao, registro_id, dados)
  values (auth.uid(), tg_table_name, tg_op, rec->>'id', rec);
  return coalesce(new, old);
end $$;

do $$
declare t text;
begin
  foreach t in array array['noticias','banners','albuns','midias','agentes_politicos','secretarias','licitacoes','contratos','empresas_inidoneas','convenios','publicacoes','receitas','despesas','servidores','obras','veiculos','conselhos','servicos','atendimentos','credores','user_roles','atricon_avaliacoes'] loop
    execute format('create trigger auditoria_%1$s after insert or update or delete on public.%1$I for each row execute function public.registrar_auditoria()', t);
  end loop;
end $$;

create or replace function public.admin_listar_usuarios()
returns table(id uuid, email text, nome text, created_at timestamptz, roles text[])
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Acesso restrito'; end if;
  return query select u.id, u.email::text, coalesce(p.nome,''), u.created_at,
    coalesce(array_agg(r.role::text) filter (where r.role is not null), '{}')
  from auth.users u left join public.profiles p on p.id = u.id left join public.user_roles r on r.user_id = u.id
  group by u.id, u.email, p.nome, u.created_at order by u.created_at;
end $$;
revoke execute on function public.admin_listar_usuarios() from anon, public;
grant execute on function public.admin_listar_usuarios() to authenticated;

insert into public.credores (nome,cpf_cnpj,tipo,municipio,uf,origem) values
('Papelaria Central LTDA','12.345.678/0001-90','Pessoa jurídica','Pau dos Ferros','RN','Cadastro manual'),
('Hidro Serviços ME','98.765.432/0001-10','Pessoa jurídica','Pau dos Ferros','RN','Cadastro manual'),
('Construtora Alto Oeste LTDA','11.222.333/0001-44','Pessoa jurídica','Mossoró','RN','Cadastro manual');