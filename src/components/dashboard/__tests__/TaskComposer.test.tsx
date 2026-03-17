import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskComposer } from "../TaskComposer";

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

describe("TaskComposer", () => {
    const user = userEvent.setup();
    const mockOnCreate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnCreate.mockClear();
    });

    it("renderiza campo de texto e botão de adicionar", () => {
        render(<TaskComposer onCreate={mockOnCreate} />);

        expect(
            screen.getByRole("textbox", { name: /nova tarefa|título|descrição|adicionar tarefa/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /adicionar|criar|salvar|enviar/i })
        ).toBeInTheDocument();
    });

    it("chama onCreate com título trimado ao submeter", async () => {
        render(<TaskComposer onCreate={mockOnCreate} />);

        const input = screen.getByRole("textbox", {
            name: /nova tarefa|título|descrição|adicionar tarefa/i
        });

        await user.clear(input);
        await user.type(input, "  Tarefa importante  ");
        await user.click(
            screen.getByRole("button", { name: /adicionar|criar|salvar|enviar/i })
        );

        await waitFor(() => {
            expect(mockOnCreate).toHaveBeenCalledWith("Tarefa importante");
        });
    });

    it("exibe erro quando título tem menos de 3 caracteres", async () => {
        render(<TaskComposer onCreate={mockOnCreate} />);

        const input = screen.getByRole("textbox", {
            name: /nova tarefa|título|descrição|adicionar tarefa/i
        });

        await user.clear(input);
        await user.type(input, "ab");
        await user.click(
            screen.getByRole("button", { name: /adicionar|criar|salvar|enviar/i })
        );

        const error = await screen.findByText(/3 caracteres|mínimo|curto|inválido/i);
        expect(error).toBeInTheDocument();
        expect(mockOnCreate).not.toHaveBeenCalled();
    });

    it("limpa input após adicionar tarefa com sucesso", async () => {
        mockOnCreate.mockResolvedValue({ ok: true });

        render(<TaskComposer onCreate={mockOnCreate} />);

        const input = screen.getByRole("textbox", {
            name: /nova tarefa|título|descrição|adicionar tarefa/i
        });

        await user.clear(input);
        await user.type(input, "Tarefa concluída");
        await user.click(
            screen.getByRole("button", { name: /adicionar|criar|salvar|enviar/i })
        );

        await waitFor(() => {
            const currentInput = screen.queryByRole("textbox", {
                name: /nova tarefa|título|descrição|adicionar tarefa/i
            }) as HTMLInputElement;

            expect(currentInput?.value).toBe("");
        });
    });
});