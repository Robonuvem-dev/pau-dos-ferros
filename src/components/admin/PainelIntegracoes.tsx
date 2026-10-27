import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { IntegracaoExterna } from "./IntegracaoExterna";
import { Button } from "@/components/ui/button";

const DESTINOS = [
  { modulo: "receitas", label: "7.1 — Contabilidade: receitas" },
  { modulo: "despesas", label: "7.1 — Contabilidade: despesas" },
  { modulo: "servidores", label: "7.2 — Folha de pagamento" },
  { modulo: "credores", label: "7.3 — TCE: credores" },
  { modulo: "agentes-politicos", label: "7.3 — TCE: agentes políticos" },
];

export function PainelIntegracoes({ somenteFolha = false }: { somenteFolha?: boolean }) {
  const qc = useQueryClient();
  const destinos = somenteFolha ? DESTINOS.filter((d) => d.modulo === "servidores") : DESTINOS;
  const [modulo, setModulo] = useState(somenteFolha ? "servidores" : "receitas");
  const atualizar = () => {
    for (const key of ["admin-module", "public-module", "admin-counts", "pendencias"]) {
      void qc.invalidateQueries({ queryKey: [key] });
    }
  };
  return (
    <section
      aria-label="Importação de serviços externos"
      className="mb-6 rounded-lg border-2 border-primary/20 p-4"
    >
      <h2 className="mb-3 text-xl font-semibold">Importar dados de serviços externos</h2>
      <div role="group" aria-label="Tipo de integração" className="mb-4 flex flex-wrap gap-2">
        {destinos.map((d) => (
          <Button
            key={d.modulo}
            variant={modulo === d.modulo ? "default" : "outline"}
            aria-pressed={modulo === d.modulo}
            onClick={() => setModulo(d.modulo)}
          >
            {d.label}
          </Button>
        ))}
      </div>
      <IntegracaoExterna key={modulo} modulo={modulo} onDone={atualizar} />
    </section>
  );
}
