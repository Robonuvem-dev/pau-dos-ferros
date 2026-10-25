import { readFile, writeFile } from 'node:fs/promises';
const source = await readFile('src/lib/versao.ts', 'utf8');
const version = source.match(/export const VERSAO = "([^"]+)"/)?.[1];
if (!version) throw new Error('Versão não encontrada');
await writeFile('public/version.json', JSON.stringify({ version }) + '\n');
