import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../LoginForm";

jest.mock("next/navigation", () => ({
    ...jest.requireActual("next/navigation"),
    useSearchParams: () => new URLSearchParams(),
}));

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

describe("LoginForm", () => {
    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renderiza campos de e-mail e senha com labels acessíveis", () => {
        render(<LoginForm />);

        expect(screen.getByRole("textbox", { name: /e-mail/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
    });

    it("chama login ao submeter o formulário", async () => {
        mockLogin.mockResolvedValue({ ok: true });
        render(<LoginForm />);
        await user.click(screen.getByRole("button", { name: /entrar/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith("aluno@authtask.dev", "123456");
        });
    });

    it("exibe mensagem de erro quando login retorna ok: false", async () => {
        mockLogin.mockResolvedValue({
            ok: false,
            errors: { email: "Credenciais inválidas" }
        });

        render(<LoginForm />);
        await user.click(screen.getByRole("button", { name: /entrar/i }));
        const errorMessage = await screen.findByText(/credenciais inválidas/i);
        expect(errorMessage).toBeInTheDocument();
    });

    it("não exibe erro antes do submit", () => {
        render(<LoginForm />);

        const error = screen.queryByText(/credenciais inválidas/i);
        expect(error).not.toBeInTheDocument();
    });

    it("não chama login quando validação falha (ex: e-mail vazio)", async () => {
        mockLogin.mockResolvedValue({
            ok: false,
            errors: { email: "E-mail é obrigatório." }
        });

        render(<LoginForm />);

        const emailInput = screen.getByRole("textbox", { name: /e-mail/i });
        await user.clear(emailInput);
        await user.click(screen.getByRole("button", { name: /entrar/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled();
        });

        expect(await screen.findByText(/e-mail é obrigatório/i)).toBeInTheDocument();
    });
});