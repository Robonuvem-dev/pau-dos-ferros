import { describe, expect, it } from 'vitest';
import { municipalDate, visibleBanners } from '@/lib/public-content';

describe('public banner configuration', () => {
  const banner = { id: 'banner', ativo: true, imagem_url: '/image.jpg', inicio: '2026-10-24', fim: '2026-10-24' };
  it('includes both configured boundary dates', () => {
    expect(visibleBanners([banner], '2026-10-24')).toEqual([banner]);
  });
  it('excludes disabled banners', () => {
    expect(visibleBanners([{ ...banner, ativo: false }], '2026-10-24')).toEqual([]);
  });
  it('excludes banners outside the configured period', () => {
    expect(visibleBanners([banner], '2026-10-23')).toEqual([]);
    expect(visibleBanners([banner], '2026-10-25')).toEqual([]);
  });
  it('uses the municipal date around UTC midnight', () => {
    expect(municipalDate(new Date('2026-10-25T01:00:00Z'))).toBe('2026-10-24');
  });
});