import { toErrorResponse } from "@/utils/http-response";
import { AppError } from "@/utils/app-error";

describe("toErrorResponse", () => {
  it("converte AppError 401 corretamente", async () => {
    const err = new AppError("UNAUTHORIZED", "Credenciais inválidas", 401);

    const res = toErrorResponse(err);

    expect(res.status).toBe(401);
    
    const json = await res.json();
    expect(json).toEqual({
      error: "Credenciais inválidas",
      code: "UNAUTHORIZED",
      status: 401,
    });
  });

  it("converte AppError com detalhes", async () => {
    const err = new AppError(
      "VALIDATION_ERROR",
      "Dados inválidos",
      400,
      { email: "Formato inválido" }
    );

    const res = toErrorResponse(err);

    expect(res.status).toBe(400);
    
    const json = await res.json();
    expect(json).toMatchObject({
      error: "Dados inválidos",
      code: "VALIDATION_ERROR",
      details: { email: "Formato inválido" },
    });
  });

  it("converte erro genérico para 500 + UNEXPECTED_ERROR", async () => {
    const err = new Error("Falha no banco de dados");

    const res = toErrorResponse(err);

    expect(res.status).toBe(500);
    
    const json = await res.json();
    expect(json).toMatchObject({
      error: expect.stringContaining("UNEXPECTED_ERROR"),
      message: expect.any(String),
    });
  });

  it("lida com string como erro", async () => {
    const res = toErrorResponse("Erro aleatório");

    expect(res.status).toBe(500);
    
    const json = await res.json();
    expect(json).toMatchObject({
      error: expect.stringContaining("UNEXPECTED_ERROR"),
    });
  });
});