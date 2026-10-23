import { describe, expect, it } from "vitest";
import {
  BIDDING_STATUS,
  normalizeBiddingStatus,
  assertBiddingStatusTransition,
  getBiddingPhasePlan,
  canEditBiddingDetails,
  BiddingWorkflowError,
} from "../lib/compras/bidding-workflow";
import {
  calculateInclusiveContractTermDays,
  resolveContractAmendmentEffect,
  contractBudgetUnitIdsForMutation,
  ContractLifecycleError,
} from "../lib/compras/contract-lifecycle";

describe("PoC M03 — regras reutilizadas da Celeriflow", () => {
  it("normaliza estados históricos de licitação", () => {
    expect(normalizeBiddingStatus("Em Andamento")).toBe(BIDDING_STATUS.OPEN);
    expect(normalizeBiddingStatus("Desconhecido")).toBeNull();
  });

  it("aceita transição válida e impede retrocesso após homologação", () => {
    expect(assertBiddingStatusTransition(BIDDING_STATUS.PUBLISHED, BIDDING_STATUS.OPEN).next)
      .toBe(BIDDING_STATUS.OPEN);
    expect(() => assertBiddingStatusTransition(BIDDING_STATUS.HOMOLOGATED, BIDDING_STATUS.DRAFT))
      .toThrow(BiddingWorkflowError);
  });

  it("mostra cronograma de fases e restringe edição", () => {
    expect(getBiddingPhasePlan(BIDDING_STATUS.OPEN)?.length).toBe(6);
    expect(canEditBiddingDetails(BIDDING_STATUS.OPEN)).toBe(false);
    expect(canEditBiddingDetails(BIDDING_STATUS.DRAFT)).toBe(true);
  });

  it("calcula prazo contratual inclusivo", () => {
    expect(calculateInclusiveContractTermDays(new Date("2026-10-01"), new Date("2026-10-31"))).toBe(31);
  });

  it("aplica aditivo de prazo sem alterar o valor", () => {
    const out = resolveContractAmendmentEffect(
      { updatedValue: 10000, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31") },
      { type: "Prazo", newEndDate: new Date("2027-06-30") },
    );
    expect(out.contractUpdate).toHaveProperty("endDate");
    expect(out.contractUpdate).not.toHaveProperty("updatedValue");
  });

  it("usa a role admin de Pau dos Ferros sem admitir editor em unidade não autorizada", () => {
    expect(contractBudgetUnitIdsForMutation(
      { profileCode: "admin", allowedBudgetUnitIds: [] },
      { requestedSourceBudgetUnitId: "UG-1" },
    )).toContain("UG-1");
    expect(() => contractBudgetUnitIdsForMutation(
      { profileCode: "editor", allowedBudgetUnitIds: ["UG-2"] },
      { requestedSourceBudgetUnitId: "UG-1" },
    )).toThrow(ContractLifecycleError);
  });
});
