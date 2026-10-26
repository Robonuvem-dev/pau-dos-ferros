import { downloadReport } from '@/lib/pdf-report';
import { useState } from "react";
import { gerarDocumentoCarta, baixarDocumentoCarta } from "@/lib/documentos-carta";
import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/servicos_/ficha")({
  head: () => pageHead("Ficha técnica de serviço em branco", "Modelo em branco para cadastro de serviços da Carta de Serviços ao Usuário."),
  component: Ficha,
});

const CAMPOS = ["Nome do serviço", "Descrição", "Público-alvo", "Setor responsável", "Perfil responsável pelo atendimento", "Requisitos e documentos", "Prazo de atendimento", "Custo", "Forma de acesso / link online", "Tags", "Parecer técnico do Ouvidor Geral"];

function Ficha() {
  const [erro,setErro]=useState("");
  const imprimir=async()=>{try{setErro("");await gerarDocumentoCarta("ficha");await downloadReport("Ficha técnica de serviço",[{title:"Cadastro do serviço",columns:["Campo","Preenchimento"],rows:[...CAMPOS.map(c=>[c,"________________________________________________________\n\n"]),...[1,2,3,4,5].map(n=>["Etapa "+n,"________________________________________________________"])]}],"Carta de Serviços ao Usuário — Lei 13.460/2017");}catch(e){setErro((e as Error).message);}};
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="font-display text-2xl font-bold">Ficha técnica de serviço</h1>
        <div className="flex gap-2"><Button variant="outline" onClick={()=>void baixarDocumentoCarta("ficha").catch(e=>setErro(e.message))}>Baixar modelo HTML</Button><Button onClick={()=>void imprimir()}><Printer />Baixar PDF</Button></div>
      </div>
      {erro&&<p role="alert">{erro}</p>}
      <div className="rounded border bg-card p-6">
        <p className="mb-4 text-center font-bold uppercase">Prefeitura Municipal de Pau dos Ferros/RN — Carta de Serviços ao Usuário (Lei 13.460/2017)</p>
        {CAMPOS.map((c) => <div key={c} className="mb-3"><div className="text-sm font-semibold">{c}</div><div className="h-10 border-b border-dashed" /></div>)}
        <div className="text-sm font-semibold">Etapas</div>
        {[1, 2, 3, 4, 5].map((n) => <div key={n} className="flex h-8 items-end gap-2 border-b border-dashed text-sm">{n}.</div>)}
      </div>
    </div>
  );
}
