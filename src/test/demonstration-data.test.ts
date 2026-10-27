import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

describe('demonstration attachments', () => {
  it('provides the requested 20 readable PDF documents', () => {
    const directory = `${process.cwd()}/public/arquivos`;
    const documents = readdirSync(directory).filter(name => /^dossie-\d{2}\.pdf$/.test(name));
    expect(documents).toHaveLength(20);
    for (const name of documents) {
      expect(readFileSync(`${directory}/${name}`).subarray(0, 5).toString()).toBe('%PDF-');
    }
  });
});