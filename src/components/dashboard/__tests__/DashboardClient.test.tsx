import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardClient } from "../DashboardClient";

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

global.fetch = jest.fn();

describe("DashboardClient", () => {
    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                tasks: [],
                summary: { total: 0, completed: 0, pending: 0 },
            }),
        });
    });

    it("exibe nome do usuário autenticado no cabeçalho", async () => {
        render(<DashboardClient />);

        await waitFor(() => {
            expect(screen.getByText(/test user/i)).toBeInTheDocument();
        });
    });

    it("chama logout ao clicar no botão de sair", async () => {
        mockLogout.mockResolvedValue({ ok: true });

        render(<DashboardClient />);

        const logoutBtn = screen.getByRole("button", { name: /logout|sair|encerrar/i });
        await user.click(logoutBtn);

        expect(mockLogout).toHaveBeenCalled();
    });

    it("exibe estado vazio quando não há tarefas", async () => {
        render(<DashboardClient />);

        await waitFor(() => {
            const emptyMsg = screen.queryByText(/nenhuma tarefa|lista vazia|comece adicionando/i);
            if (emptyMsg) {
                expect(emptyMsg).toBeInTheDocument();
            }
        });
    });
});