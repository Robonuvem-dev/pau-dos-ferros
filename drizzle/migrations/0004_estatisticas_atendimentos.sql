create or replace function public.estatisticas_atendimentos()
returns table(canal text, status text, total bigint)
language sql stable security definer set search_path = public as $$
  select a.canal, a.status, count(*) from public.atendimentos a group by a.canal, a.status order by 1, 2
$$;
grant execute on function public.estatisticas_atendimentos() to anon, authenticated;