import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { FormattedInput } from "@/components/ui/formatted-input";
import type { FieldMask } from "@/lib/formatting";
afterEach(cleanup);
function Form({ mask, initial = "" }: { mask: FieldMask; initial?: string | number }) {
  const [value, setValue] = useState<string | number>(initial);
  return (
    <>
      <FormattedInput aria-label="Campo" mask={mask} value={value} onValueChange={setValue} />
      <output data-testid="raw">{String(value)}</output>
    </>
  );
}
it("mascara digitação, colagem e limpeza de CPF/CNPJ", () => {
  render(<Form mask="document" />);
  const input = screen.getByLabelText("Campo");
  fireEvent.change(input, { target: { value: "12345678901" } });
  expect(input).toHaveValue("123.456.789-01");
  fireEvent.change(input, { target: { value: "12345678000190" } });
  expect(input).toHaveValue("12.345.678/0001-90");
  fireEvent.change(input, { target: { value: "" } });
  expect(input).toHaveValue("");
});
it("edita dinheiro sem deslocar casas decimais e grava números", () => {
  render(<Form mask="money" initial={1234.56} />);
  const input = screen.getByLabelText("Campo");
  expect(String((input as HTMLInputElement).value).replace(/\s/g, " ")).toBe("R$ 1.234,56");
  fireEvent.focus(input);
  expect(input).toHaveValue("1234,56");
  fireEvent.change(input, { target: { value: "R$ 9.876,54" } });
  expect(screen.getByTestId("raw")).toHaveTextContent("9876.54");
  fireEvent.blur(input);
  expect((input as HTMLInputElement).value.replace(/\s/g, " ")).toBe("R$ 9.876,54");
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: "" } });
  fireEvent.blur(input);
  expect(input).toHaveValue("");
});
