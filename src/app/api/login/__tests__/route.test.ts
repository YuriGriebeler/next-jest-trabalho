import { validateLoginPayload, hasValidationErrors } from "@/services/auth/auth.service";

describe("POST /api/login — Validação", () => {
    it("retorna erro quando email está vazio", () => {
        const result = validateLoginPayload({ email: "", password: "123456" });
        expect(hasValidationErrors(result)).toBe(true);
        expect(result.email).toBeDefined();
    });

    it("retorna erro quando password está vazia", () => {
        const result = validateLoginPayload({ email: "a@b.com", password: "" });
        expect(hasValidationErrors(result)).toBe(true);
        expect(result.password).toBeDefined();
    });

    it("retorna objeto vazio quando dados são válidos", () => {
        const result = validateLoginPayload({
            email: "aluno@authtask.dev",
            password: "123456"
        });
        expect(hasValidationErrors(result)).toBe(false);
        expect(result).toEqual({});
    });
});