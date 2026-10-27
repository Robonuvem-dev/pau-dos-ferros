import { useState } from "react";
import { db } from "@/lib/data";
import { consultarApiExterna, ORIGENS_API } from "@/lib/integracao-externa";
import { formatCell, getModule } from "@/lib/modules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function IntegracaoExterna({ modulo, onDone }: { modulo: string; onDone: () => void }) {
  const origens = ORIGENS_API[modulo];
  const [origem, setOrigem] = useState(origens?.[0] ?? "");
  const [competencia, setCompetencia] = useState(() =>
    new Intl.DateTimeFormat("sv-SE", {
      timeZone: "America/Fortaleza",
      year: "numeric",
      month: "2-digit",
    }).format(new Date()),
  );
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  if (!origens) return null;
  const campos = getModule(modulo)?.fields ?? [];
  const limpar = () => {
    setRows([]);
    setErro("");
    setSucesso("");
  };
  const consultar = async () => {
    limpar();
    setBusy(true);
    try {
      setRows(await consultarApiExterna(modulo, origem, competencia));
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const confirmar = async () => {
    setBusy(true);
    setErro("");
    setSucesso("");
    try {
      const { data, error } = await db.rpc("importar_dados_poc", {
        _modulo: modulo,
        _origem: `API ${origem}`,
        _linhas: rows,
      });
      if (error) throw error;
      setRows([]);
      setSucesso(`${data} registros sincronizados e auditados.`);
      onDone();
    } catch (e) {
      setErro(
        (e as { code?: string }).code === "23505"
          ? "Estes registros já foram sincronizados. O reenvio foi recusado sem duplicar dados."
          : "Não foi possível confirmar a sincronização. Confira os registros e suas permissões antes de tentar novamente.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <section aria-label="Integração externa" className="mb-5 rounded border bg-card p-4">
      <h2 className="font-semibold">Integração externa</h2>
      <div className="my-3 flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm">
          Origem
          <select
            className="h-10 rounded border bg-background px-3"
            value={origem}
            disabled={busy}
            onChange={(e) => {
              limpar();
              setOrigem(e.target.value);
            }}
          >
            {origens.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Competência
          <Input
            type="month"
            value={competencia}
            disabled={busy}
            onChange={(e) => {
              limpar();
              setCompetencia(e.target.value);
            }}
          />
        </label>
        <Button variant="outline" disabled={busy || !competencia} onClick={() => void consultar()}>
          {busy ? "Processando..." : "Importar da API externa"}
        </Button>
      </div>
      {erro && (
        <p role="alert" className="my-2 text-destructive">
          {erro}
        </p>
      )}
      {sucesso && (
        <p role="status" className="my-2">
          {sucesso}
        </p>
      )}
      {rows.length > 0 && (
        <>
          <p className="my-2 text-sm">
            {rows.length} registros disponíveis. Revise os valores antes de confirmar.
          </p>
          <div className="mb-3 max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {Object.keys(rows[0] ?? {}).map((c) => (
                    <th key={c} className="border p-2 text-left">
                      {campos.find((f) => f.name === c)?.label ?? c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    {Object.entries(r).map(([c, v]) => (
                      <td key={c} className="border p-2">
                        {formatCell(campos.find((f) => f.name === c) ?? { name: c, label: c }, v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <Button disabled={busy} onClick={() => void confirmar()}>
              Confirmar sincronização
            </Button>
            <Button variant="outline" disabled={busy} onClick={limpar}>
              Cancelar
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
