import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const source = readFileSync('public/install.js', 'utf8');
let cleanups: (() => void)[] = [];

beforeEach(() => {
  document.body.innerHTML = '<button id="install" hidden>Instalar</button><p id="status"></p>';
  const original = window.addEventListener.bind(window);
  vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
    original(type, listener, options);
    cleanups.push(() => window.removeEventListener(type, listener, options));
  });
});
afterEach(() => { cleanups.forEach(fn => fn()); cleanups = []; vi.restoreAllMocks(); });

function boot() { window.eval(source); }
function offer(outcome: 'accepted' | 'dismissed') {
  const event = new Event('beforeinstallprompt', { cancelable: true });
  const prompt = vi.fn().mockResolvedValue(undefined);
  Object.assign(event, { prompt, userChoice: Promise.resolve({ outcome }) });
  window.dispatchEvent(event);
  return { event, prompt };
}
describe('Instalação pelo navegador', () => {
  it('não oferece um botão sem suporte do navegador', () => {
    boot(); expect(document.querySelector<HTMLButtonElement>('#install')!.hidden).toBe(true);
  });
  it('só pede instalação após toque e não reutiliza a solicitação', async () => {
    boot(); const { event, prompt } = offer('accepted');
    expect(event.defaultPrevented).toBe(true); expect(prompt).not.toHaveBeenCalled();
    const button = document.querySelector<HTMLButtonElement>('#install')!;
    expect(button.hidden).toBe(false); button.click();
    await vi.waitFor(() => expect(document.querySelector('#status')!.textContent).toContain('Solicitação aceita'));
    button.click(); expect(prompt).toHaveBeenCalledTimes(1); expect(button.hidden).toBe(true);
  });
  it('informa cancelamento sem afirmar que instalou', async () => {
    boot(); offer('dismissed'); document.querySelector<HTMLButtonElement>('#install')!.click();
    await vi.waitFor(() => expect(document.querySelector('#status')!.textContent).toContain('cancelada'));
    expect(document.querySelector('#status')!.textContent).not.toContain('Aplicativo instalado');
  });
  it('confirma a instalação somente quando recebe o evento do navegador', () => {
    boot(); offer('accepted'); window.dispatchEvent(new Event('appinstalled'));
    expect(document.querySelector('#status')!.textContent).toContain('Aplicativo instalado');
    expect(document.querySelector<HTMLButtonElement>('#install')!.hidden).toBe(true);
  });
});
