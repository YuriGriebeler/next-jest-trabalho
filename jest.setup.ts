import { webcrypto } from "node:crypto";

try {
  if (typeof globalThis.Request === "undefined") {
    globalThis.Request = Request;
  }
} catch {}

try {
  if (typeof globalThis.Response === "undefined") {
    globalThis.Response = Response;
  }
} catch {}

try {
  if (typeof globalThis.fetch === "undefined") {
    globalThis.fetch = fetch;
  }
} catch {}

if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = webcrypto as Crypto;
}

process.env.RTL_SKIP_AUTO_CLEANUP = "true";