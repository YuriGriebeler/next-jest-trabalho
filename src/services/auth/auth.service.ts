import { AppError } from "@/utils/app-error";
import type { AuthUser, LoginPayload } from "./auth.types";

type LoginValidationErrors = {
  email?: string;
  password?: string;
};

const DEMO_USER = {
  id: process.env.AUTH_DEMO_USER_ID ?? "aluno_demo",
  name: process.env.AUTH_DEMO_USER_NAME ?? "Aluno Demo",
  email: (process.env.AUTH_DEMO_EMAIL ?? "aluno@authtask.dev").toLowerCase(),
  password: process.env.AUTH_DEMO_PASSWORD ?? "123456",
} as const;

export function validateLoginPayload(
  payload: Partial<LoginPayload>,
): LoginValidationErrors {
  const errors: LoginValidationErrors = {};
  const email = payload.email?.trim() ?? "";
  const password = payload.password?.trim() ?? "";

  if (!email) {
    errors.email = "E-mail é obrigatório.";
  } else if (!/^[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+$/.test(email)) {
    errors.email = "Formato de e-mail inválido.";
  }

  if (!password) {
    errors.password = "Senha é obrigatória.";
  } else if (password.length < 6) {
    errors.password = "Senha deve conter pelo menos 6 caracteres.";
  }

  return errors;
}

export function hasValidationErrors(errors: LoginValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function sanitizeUserId(value: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    return "";
  }

  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function authenticateUser(payload: LoginPayload): Promise<AuthUser> {
  const validationErrors = validateLoginPayload(payload);

  if (hasValidationErrors(validationErrors)) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Dados de login inválidos",
      400,
      validationErrors
    );
  }

  const inputEmail = payload.email.trim().toLowerCase();
  const inputPassword = payload.password.trim();

  if (
    inputEmail !== DEMO_USER.email ||
    inputPassword !== DEMO_USER.password
  ) {
    throw new AppError(
      "INVALID_CREDENTIALS",
      "Credenciais inválidas",
      401
    );
  }

  return {
    id: sanitizeUserId(DEMO_USER.id),
    name: DEMO_USER.name,
    email: DEMO_USER.email,
  };
}