import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskList } from "../TaskList";

const mockLogin = jest.fn();
const mockLogout = jest.fn();
const mockSetUser = jest.fn();

jest.mock("@/context/AuthContext", () => ({
    useAuth: () => ({
        user: { id: "1", name: "Test User", email: "test@test.com" },
        login: mockLogin,
        logout: mockLogout,
        isLoading: false,
        setUser: mockSetUser,
    }),
}));

const mockTasks = [
    { id: "1", title: "Tarefa 1", completed: false, createdAt: 123456, updatedAt: 1773797393},
    { id: "2", title: "Tarefa 2", completed: true, createdAt: 123456, updatedAt: 1773782993},
];

describe("TaskList", () => {
    const user = userEvent.setup();
    const mockOnToggle = jest.fn();
    const mockOnDelete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnToggle.mockClear();
        mockOnDelete.mockClear();
    });

    it("exibe mensagem ou estado vazio quando não há tarefas", () => {
        render(
            <TaskList
                tasks={[]}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        const emptyMsg = screen.queryByText(/nenhuma tarefa|lista vazia|comece adicionando/i);
        expect(emptyMsg).toBeInTheDocument();
    });

    it("renderiza cada tarefa com checkbox e botão de deletar acessíveis", () => {
        render(
            <TaskList
                tasks={mockTasks}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByRole("checkbox", { name: /tarefa 1/i })).toBeInTheDocument();
        expect(screen.getByRole("checkbox", { name: /tarefa 2/i })).toBeInTheDocument();

        const deleteBtns = screen.getAllByRole("button", { name: /deletar|excluir|remover/i });
        expect(deleteBtns).toHaveLength(2);
    });

    it("marca checkbox como checked quando tarefa está completed: true", () => {
        render(
            <TaskList
                tasks={mockTasks}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        const checkbox1 = screen.getByRole("checkbox", { name: /tarefa 1/i });
        const checkbox2 = screen.getByRole("checkbox", { name: /tarefa 2/i });

        expect(checkbox1).not.toBeChecked();
        expect(checkbox2).toBeChecked();
    });

    it("chama onToggle com taskId e novo estado ao alternar checkbox", async () => {
        render(
            <TaskList
                tasks={mockTasks}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        const checkbox = screen.getByRole("checkbox", { name: /tarefa 1/i });
        await user.click(checkbox);

        await waitFor(() => {
            expect(mockOnToggle).toHaveBeenCalledWith("1", true);
        });
    });

    it("chama onDelete com taskId ao clicar no botão de deletar", async () => {
        render(
            <TaskList
                tasks={mockTasks}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        const deleteBtns = screen.getAllByRole("button", { name: /deletar|excluir|remover/i });
        await user.click(deleteBtns[0]);

        await waitFor(() => {
            expect(mockOnDelete).toHaveBeenCalledWith("1");
        });
    });

    it("permite verificar remoção via queryBy após onDelete", async () => {
        mockOnDelete.mockImplementation(() => {
        });

        render(
            <TaskList
                tasks={mockTasks}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.queryByText(/tarefa 1/i)).toBeInTheDocument();

        const deleteBtns = screen.getAllByRole("button", { name: /deletar|excluir|remover/i });
        await user.click(deleteBtns[0]);

        expect(mockOnDelete).toHaveBeenCalledWith("1");
    });
});