import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getEnvironment } from "@/shared/infrastructure/config/env";

export function apiUnauthorized() {
  return NextResponse.json(
    { error: { code: "AUTH_REQUIRED", message: "Tu sesión terminó. Vuelve a iniciar sesión." } },
    { status: 401 },
  );
}

export function assertTrustedJsonRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("application/json")) {
    throw new Error("La solicitud debe enviarse como JSON.");
  }
  const origin = request.headers.get("origin");
  const configuredOrigin = new URL(getEnvironment().BETTER_AUTH_URL).origin;
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const requestHostMatches = origin && forwardedHost && new URL(origin).host === forwardedHost;
  if (origin && origin !== configuredOrigin && !requestHostMatches) {
    throw new Error("El origen de la solicitud no es válido.");
  }
}

export function apiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Revisa la información marcada e inténtalo de nuevo.",
          fields: error.flatten().fieldErrors,
        },
      },
      { status: 422 },
    );
  }
  const technicalMessage = error instanceof Error ? error.message : "Unknown error";
  console.error("Error de API", { technicalMessage });
  const isBusinessError =
    error instanceof Error &&
    /(debe|explica|seleccionad|disponible|acuerdo|cursor|fecha|importe|servicio|colaboradora)/i.test(error.message);
  return NextResponse.json(
    {
      error: {
        code: isBusinessError ? "BUSINESS_RULE" : "UNEXPECTED_ERROR",
        message: isBusinessError
          ? error.message
          : "No pudimos completar la acción. Reintenta; si continúa, solicita soporte.",
      },
    },
    { status: isBusinessError ? 409 : 500 },
  );
}
