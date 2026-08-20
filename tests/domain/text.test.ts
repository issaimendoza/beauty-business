import { describe, expect, it } from "vitest";

import { normalizeCatalogName } from "@/shared/domain/text";

describe("normalizeCatalogName", () => {
  it("normaliza acentos, espacios y mayúsculas para búsquedas estables", () => {
    expect(normalizeCatalogName("  Diseño   de UÑAS ")).toBe("diseno de unas");
  });
});
