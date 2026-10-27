import { describe, expect, it } from 'vitest';
import { getModule } from '@/lib/modules';
import { ADMIN_MODULES, WEBMAIL_URL } from '@/lib/admin-modules';
describe('Municipal navigation', () => {
  it('contains exactly the sixteen required modules', () => {
    expect(ADMIN_MODULES.map(m => Number(m.id))).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
  });
  it('uses the requested external webmail destination', () => {
    expect(WEBMAIL_URL).toBe('https://webmail.atllas.org/login');
  });
  it.each(ADMIN_MODULES.flatMap(m => m.keys))('resolves evaluation resource %s', key => {
    expect(getModule(key)?.table).toBeTruthy();
  });
  it.each([['leis','lei'],['decretos','decreto'],['portarias','portaria'],['resolucoes','resolucao'],['diarias','diaria'],['categorias-convenio','tipos-convenio'],['metas-convenio','convenios'],['planos-aplicacao','convenios'],['boletim-epidemiologico','covid']])('preserves %s using its existing schema', (alias, key) => {
    expect(getModule(alias)).toBe(getModule(key));
  });
});