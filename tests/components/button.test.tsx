import { render, screen } from "@testing-library/react";
import { Scissors } from "lucide-react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("conserva nombre accesible junto con un icono", () => {
    render(<Button><Scissors /> Registrar servicio</Button>);
    expect(screen.getByRole("button", { name: "Registrar servicio" })).toBeEnabled();
  });
});
