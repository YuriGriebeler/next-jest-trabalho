import { AppError, isAppError } from "@/utils/app-error";

describe("AppError", () => {
  it("cria instância correta com code, message e status", () => {
    const error = new AppError("INVALID_CREDENTIALS", "Credenciais inválidas", 401);

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AppError");
    expect(error.code).toBe("INVALID_CREDENTIALS");
    expect(error.message).toBe("Credenciais inválidas");
    expect(error.status).toBe(401);
  });

  it("permite criar sem status (usa padrão 500)", () => {
    const error = new AppError("INTERNAL_ERROR", "Erro interno");

    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.status).toBe(500);
    expect(error.message).toBe("Erro interno");
  });

  it("aceita detalhes opcionais", () => {
    const details = { email: "inválido", password: "curta" };
    const error = new AppError("BAD_REQUEST", "Dados inválidos", 400, details);

    expect(error.details).toEqual(details);
  });

  it("cria instância com todos os parâmetros", () => {
    const details = { field: "email", reason: "format" };
    const error = new AppError("VALIDATION_ERROR", "Campo inválido", 422, details);

    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Campo inválido");
    expect(error.status).toBe(422);
    expect(error.details).toEqual(details);
  });
});

describe("isAppError", () => {
  it("retorna true para instância de AppError", () => {
    expect(isAppError(new AppError("TEST", "Teste", 400))).toBe(true);
  });

  it("retorna false para erro nativo Error", () => {
    expect(isAppError(new Error("Genérico"))).toBe(false);
  });

  it("retorna false para valores não-erro", () => {
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError({ message: "fake" })).toBe(false);
    expect(isAppError(123)).toBe(false);
    expect(isAppError("string")).toBe(false);
  });
});