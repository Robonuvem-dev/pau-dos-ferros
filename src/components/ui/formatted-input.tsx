import { useState, type ComponentProps } from "react";
import { Input } from "./input";
import {
  formatMaskedValue,
  maskText,
  parseLocalizedNumber,
  type FieldMask,
} from "@/lib/formatting";

type Props = Omit<ComponentProps<typeof Input>, "value" | "onChange"> & {
  mask: FieldMask;
  value: unknown;
  onValueChange: (value: string | number) => void;
};
export function FormattedInput({ mask, value, onValueChange, onFocus, onBlur, ...props }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const numeric = ["money", "decimal", "percent"].includes(mask);
  const display = value == null || value === "" ? "" : formatMaskedValue(mask, value);
  return (
    <Input
      {...props}
      type={mask === "month" ? "month" : "text"}
      inputMode={
        numeric
          ? "decimal"
          : ["cpf", "document", "cep", "phone"].includes(mask)
            ? "numeric"
            : "text"
      }
      value={mask === "month" ? String(value ?? "") : (draft ?? display)}
      onFocus={(e) => {
        if (numeric) {
          const n = parseLocalizedNumber(value);
          setDraft(
            n === null
              ? ""
              : n.toLocaleString("pt-BR", { useGrouping: false, maximumFractionDigits: 10 }),
          );
        }
        onFocus?.(e);
      }}
      onChange={(e) => {
        if (numeric) {
          const text = e.target.value.replace(/R\$|%|\s/g, "");
          if (!/^-?[\d.,]*$/.test(text)) return;
          setDraft(text);
          const n = parseLocalizedNumber(text);
          onValueChange(n ?? "");
        } else onValueChange(mask === "month" ? e.target.value : maskText(mask, e.target.value));
      }}
      onBlur={(e) => {
        setDraft(null);
        onBlur?.(e);
      }}
    />
  );
}
