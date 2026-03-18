import { buildTaskService, validateTaskTitle } from "@/services/tasks/task.service";
import { AppError } from "@/utils/app-error";

const mockRepository = {
  listByUser: jest.fn(),
  createForUser: jest.fn(),
  updateCompletion: jest.fn(),
  deleteForUser: jest.fn(),
};

const taskService = buildTaskService({ repository: mockRepository });

describe("TaskService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateTaskTitle", () => {
    it("retorna título limpo quando válido", () => {
      expect(validateTaskTitle("  Comprar leite  ")).toBe("Comprar leite");
    });

    it("lança erro quando título está vazio", () => {
      expect(() => validateTaskTitle("")).toThrow(AppError);
      expect(() => validateTaskTitle("   ")).toThrow(AppError);
    });

    it("lança erro quando título tem menos de 3 caracteres", () => {
      expect(() => validateTaskTitle("ab")).toThrow(AppError);
    });

    it("lança erro quando título excede 120 caracteres", () => {
      const longTitle = "a".repeat(121);
      expect(() => validateTaskTitle(longTitle)).toThrow(AppError);
    });
  });

  describe("getSummary", () => {
    it("retorna resumo zerado quando não há tarefas", async () => {
      mockRepository.listByUser.mockResolvedValue([]);

      const summary = await taskService.getSummary("user-123");

      expect(summary).toEqual({
        total: 0,
        completed: 0,
        pending: 0,
      });
    });

    it("calcula corretamente com tarefas mistas", async () => {
      mockRepository.listByUser.mockResolvedValue([
        { completed: true },
        { completed: false },
        { completed: true },
      ]);

      const summary = await taskService.getSummary("user-123");

      expect(summary).toEqual({
        total: 3,
        completed: 2,
        pending: 1,
      });
    });

    it("lança erro quando userId é inválido", async () => {
      await expect(taskService.getSummary("")).rejects.toThrow(AppError);
    });
  });
});