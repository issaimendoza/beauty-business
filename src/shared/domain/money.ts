export type MoneyMinor = number & { readonly __brand: "MoneyMinor" };

export function moneyMinor(value: number): MoneyMinor {
  if (!Number.isSafeInteger(value)) {
    throw new Error("El importe debe expresarse como entero en unidades menores.");
  }
  return value as MoneyMinor;
}

export function fromMajorUnits(value: string | number): MoneyMinor {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error("El importe no es válido.");
  }
  return moneyMinor(Math.round(parsed * 100));
}

export function formatMoney(value: number, locale = "es-MX", currency = "MXN") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value / 100);
}
