(() => {
  const button = document.getElementById('install');
  const status = document.getElementById('status');
  let pending = null;
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => {});
  }
  if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
    status.textContent = 'Você já está usando a versão instalada. Abra o portal para continuar.';
  } else {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault(); pending = event; button.hidden = false;
      status.textContent = 'Seu navegador permite instalar. Toque no botão acima e confirme.';
    });
  }
  button.addEventListener('click', async () => {
    const prompt = pending;
    if (!prompt) return;
    pending = null; button.hidden = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      status.textContent = choice.outcome === 'accepted'
        ? 'Solicitação aceita. Confirme o ícone na tela inicial do aparelho.'
        : 'Instalação cancelada. Você pode continuar pelo portal ou usar o menu do navegador.';
    } catch {
      status.textContent = 'Use o menu do navegador e escolha Adicionar à tela inicial.';
    }
  });
  window.addEventListener('appinstalled', () => {
    pending = null; button.hidden = true;
    status.textContent = 'Aplicativo instalado. Procure Aurora das Veredas na tela inicial.';
  });
})();
