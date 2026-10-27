import { useEffect } from 'react';
import { VERSAO } from '@/lib/versao';
import { needsVersionReload } from '@/lib/remote-version';
export function RemoteVersion() {
  useEffect(() => {
    let disposed = false;
    const check = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) return;
        const remote: unknown = await response.json();
        if (!disposed && !document.querySelector('[role="dialog"], form:focus-within') && needsVersionReload(VERSAO, remote, sessionStorage.getItem('version-reload-attempt'))) {
          sessionStorage.setItem('version-reload-attempt', remote.version);
          window.location.reload();
        }
      } catch { /* A indisponibilidade da rede não encerra o trabalho do usuário. */ }
    };
    void check();
    const timer = window.setInterval(() => void check(), 60_000);
    window.addEventListener('focus', check);
    window.addEventListener('online', check);
    return () => { disposed = true; window.clearInterval(timer); window.removeEventListener('focus', check); window.removeEventListener('online', check); };
  }, []);
  return null;
}
