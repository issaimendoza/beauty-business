import { moneyMinor, type MoneyMinor } from "@/shared/domain/money";

export interface SettlementSuggestion {
  priceMinor: MoneyMinor;
  salonMinor: MoneyMinor;
  professionalMinor: MoneyMinor;
}

export function suggestSettlement(listPriceMinor: number, salonShareBps: number): SettlementSuggestion {
  if (!Number.isSafeInteger(listPriceMinor) || listPriceMinor < 0) {
    throw new Error("El precio de lista debe ser un entero no negativo.");
  }
  if (!Number.isInteger(salonShareBps) || salonShareBps < 0 || salonShareBps > 10_000) {
    throw new Error("El porcentaje del salón debe estar entre 0 y 100%.");
  }

  const salonMinor = Math.round((listPriceMinor * salonShareBps) / 10_000);
  return {
    priceMinor: moneyMinor(listPriceMinor),
    salonMinor: moneyMinor(salonMinor),
    professionalMinor: moneyMinor(listPriceMinor - salonMinor),
  };
}

export function assertFinalSettlement(input: {
  suggested: SettlementSuggestion;
  finalPriceMinor: number;
  finalSalonMinor: number;
  finalProfessionalMinor: number;
  priceAdjustmentReason?: string | null;
  splitAdjustmentReason?: string | null;
}) {
  const { suggested, finalPriceMinor, finalSalonMinor, finalProfessionalMinor } = input;
  if (![finalPriceMinor, finalSalonMinor, finalProfessionalMinor].every(Number.isSafeInteger)) {
    throw new Error("Los importes finales deben ser enteros en centavos.");
  }
  if (finalPriceMinor < 0 || finalSalonMinor < 0 || finalProfessionalMinor < 0) {
    throw new Error("Los importes finales no pueden ser negativos.");
  }
  if (finalPriceMinor !== finalSalonMinor + finalProfessionalMinor) {
    throw new Error("El total final debe coincidir con la suma del salón y la colaboradora.");
  }
  if (finalPriceMinor !== suggested.priceMinor && !input.priceAdjustmentReason?.trim()) {
    throw new Error("Explica por qué el precio final es diferente a la sugerencia.");
  }
  if (
    (finalSalonMinor !== suggested.salonMinor || finalProfessionalMinor !== suggested.professionalMinor) &&
    !input.splitAdjustmentReason?.trim()
  ) {
    throw new Error("Explica por qué el reparto final es diferente a la sugerencia.");
  }
}
