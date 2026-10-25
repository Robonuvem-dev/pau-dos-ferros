import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { PublicTable } from '@/components/site/PublicTable';
import type { ModuleDef } from '@/lib/modules';

vi.mock('@tanstack/react-query', () => ({ useSuspenseQuery: () => ({ data: [
  { id: '1', titulo: 'Orçamento fictício', arquivo_url: 'https://example.invalid/loa.pdf' },
  { id: '2', titulo: 'Diretrizes fictícias', arquivo_url: 'https://example.invalid/ldo.pdf' },
] }) }));
vi.mock('@/lib/queries', () => ({ moduleQuery: () => ({}) }));
vi.mock('@/lib/documentos-carta', () => ({ baixarDocumentoCarta: vi.fn() }));

afterEach(cleanup);
const mod: ModuleDef = {
  key: 'lei', table: 'publicacoes', label: 'Leis', descricao: 'Legislação', grupo: 'Transparência', publico: true,
  fields: [{ name: 'titulo', label: 'Título' }, { name: 'arquivo_url', label: 'Arquivo', type: 'file' }],
};

describe('LAI — acesso identificável à consulta pública', () => {
  it('identifica pesquisa, cabeçalhos e cada documento pelo registro', () => {
    render(<PublicTable mod={mod} />);
    expect(screen.getByRole('textbox', { name: 'Pesquisar em Leis' })).toBeVisible();
    const table = screen.getByRole('table', { name: /Leis: 2 registro/ });
    for (const header of within(table).getAllByRole('columnheader')) expect(header).toHaveAttribute('scope', 'col');
    expect(screen.getByRole('link', { name: 'Abrir Arquivo: Orçamento fictício' })).toHaveAttribute('href', 'https://example.invalid/loa.pdf');
    expect(screen.getByRole('link', { name: 'Abrir Arquivo: Diretrizes fictícias' })).toHaveAttribute('href', 'https://example.invalid/ldo.pdf');
  });
  it('atualiza o resultado acessível e mantém somente o documento pesquisado', () => {
    render(<PublicTable mod={mod} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Pesquisar em Leis' }), { target: { value: 'Orçamento' } });
    expect(screen.getByRole('table', { name: /Leis: 1 registro/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Diretrizes fictícias/ })).not.toBeInTheDocument();
  });
  it('identifica também documentos ocultos na tabela, disponíveis nos detalhes', () => {
    render(<PublicTable mod={{ ...mod, fields: mod.fields.map(f => f.type === 'file' ? { ...f, hideInTable: true } : f) }} />);
    const details = screen.getAllByText('Ver informações completas')[0];
    if (!details) throw new Error('Detalhes do registro não encontrados');
    fireEvent.click(details);
    expect(screen.getAllByRole('link', { name: 'Abrir Arquivo: Orçamento fictício', hidden: true })[0]).toHaveAttribute('href', 'https://example.invalid/loa.pdf');
  });
});
