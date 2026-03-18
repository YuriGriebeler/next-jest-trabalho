import { sanitizeUserId, authenticateUser, validateLoginPayload } from "../auth.service";
import { AppError } from "@/utils/app-error";

describe("authenticateUser – edge cases", () => {
  it("falha quando variáveis de ambiente estão ausentes", async () => {
    await expect(
      authenticateUser({ email: "teste@test.com", password: "123456" })
    ).rejects.toThrow(AppError);
  });

  it("validação falha com email vazio após trim", async () => {
    await expect(
      authenticateUser({ email: "   ", password: "123456" })
    ).rejects.toThrow(AppError);
  });

  it("validação falha com senha < 6 caracteres", async () => {
    await expect(
      authenticateUser({ email: "teste@test.com", password: "12345" })
    ).rejects.toThrow(AppError);
  });
});

describe("sanitizeUserId – edge cases extras", () => {
  it.each([
    ["ÇÃÕÜ123", "caou123"],
    ["user.name@email.com", "user_name_email_com"],
  ])("entrada: %s → saída: %s", (input, expected) => {
    expect(sanitizeUserId(input)).toBe(expected);
  });
});