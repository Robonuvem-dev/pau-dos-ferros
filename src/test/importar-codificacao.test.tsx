import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ImportarArquivo } from '@/components/admin/ImportarArquivo';

vi.mock('@/lib/data', () => ({ db: { rpc: vi.fn() } }));
afterEach(cleanup);
const csv = 'ano;mes;orgao;chave_externa;empenhado\n2026;10;Educação fictícia;X1;100,50';
function arquivo(read: () => Promise<ArrayBuffer>) {
  const file = new File(['fictício'], 'despesas.csv', { type: 'text/csv' });
  Object.defineProperty(file, 'arrayBuffer', { value: read });
  return file;
}
function abrir() {
  render(<ImportarArquivo modulo="despesas" onDone={() => {}} />);
  fireEvent.click(screen.getByText('Importar arquivo CSV'));
}
describe('Prévia com codificação escolhida pelo operador', () => {
  it('mostra acentos ANSI e descarta a prévia ao alterar a codificação', async () => {
    abrir();
    fireEvent.change(screen.getByLabelText('Codificação do arquivo CSV'), { target: { value: 'windows-1252' } });
    const bytes = Uint8Array.from(Array.from(csv, c => c.charCodeAt(0))).buffer;
    fireEvent.change(screen.getByLabelText('Arquivo CSV para importar'), { target: { files: [arquivo(async () => bytes)] } });
    expect(await screen.findByText('Educação fictícia')).toBeVisible();
    fireEvent.change(screen.getByLabelText('Codificação do arquivo CSV'), { target: { value: 'utf-8' } });
    expect(screen.queryByText('Confirmar importação')).not.toBeInTheDocument();
  });
  it('não restaura prévia antiga se o operador mudar a codificação durante a leitura', async () => {
    abrir();
    let finish!: (value: ArrayBuffer) => void;
    const reading = new Promise<ArrayBuffer>(resolve => { finish = resolve; });
    fireEvent.change(screen.getByLabelText('Arquivo CSV para importar'), { target: { files: [arquivo(() => reading)] } });
    fireEvent.change(screen.getByLabelText('Codificação do arquivo CSV'), { target: { value: 'windows-1252' } });
    await act(async () => finish(new TextEncoder().encode(csv).buffer));
    expect(screen.queryByText('Confirmar importação')).not.toBeInTheDocument();
    expect(screen.queryByText('Educação fictícia')).not.toBeInTheDocument();
  });
});
