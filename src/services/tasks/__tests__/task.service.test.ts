import { validateTaskTitle, buildTaskService } from "@/services/tasks/task.service";
import { AppError } from "@/utils/app-error";

const mockRepository = {
  listByUser: jest.fn(),
  createForUser: jest.fn(),
  updateCompletion: jest.fn(),
  deleteForUser: jest.fn(),
};

describe("validateTaskTitle", () => {
  it("lança AppError 400 quando título está vazio", () => {
    expect(() => validateTaskTitle("")).toThrow(AppError);
    expect(() => validateTaskTitle(" ")).toThrow(AppError);
  });

  it("lança AppError 400 quando título tem menos de 3 caracteres", () => {
    expect(() => validateTaskTitle("ab")).toThrow(AppError);
  });

  it("lança AppError 400 quando título tem mais de 120 caracteres", () => {
    const longTitle = "a".repeat(121);
    expect(() => validateTaskTitle(longTitle)).toThrow(AppError);
  });

  it("retorna título trimado quando válido", () => {
    const result = validateTaskTitle("  Fazer exercícios  ");
    expect(result).toBe("Fazer exercícios");
  });
});

describe("buildTaskService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lança AppError 400 quando userId está vazio", async () => {
    const service = buildTaskService({ repository: mockRepository });
    await expect(service.listTasks("")).rejects.toThrow(AppError);
  });

  it("chama repository.listByUser com userId válido", async () => {
    const service = buildTaskService({ repository: mockRepository });
    mockRepository.listByUser.mockResolvedValue([]);

    await service.listTasks("user123");

    expect(mockRepository.listByUser).toHaveBeenCalledWith("user123");
  });

  it("chama repository.createForUser com dados válidos", async () => {
    const service = buildTaskService({ repository: mockRepository });
    const newTask = { id: "t1", title: "Nova tarefa", completed: false };
    mockRepository.createForUser.mockResolvedValue(newTask);

    const result = await service.createTask({
      userId: "user123",
      title: "Nova tarefa",
    });

    expect(mockRepository.createForUser).toHaveBeenCalledWith("user123", {
      title: "Nova tarefa",
      completed: false,
    });
    expect(result).toEqual(newTask);
  });

  it("chama repository.deleteForUser com userId e taskId", async () => {
    const service = buildTaskService({ repository: mockRepository });
    mockRepository.deleteForUser.mockResolvedValue(undefined);

    await service.deleteTask({
      userId: "user123", 
      taskId: "task456"
    });

    expect(mockRepository.deleteForUser).toHaveBeenCalledWith("user123", "task456");
  });
});