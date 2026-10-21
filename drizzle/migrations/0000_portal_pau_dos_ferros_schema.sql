
create type public.app_role as enum ('admin', 'editor');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select, insert, update, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','editor'))
$$;

create policy "own roles readable" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin manages roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.handle_first_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_first_admin after insert on auth.users
  for each row execute function public.handle_first_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create table public.noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null, slug text unique, resumo text, conteudo text,
  capa_url text, video_url text, audio_url text, categoria text default 'Geral',
  tags text[] default '{}', publicado boolean not null default true,
  publicado_em timestamptz not null default now(),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  titulo text not null, imagem_url text, link text, ordem int default 0, ativo boolean default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.albuns (
  id uuid primary key default gen_random_uuid(),
  titulo text not null, descricao text, capa_url text, fotos text[] default '{}', data date default current_date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.midias (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'video', titulo text not null, descricao text, url text, data date default current_date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.agentes_politicos (
  id uuid primary key default gen_random_uuid(),
  nome text not null, cargo text not null, foto_url text, biografia text, email text, telefone text, ordem int default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.secretarias (
  id uuid primary key default gen_random_uuid(),
  nome text not null, sigla text, secretario text, descricao text, endereco text, telefone text, email text, horario text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.licitacoes (
  id uuid primary key default gen_random_uuid(),
  numero text not null, modalidade text not null default 'Pregão Eletrônico', tipo text default 'Licitação',
  objeto text not null, situacao text default 'Aberta', data_abertura date, valor_estimado numeric(14,2),
  secretaria text, fundamentacao text, arquivo_url text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.contratos (
  id uuid primary key default gen_random_uuid(),
  numero text not null, tipo text default 'Contrato', fornecedor text not null, cnpj text, objeto text not null,
  valor numeric(14,2), data_inicio date, data_fim date, licitacao_numero text, secretaria text, arquivo_url text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.empresas_inidoneas (
  id uuid primary key default gen_random_uuid(),
  razao_social text not null, cnpj text, sancao text, data_inicio date, data_fim date, motivo text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.convenios (
  id uuid primary key default gen_random_uuid(),
  numero text not null, tipo text default 'Recebido', concedente text not null, convenente text, objeto text not null,
  valor numeric(14,2), contrapartida numeric(14,2), data_inicio date, data_fim date, situacao text default 'Em execução', arquivo_url text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.publicacoes (
  id uuid primary key default gen_random_uuid(),
  categoria text not null, titulo text not null, numero text, data date default current_date, ementa text,
  orgao text, valor numeric(14,2), arquivo_url text, ano int,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.receitas (
  id uuid primary key default gen_random_uuid(),
  ano int not null, mes int not null, categoria text not null, descricao text,
  previsto numeric(14,2) default 0, arrecadado numeric(14,2) default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.despesas (
  id uuid primary key default gen_random_uuid(),
  ano int not null, mes int not null, orgao text not null, funcao text, elemento text, credor text, empenho text,
  empenhado numeric(14,2) default 0, liquidado numeric(14,2) default 0, pago numeric(14,2) default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.servidores (
  id uuid primary key default gen_random_uuid(),
  nome text not null, matricula text, cargo text, vinculo text default 'Efetivo', lotacao text,
  admissao date, remuneracao numeric(14,2), competencia text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.obras (
  id uuid primary key default gen_random_uuid(),
  nome text not null, descricao text, local text, empresa text, valor numeric(14,2),
  percentual int default 0, situacao text default 'Em andamento', data_inicio date, previsao_fim date,
  art text, fotos text[] default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.veiculos (
  id uuid primary key default gen_random_uuid(),
  placa text not null, modelo text not null, ano int, tipo text, secretaria text, situacao text default 'Ativo', combustivel text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.conselhos (
  id uuid primary key default gen_random_uuid(),
  nome text not null, sigla text, descricao text, lei_criacao text, presidente text, membros text, contato text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.servicos (
  id uuid primary key default gen_random_uuid(),
  nome text not null, descricao text, secretaria text, publico text, requisitos text, prazo text,
  custo text default 'Gratuito', link text, tags text[] default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['noticias','banners','albuns','midias','agentes_politicos','secretarias','licitacoes','contratos','empresas_inidoneas','convenios','publicacoes','receitas','despesas','servidores','obras','veiculos','conselhos','servicos']
  loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "staff insert" on public.%I for insert to authenticated with check (public.is_staff(auth.uid()))', t);
    execute format('create policy "staff update" on public.%I for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()))', t);
    execute format('create policy "staff delete" on public.%I for delete to authenticated using (public.is_staff(auth.uid()))', t);
    execute format('create trigger touch_%I before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

drop policy "public read" on public.noticias;
create policy "public read published" on public.noticias for select to anon, authenticated
  using (publicado or public.is_staff(auth.uid()));

create table public.atendimentos (
  id uuid primary key default gen_random_uuid(),
  protocolo text unique not null default ('PF' || to_char(now(),'YYYY') || lpad((floor(random()*1000000))::text,6,'0')),
  canal text not null default 'esic', tipo text default 'Pedido de informação',
  nome text, email text, telefone text, anonimo boolean default false,
  assunto text not null, mensagem text not null,
  status text not null default 'Recebido', resposta text, respondido_em timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select, update, delete on public.atendimentos to authenticated;
grant all on public.atendimentos to service_role;
alter table public.atendimentos enable row level security;
create policy "staff read" on public.atendimentos for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff update" on public.atendimentos for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "admin delete" on public.atendimentos for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger touch_atendimentos before update on public.atendimentos for each row execute function public.touch_updated_at();

create or replace function public.consultar_protocolo(_protocolo text)
returns table(protocolo text, canal text, assunto text, status text, resposta text, created_at timestamptz, respondido_em timestamptz)
language sql stable security definer set search_path = public as $$
  select a.protocolo, a.canal, a.assunto, a.status, a.resposta, a.created_at, a.respondido_em
  from public.atendimentos a where a.protocolo = upper(trim(_protocolo))
$$;
grant execute on function public.consultar_protocolo(text) to anon, authenticated;

create or replace function public.registrar_atendimento(_canal text, _tipo text, _nome text, _email text, _telefone text, _anonimo boolean, _assunto text, _mensagem text)
returns text language plpgsql security definer set search_path = public as $$
declare p text;
begin
  if length(coalesce(_assunto,'')) < 3 or length(coalesce(_mensagem,'')) < 10 then
    raise exception 'Assunto e mensagem são obrigatórios';
  end if;
  insert into public.atendimentos(canal,tipo,nome,email,telefone,anonimo,assunto,mensagem)
  values (left(_canal,20),left(_tipo,100),left(_nome,200),left(_email,200),left(_telefone,40),coalesce(_anonimo,false),left(_assunto,300),left(_mensagem,5000))
  returning protocolo into p;
  return p;
end $$;
grant execute on function public.registrar_atendimento(text,text,text,text,text,boolean,text,text) to anon, authenticated;

create policy "staff read arquivos" on storage.objects for select to authenticated using (bucket_id = 'arquivos' and public.is_staff(auth.uid()));
create policy "staff upload arquivos" on storage.objects for insert to authenticated with check (bucket_id = 'arquivos' and public.is_staff(auth.uid()));
create policy "staff update arquivos" on storage.objects for update to authenticated using (bucket_id = 'arquivos' and public.is_staff(auth.uid()));
create policy "staff delete arquivos" on storage.objects for delete to authenticated using (bucket_id = 'arquivos' and public.is_staff(auth.uid()));

insert into public.agentes_politicos (nome,cargo,biografia,ordem) values
('Prefeito(a) Municipal','Prefeito(a)','Chefe do Poder Executivo Municipal de Pau dos Ferros, gestão 2025-2028.',1),
('Vice-Prefeito(a) Municipal','Vice-Prefeito(a)','Vice-chefe do Poder Executivo Municipal.',2);

insert into public.secretarias (nome,sigla,secretario,endereco,telefone,email,horario) values
('Secretaria Municipal de Administração','SEAD','Secretário(a) de Administração','Av. Getúlio Vargas, 1323, Centro','(84) 3351-2000','sead@paudosferros.rn.gov.br','Seg a Sex, 7h às 13h'),
('Secretaria Municipal de Planejamento e Desenvolvimento Econômico','SEPLAN','Secretário(a) de Planejamento','Av. Getúlio Vargas, 1323, Centro','(84) 3351-2000','seplan@paudosferros.rn.gov.br','Seg a Sex, 7h às 13h'),
('Secretaria Municipal de Saúde','SMS','Secretário(a) de Saúde','Centro','(84) 3351-2100','saude@paudosferros.rn.gov.br','Seg a Sex, 7h às 13h'),
('Secretaria Municipal de Educação','SEMEC','Secretário(a) de Educação','Centro','(84) 3351-2200','educacao@paudosferros.rn.gov.br','Seg a Sex, 7h às 13h'),
('Secretaria Municipal de Infraestrutura e Urbanismo','SEINFRA','Secretário(a) de Infraestrutura','Centro','(84) 3351-2300','infra@paudosferros.rn.gov.br','Seg a Sex, 7h às 13h');

insert into public.noticias (titulo,slug,resumo,conteudo,categoria,tags,publicado_em) values
('Prefeitura inicia construção dos pórticos das entradas da cidade','porticos-entradas-cidade','Obra vai valorizar as principais entradas de Pau dos Ferros.','A Prefeitura de Pau dos Ferros iniciou nesta semana a construção dos pórticos nas entradas da cidade. A obra faz parte do programa de requalificação urbana e deve ser concluída nos próximos meses.','Urbanismo','{urbanismo,obras}', now() - interval '1 day'),
('Festival Kids movimenta a Praça da Matriz','festival-kids-praca-matriz','Programação gratuita reuniu centenas de famílias no fim de semana.','O Festival Kids reuniu atrações culturais, brincadeiras e apresentações para as crianças do município, com programação totalmente gratuita.','Cultura','{cultura,lazer}', now() - interval '3 days'),
('Campanha de vacinação contra a gripe é ampliada','vacinacao-gripe-ampliada','Todas as UBS estão aplicando a vacina para o público acima de 6 meses.','A Secretaria Municipal de Saúde informa que a campanha de vacinação contra a gripe foi ampliada para toda a população a partir de 6 meses de idade.','Saúde','{saude,vacinacao}', now() - interval '5 days'),
('Matrículas da rede municipal abertas para 2027','matriculas-rede-municipal-2027','Pais e responsáveis já podem realizar a matrícula online.','A Secretaria de Educação abriu o período de matrículas da rede municipal de ensino para o ano letivo de 2027.','Educação','{educacao}', now() - interval '8 days');

insert into public.licitacoes (numero,modalidade,tipo,objeto,situacao,data_abertura,valor_estimado,secretaria) values
('PE 6/2026-0036','Pregão Eletrônico','Licitação','Locação de solução tecnológica integrada de Portal Oficial, Portal da Transparência e Webmail institucional.','Em andamento','2026-10-19',180000,'SEAD'),
('PE 6/2026-0031','Pregão Eletrônico','Licitação','Aquisição de material de expediente para as secretarias municipais.','Homologada','2026-09-02',95400.50,'SEAD'),
('DL 12/2026','Dispensa','Dispensa','Contratação emergencial de manutenção de bombas d''água.','Concluída','2026-08-15',38500,'SEINFRA'),
('CC 3/2026','Concorrência','Licitação','Pavimentação em paralelepípedo de ruas do bairro São Benedito.','Aberta','2026-11-05',1250000,'SEINFRA');

insert into public.contratos (numero,fornecedor,cnpj,objeto,valor,data_inicio,data_fim,licitacao_numero,secretaria) values
('045/2026','Papelaria Central LTDA','12.345.678/0001-90','Fornecimento de material de expediente.',95400.50,'2026-09-20','2027-09-19','PE 6/2026-0031','SEAD'),
('039/2026','Hidro Serviços ME','98.765.432/0001-10','Manutenção emergencial de bombas d''água.',38500,'2026-08-20','2026-12-20','DL 12/2026','SEINFRA'),
('021/2026','Construtora Alto Oeste LTDA','11.222.333/0001-44','Reforma da UBS Centro.',420000,'2026-03-01','2026-11-30',null,'SMS');

insert into public.convenios (numero,tipo,concedente,convenente,objeto,valor,contrapartida,data_inicio,data_fim,situacao) values
('913245/2025','Recebido','Ministério das Cidades','Prefeitura de Pau dos Ferros','Pavimentação e drenagem urbana.',1500000,75000,'2025-12-01','2027-06-30','Em execução'),
('TC 018/2026','Recebido','Governo do Estado do RN','Prefeitura de Pau dos Ferros','Aquisição de equipamentos para a rede de saúde.',320000,16000,'2026-04-10','2027-04-09','Em execução');

insert into public.publicacoes (categoria,titulo,numero,data,ementa,orgao,ano,valor) values
('lei','Lei Orçamentária Anual 2026','702/2025','2025-12-20','Estima a receita e fixa a despesa do Município para o exercício de 2026.','Gabinete',2025,null),
('lei','Lei de Diretrizes Orçamentárias 2027','724/2026','2026-07-10','Dispõe sobre as diretrizes para a elaboração da LOA 2027.','Gabinete',2026,null),
('decreto','Decreto de Governo Digital','2082/2023','2023-05-04','Institui a política municipal de governo digital.','Gabinete',2023,null),
('decreto','Decreto CMAS','2801/2026','2026-03-12','Nomeia membros do Conselho Municipal de Assistência Social.','Gabinete',2026,null),
('portaria','Designação de pregoeira','022/2025','2025-01-15','Designa servidora para a função de pregoeira.','SEGOV',2025,null),
('diaria','Diária - viagem a Natal/RN','D-112/2026','2026-09-12','Participação em capacitação do TCE/RN. Beneficiário: servidor da SEAD.','SEAD',2026,820),
('rreo','RREO 4º Bimestre 2026','4/2026','2026-09-30','Relatório Resumido da Execução Orçamentária.','SEPLAN',2026,null),
('rgf','RGF 2º Quadrimestre 2026','2/2026','2026-09-30','Relatório de Gestão Fiscal.','SEPLAN',2026,null),
('concurso','Processo Seletivo Simplificado - Saúde','PSS 01/2026','2026-06-01','Contratação temporária de profissionais de saúde.','SMS',2026,null),
('covid','Plano municipal de contingência COVID-19','PC 01/2020','2020-03-20','Plano de contingência e despesas emergenciais.','SMS',2020,null);

insert into public.receitas (ano,mes,categoria,descricao,previsto,arrecadado) values
(2026,7,'Receitas Correntes','Impostos, taxas e contribuições',1450000,1388000),
(2026,7,'Transferências Correntes','FPM, ICMS, FUNDEB, SUS',7800000,7950200),
(2026,8,'Receitas Correntes','Impostos, taxas e contribuições',1450000,1502300),
(2026,8,'Transferências Correntes','FPM, ICMS, FUNDEB, SUS',7800000,7620400),
(2026,8,'Receitas de Capital','Convênios e operações de crédito',600000,410000);

insert into public.despesas (ano,mes,orgao,funcao,elemento,credor,empenho,empenhado,liquidado,pago) values
(2026,8,'Secretaria de Saúde','Saúde','Material de consumo','Distribuidora Médica RN','2026/1452',120000,98000,98000),
(2026,8,'Secretaria de Educação','Educação','Vencimentos e vantagens','Folha de pagamento','2026/1460',2350000,2350000,2350000),
(2026,8,'Secretaria de Infraestrutura','Urbanismo','Obras e instalações','Construtora Alto Oeste LTDA','2026/1471',420000,210000,180000),
(2026,8,'Secretaria de Administração','Administração','Material de expediente','Papelaria Central LTDA','2026/1480',31800,31800,31800);

insert into public.servidores (nome,matricula,cargo,vinculo,lotacao,admissao,remuneracao,competencia) values
('Ana Maria de Souza','10234','Professora','Efetivo','Secretaria de Educação','2012-03-01',4850.00,'08/2026'),
('José Carlos Lima','10871','Agente Administrativo','Efetivo','Secretaria de Administração','2015-02-10',2310.40,'08/2026'),
('Francisca Oliveira','20112','Enfermeira','Contratado','Secretaria de Saúde','2024-05-02',3900.00,'08/2026'),
('Pedro Henrique Alves','30005','Assessor Técnico','Comissionado','Gabinete','2025-01-02',3200.00,'08/2026');

insert into public.obras (nome,descricao,local,empresa,valor,percentual,situacao,data_inicio,previsao_fim,art) values
('Pórticos das entradas da cidade','Construção de pórticos nas entradas norte e sul.','BR-405 / RN-177','Construtora Alto Oeste LTDA',680000,25,'Em andamento','2026-10-10','2027-03-30','ART RN2026000123'),
('Reforma da UBS Centro','Reforma geral e ampliação da UBS.','Centro','Construtora Alto Oeste LTDA',420000,70,'Em andamento','2026-03-01','2026-11-30','ART RN2026000045'),
('Pavimentação Bairro São Benedito','Pavimentação em paralelepípedo de 12 ruas.','São Benedito','A definir',1250000,0,'Licitação','2026-12-01','2027-08-30',null);

insert into public.veiculos (placa,modelo,ano,tipo,secretaria,situacao,combustivel) values
('QGA-1A23','Fiat Strada',2022,'Utilitário','SEINFRA','Ativo','Flex'),
('QGB-4B56','Renault Master Ambulância',2023,'Ambulância','SMS','Ativo','Diesel'),
('QGC-7C89','Mercedes Ônibus Escolar',2021,'Ônibus','SEMEC','Em manutenção','Diesel');

insert into public.conselhos (nome,sigla,descricao,lei_criacao,presidente,contato) values
('Conselho Municipal de Assistência Social','CMAS','Órgão deliberativo da política de assistência social.','Lei 210/1996','A definir','cmas@paudosferros.rn.gov.br'),
('Conselho Municipal de Saúde','CMS','Controle social do SUS no município.','Lei 180/1993','A definir','cms@paudosferros.rn.gov.br'),
('Conselho Municipal de Educação','CME','Normatização e acompanhamento da educação municipal.','Lei 300/2001','A definir','cme@paudosferros.rn.gov.br');

insert into public.servicos (nome,descricao,secretaria,publico,requisitos,prazo,link,tags) values
('Emissão de 2ª via do IPTU','Emita a segunda via do boleto do IPTU.','SEAD','Cidadão','CPF ou inscrição do imóvel','Imediato',null,'{iptu,tributos}'),
('Contracheque online','Emissão de contracheque para servidores.','SEAD','Servidor','Matrícula e CPF','Imediato',null,'{servidor,rh}'),
('Agendamento de consulta','Marcação de consultas nas UBS.','SMS','Cidadão','Cartão SUS e documento com foto','Até 7 dias',null,'{saude}'),
('Matrícula escolar','Matrícula na rede municipal de ensino.','SEMEC','Cidadão','Certidão de nascimento, comprovante de residência','Até 5 dias',null,'{educacao}'),
('Alvará de construção','Licença para construção ou reforma.','SEINFRA','Cidadão/Empresa','Projeto, ART e documentos do imóvel','Até 30 dias',null,'{obras,alvara}');

insert into public.banners (titulo,ordem) values ('Bem-vindo ao Portal Oficial de Pau dos Ferros',1);
