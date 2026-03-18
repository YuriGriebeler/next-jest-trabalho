import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../AuthContext";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

global.fetch = jest.fn();

function TestConsumer() {
    const { user, login, logout, isLoading } = useAuth();
    return (
        <div>
            <span data-testid="user-email">{user?.email ?? "null"}</span>
            <span data-testid="user-name">{user?.name ?? "null"}</span>
            <span data-testid="loading">{isLoading ? "true" : "false"}</span>
            <button onClick={() => login("a@b.com", "123456")}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
}

describe("AuthContext", () => {
    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockReset();
        mockPush.mockClear();
        mockRefresh.mockClear();
    });

    it("fornece valor do contexto para componentes filhos", () => {
        render(
            <AuthProvider initialUser={{ id: "1", name: "Test", email: "test@test.com" }}>
                <TestConsumer />
            </AuthProvider>
        );

        expect(screen.getByTestId("user-email")).toHaveTextContent("test@test.com");
        expect(screen.getByTestId("user-name")).toHaveTextContent("Test");
    });

    it("inicializa user com valor de initialUser", () => {
        render(
            <AuthProvider initialUser={{ id: "123", name: "Inicial", email: "inicial@test.com" }}>
                <TestConsumer />
            </AuthProvider>
        );

        expect(screen.getByTestId("user-email")).toHaveTextContent("inicial@test.com");
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    it("lança erro 'useAuth deve ser usado dentro de AuthProvider' quando usado fora", () => {
        jest.spyOn(console, "error").mockImplementation(() => { });

        expect(() => {
            render(<TestConsumer />);
        }).toThrow(/useAuth deve ser usado dentro de.*AuthProvider/i);

        (console.error as jest.Mock).mockRestore();
    });

    it("atualiza user após login bem-sucedido", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                user: { id: "1", name: "Test", email: "a@b.com" },
                token: "fake-token"
            }),
        });

        render(
            <AuthProvider initialUser={null}>
                <TestConsumer />
            </AuthProvider>
        );

        await userEvent.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByTestId("user-email")).toHaveTextContent("a@b.com");
            expect(screen.getByTestId("user-name")).toHaveTextContent("Test");
        });

        expect(global.fetch).toHaveBeenCalledWith("/api/login", expect.any(Object));
    });

    it("não renderiza conteúdo dependente de auth quando usado fora do Provider", () => {
        jest.spyOn(console, "error").mockImplementation(() => { });

        expect(() => {
            render(<TestConsumer />);
        }).toThrow(/useAuth deve ser usado dentro de.*AuthProvider/i);

        expect(screen.queryByTestId("user-email")).not.toBeInTheDocument();

        (console.error as jest.Mock).mockRestore();
    });

    it("limpa user e chama router.push('/login') ao fazer logout", async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true });

        render(
            <AuthProvider initialUser={{ id: "1", name: "Test", email: "a@b.com" }}>
                <TestConsumer />
            </AuthProvider>
        );

        expect(screen.getByTestId("user-email")).toHaveTextContent("a@b.com");

        await userEvent.click(screen.getByRole("button", { name: /logout/i }));

        await waitFor(() => {
            expect(screen.getByTestId("user-email")).toHaveTextContent("null");
            expect(mockPush).toHaveBeenCalledWith("/login");
        });
    });

    it("não atualiza user quando login retorna erro", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ message: "Credenciais inválidas" }),
        });

        render(
            <AuthProvider initialUser={null}>
                <TestConsumer />
            </AuthProvider>
        );

        await userEvent.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByTestId("user-email")).toHaveTextContent("null");
        });
    });
});