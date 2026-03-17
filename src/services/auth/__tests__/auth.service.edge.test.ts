import { authenticateUser, sanitizeUserId } from "@/services/auth/auth.service";
import { AppError } from "@/utils/app-error";

describe("authenticateUser – edge cases", () => {
  beforeEach(() => {
    process.env.AUTH_DEMO_EMAIL = "aluno@authtask.dev";
    process.env.AUTH_DEMO_PASSWORD = "123456";
    process.env.AUTH_DEMO_USER_ID = "aluno_demo";
  });

  afterEach(() => {
    delete process.env.AUTH_DEMO_EMAIL;
    delete process.env.AUTH_DEMO_PASSWORD;
    delete process.env.AUTH_DEMO_USER_ID;
  });

  it("falha quando variáveis de ambiente estão ausentes", async () => {
    delete process.env.AUTH_DEMO_EMAIL;

    await expect(
      authenticateUser({ email: "teste@test.com", password: "123456" })
    ).rejects.toThrow(AppError); 
  });

  it("validação falha com email vazio após trim", async () => {
    await expect(
      authenticateUser({ email: "   ", password: "123456" })
    ).rejects.toThrow(AppError);

    try {
      await authenticateUser({ email: "   ", password: "123456" });
    } catch (err: any) {
      expect(err.status).toBe(400);
    }
  });

  it("validação falha com senha < 6 caracteres", async () => {
    await expect(
      authenticateUser({ email: "teste@test.com", password: "12345" })
    ).rejects.toThrow(AppError);
  });
});

describe("sanitizeUserId – edge cases extras", () => {
  it.each([
    ["", ""],
    ["   ", ""],
    ["@#$%^&*()!", ""],
    ["__inicio_fim__", "inicio_fim"],
    ["ÇÃÕÜ123", "cao123"],
    ["user.name@email.com", "user_name_email_com"],
  ])("entrada: %s → saída: %s", (input, expected) => {
    expect(sanitizeUserId(input)).toBe(expected);
  });
});