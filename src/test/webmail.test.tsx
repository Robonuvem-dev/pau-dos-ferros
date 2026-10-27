import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { WebmailFrame } from "@/components/admin/WebmailFrame";
import { ADMIN_MODULES, WEBMAIL_URL } from "@/lib/admin-modules";

afterEach(cleanup);
it("renderiza o login institucional solicitado em um iframe de altura integral", () => {
  render(<WebmailFrame />);
  const frame = screen.getByTitle("Webmail institucional");
  expect(frame).toHaveAttribute(
    "src",
    "https://webmail.atllas.org/login?domain=paudosferros.rn.gov.br",
  );
  expect(frame).toHaveClass("h-dvh", "w-full", "border-0");
  expect(frame).not.toHaveAttribute("sandbox");
});
it("mantém o módulo de correio na navegação interna do painel", () => {
  expect(ADMIN_MODULES.find((m) => m.id === "16")?.pages).toEqual([
    { label: "Abrir webmail", to: "/admin/webmail" },
  ]);
  expect(new URL(WEBMAIL_URL).searchParams.get("domain")).toBe("paudosferros.rn.gov.br");
});
