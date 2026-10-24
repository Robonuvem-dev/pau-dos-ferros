import { describe,it,expect } from "vitest";
import { prazoAtendimento,prazoEsic } from "@/lib/atendimento/prazos";
describe("Prazo próprio do recurso LAI",()=>{
 it("aplica cinco dias ao recurso e preserva prazo inicial",()=>{
  const data=new Date("2026-10-24T01:00:00Z");
  expect(prazoAtendimento(data,"esic",false,"Recurso").toISOString().slice(0,10)).toBe("2026-10-28");
  expect(prazoAtendimento(data,"esic",true,"Recurso").toISOString().slice(0,10)).toBe("2026-10-28");
  expect(prazoEsic(data,false).toISOString().slice(0,10)).toBe("2026-11-12");
  expect(prazoEsic(data,true).toISOString().slice(0,10)).toBe("2026-11-22");
 });
});
