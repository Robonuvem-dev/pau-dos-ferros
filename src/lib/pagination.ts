/** Consulta todas as páginas em ordem estável, sem truncar relatórios em mil linhas. */
export async function collectPages<T>(load: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>, size = 500): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += size) {
    const { data, error } = await load(from, from + size - 1);
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Consulta retornou uma página sem dados.");
    rows.push(...data);
    if (data.length < size) return rows;
  }
}
