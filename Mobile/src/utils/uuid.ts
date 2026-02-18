import * as Crypto from "expo-crypto";

export function uuid(): string {
  // expo-crypto (SDK reciente) trae randomUUID()
  // Si por alguna razón no está, fallback:
  // @ts-ignore
  if (typeof Crypto.randomUUID === "function") return Crypto.randomUUID();

  // fallback simple
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}

export function shortId(len = 7): string {
  // estilo “Hexfit”
  return Math.random().toString(36).slice(2, 2 + len);
}
