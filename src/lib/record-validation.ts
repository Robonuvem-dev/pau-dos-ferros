import type { ModuleDef } from './modules';
export function validateRecord(mod: ModuleDef, values: Record<string, unknown>): void {
  const missing = mod.fields.find(f => f.required && (values[f.name] == null || String(values[f.name]).trim() === ''));
  if (missing) throw new Error(`Preencha o campo “${missing.label}”.`);
  for (const f of mod.fields) {
    const v = values[f.name];
    if (v != null && v !== '' && ['number', 'money', 'int'].includes(f.type ?? '') && !Number.isFinite(Number(v))) throw new Error(`Número inválido em “${f.label}”.`);
  }
  if (mod.key === 'veiculos' && values.situacao === 'Baixado' && !values.baixa_frota) throw new Error('Informe a data de baixa do veículo.');
  if (mod.key === 'obras' && values.situacao === 'Concluída' && !values.data_fim) throw new Error('Informe o término efetivo da obra concluída.');
  if (mod.key === 'contratos' && ['Aditivo', 'Adesão (Carona)'].includes(String(values.tipo)) && !values.contrato_origem_id) throw new Error('Selecione o contrato ou ata de origem.');
}
