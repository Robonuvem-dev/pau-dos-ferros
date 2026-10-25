import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
export function SolicitarServico({ id }: { id: string }) {
  const qc = useQueryClient();
  const [protocolo, setProtocolo] = useState(''), [erro, setErro] = useState(''), [busy, setBusy] = useState(false);
  return <details className="rounded border p-3"><summary className="cursor-pointer font-semibold">Solicitar atendimento deste serviço</summary>
    {protocolo ? <p role="status" className="mt-3">Solicitação recebida. Guarde seu protocolo: <strong>{protocolo}</strong></p> : <form className="mt-3 grid gap-3" onSubmit={async e => {
      e.preventDefault(); const form = new FormData(e.currentTarget); setBusy(true); setErro('');
      try {
        const {data,error} = await db.rpc('solicitar_servico', {_servico:id,_nome:form.get('nome'),_email:form.get('email'),_mensagem:form.get('mensagem')});
        if (error) throw error;
        setProtocolo(String(data)); void qc.invalidateQueries({queryKey:['public-servicos-stats']});
      } catch { setErro('Não foi possível registrar. Confira os campos e aguarde antes de tentar novamente.'); }
      finally {setBusy(false);}
    }}>
      <label>Nome<Input name="nome" required minLength={2} maxLength={200} autoComplete="name" /></label>
      <label>E-mail para contato<Input name="email" type="email" required maxLength={320} autoComplete="email" /></label>
      <label>Descreva sua solicitação<Textarea name="mensagem" required minLength={10} maxLength={4000} /></label>
      <p className="text-xs">Os dados são enviados à equipe responsável pelo serviço para tratamento da solicitação.</p>
      {erro && <p role="alert">{erro}</p>}
      <Button type="submit" disabled={busy}>{busy?'Enviando...':'Enviar solicitação'}</Button>
    </form>}
  </details>;
}
