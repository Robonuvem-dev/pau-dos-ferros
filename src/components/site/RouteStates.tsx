import { useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
export function QueryError() {
  const router = useRouter();
  return <div role="alert" className="mx-auto max-w-6xl px-4 py-16"><h1 className="text-2xl font-bold">Não foi possível carregar esta página</h1><Button className="mt-4" onClick={() => router.invalidate()}>Tentar novamente</Button></div>;
}
export function QueryNotFound() { return <div className="mx-auto max-w-6xl px-4 py-16"><h1 className="text-2xl font-bold">Registro não encontrado</h1><p className="mt-3">O conteúdo solicitado não está disponível.</p></div>; }