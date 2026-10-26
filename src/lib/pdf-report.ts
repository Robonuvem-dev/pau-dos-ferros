import { formatCell, type ModuleDef } from './modules';

export interface ReportSection { title: string; columns: string[]; rows: unknown[][] }
export async function downloadReport(title: string, sections: ReportSection[], context = '') {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ orientation: sections.some(s => s.columns.length > 5) ? 'landscape' : 'portrait' });
  const width = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.text('Prefeitura Municipal de Pau dos Ferros/RN', 14, 16);
  doc.setFontSize(16);
  const heading = doc.splitTextToSize(title, width - 28);
  doc.text(heading, 14, 26);
  let y = 30 + heading.length * 6;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  const note = doc.splitTextToSize(context || 'Dados dos registros consultados', width - 28);
  doc.text(note, 14, y); y += note.length * 5 + 5;
  for (const section of sections) {
    if (y > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = 18; }
    doc.setFontSize(11); doc.text(section.title, 14, y);
    autoTable(doc, { startY: y + 4, head: [section.columns], body: section.rows.length ? section.rows.map(row => row.map(v => String(v ?? '—'))) : [section.columns.map((_, i) => i ? '' : 'Nenhum registro')], styles: { font: 'helvetica', fontSize: 8, overflow: 'linebreak', cellPadding: 3 }, margin: { bottom: 18 }, showHead: 'everyPage', rowPageBreak: 'avoid' });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  }
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFontSize(8); doc.text(`Emitido em ${new Date().toLocaleString('pt-BR')} · Página ${i} de ${pages}`, 14, doc.internal.pageSize.getHeight() - 8); }
  doc.save(`${title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`);
}
export function moduleReport(mod: ModuleDef, rows: Record<string, unknown>[], context = '') {
  // Full records are printed vertically: long descriptions never shrink into dozens of narrow columns.
  return downloadReport(mod.label, rows.map((r, i) => ({ title: String(r.numero ?? r.titulo ?? r.nome ?? `Registro ${i + 1}`), columns: ['Campo', 'Informação'], rows: mod.fields.map(f => [f.label, formatCell(f, r[f.name])]) })), context);
}