import { describe, expect, it } from "vitest";
import { getModule, modulePermissionTable } from "../lib/modules";
describe("M04 — permissões coerentes com RLS", () => {
  it.each(["convenios", "concedentes", "convenentes", "tipos-convenio", "convenio-parcelas", "convenio-obrigacoes"])("%s usa o grupo convenios", key => {
    expect(modulePermissionTable(getModule(key)!)).toBe("convenios");
  });
  it("contratos conserva permissão própria para escrita", () => {
    expect(modulePermissionTable(getModule("contratos")!)).toBe("contratos");
  });
});
