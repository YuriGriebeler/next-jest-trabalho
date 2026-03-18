import { authenticateUser, sanitizeUserId } from "@/services/auth/auth.service";
import { AppError } from "@/utils/app-error";

describe("authenticateUser", () => {
  beforeEach(() => {
    process.env.AUTH_DEMO_EMAIL = "aluno@authtask.dev";
    process.env.AUTH_DEMO_PASSWORD = "123456";
    process.env.AUTH_DEMO_USER_ID = "aluno_demo";
    process.env.AUTH_DEMO_USER_NAME = "Aluno Demo";
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.keys(process.env)
      .filter((key) => key.startsWith("AUTH_DEMO_"))
      .forEach((key) => delete process.env[key]);
  });

  it("retorna usuário quando credenciais são válidas", async () => {
    const user = await authenticateUser({
      email: "aluno@authtask.dev",
      password: "123456",
    });

    expect(user).toMatchObject({
      id: "aluno_demo",
      email: "aluno@authtask.dev",
      name: "Aluno Demo",
    });
  });

  it("lança AppError 401 quando email está errado", async () => {
    await expect(
      authenticateUser({ email: "errado@test.com", password: "123456" })
    ).rejects.toThrow(AppError);

    try {
      await authenticateUser({ email: "errado@test.com", password: "123456" });
    } catch (err: any) {
      expect(err.status).toBe(401);
      expect(err.message).toBe("Credenciais inválidas");
    }
  });

  it("lança AppError 401 quando senha está incorreta", async () => {
    await expect(
      authenticateUser({ email: "aluno@authtask.dev", password: "errada" })
    ).rejects.toThrow(AppError);

    try {
      await authenticateUser({ email: "aluno@authtask.dev", password: "errada" });
    } catch (err: any) {
      expect(err.status).toBe(401);
      expect(err.message).toBe("Credenciais inválidas");
    }
  });
});

describe("sanitizeUserId", () => {
  it("normaliza e limpa o userId conforme exemplo", () => {
    expect(sanitizeUserId("  User@123  ")).toBe("user_123");
  });

  it("substitui múltiplos caracteres especiais e remove acentos", () => {
    expect(sanitizeUserId("João @ Silva! 456#")).toBe("joao_silva_456");
  });

  it("converte tudo para lowercase e junta underscores", () => {
    expect(sanitizeUserId("TESTE__ABC!!")).toBe("teste_abc");
  });

  it("remove underscores do início e do fim", () => {
    expect(sanitizeUserId("_invalido_")).toBe("invalido");
  });

  it("retorna vazio se entrada for inválida", () => {
    expect(sanitizeUserId("")).toBe("");
    expect(sanitizeUserId("   ")).toBe("");
  });
});