import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
    describe,
    it,
    expect,
    beforeEach,
    vi,
} from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";

const mockLogin = vi.fn();
const mockShowToast = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../context/AuthContext", () => ({
    useAuth: () => ({
        login: mockLogin,
    }),
}));

vi.mock("../context/ToastContext", () => ({
    useToast: () => ({
        showToast: mockShowToast,
    }),
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

function renderLogin() {
    return render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    );
}

describe("Login", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the login form", () => {
        renderLogin();

        expect(
            screen.getByRole("heading", {
                name: "Contact Management",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Email Address")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Password")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Login",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("link", {
                name: "Register",
            })
        ).toHaveAttribute("href", "/register");
    });

    it("shows an error when email is empty", async () => {
        renderLogin();

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "password123",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            await screen.findByText("Email is required.")
        ).toBeInTheDocument();

        expect(mockLogin).not.toHaveBeenCalled();
    });

    it("shows an error when password is empty", async () => {
        renderLogin();

        fireEvent.change(
            screen.getByLabelText("Email Address"),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            await screen.findByText("Password is required.")
        ).toBeInTheDocument();

        expect(mockLogin).not.toHaveBeenCalled();
    });

    it("logs in successfully and navigates to contacts", async () => {
        mockLogin.mockResolvedValueOnce({
            id: 1,
            email: "test@example.com",
        });

        renderLogin();

        fireEvent.change(
            screen.getByLabelText("Email Address"),
            {
                target: {
                    value: "  test@example.com  ",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "password123",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith(
                "test@example.com",
                "password123"
            );
        });

        expect(mockShowToast).toHaveBeenCalledWith(
            "Login successful!",
            "success"
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/contacts"
        );
    });

    it("shows invalid credentials error for a 401 response", async () => {
        mockLogin.mockRejectedValueOnce({
            response: {
                status: 401,
            },
        });

        renderLogin();

        fireEvent.change(
            screen.getByLabelText("Email Address"),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "wrong-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            await screen.findByText(
                "Invalid email or password."
            )
        ).toBeInTheDocument();
    });

    it("shows error message from a 400 response when error exists", async () => {
        mockLogin.mockRejectedValueOnce({
            response: {
                status: 400,
                data: {
                    error: "Account is disabled.",
                },
            },
        });

        renderLogin();

        fireEvent.change(
            screen.getByLabelText("Email Address"),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "password123",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            await screen.findByText("Account is disabled.")
        ).toBeInTheDocument();
    });

    it("shows message from a 400 response when error is not available", async () => {
        mockLogin.mockRejectedValueOnce({
            response: {
                status: 400,
                data: {
                    message: "Invalid request.",
                },
            },
        });

        renderLogin();

        fireEvent.change(
            screen.getByLabelText("Email Address"),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "password123",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            await screen.findByText("Invalid request.")
        ).toBeInTheDocument();
    });

    it("shows the default 400 error when no error or message exists", async () => {
        mockLogin.mockRejectedValueOnce({
            response: {
                status: 400,
                data: {},
            },
        });

        renderLogin();

        fireEvent.change(
            screen.getByLabelText("Email Address"),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "password123",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            await screen.findByText(
                "Please check your login details."
            )
        ).toBeInTheDocument();
    });

    it("shows the generic error for an unexpected failure", async () => {
        mockLogin.mockRejectedValueOnce(
            new Error("Network error")
        );

        renderLogin();

        fireEvent.change(
            screen.getByLabelText("Email Address"),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "password123",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            await screen.findByText(
                "Unable to login. Please try again."
            )
        ).toBeInTheDocument();
    });

    it("disables the form while login is loading", async () => {
        let resolveLogin;

        mockLogin.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveLogin = resolve;
                })
        );

        renderLogin();

        fireEvent.change(
            screen.getByLabelText("Email Address"),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "password123",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            await screen.findByRole("button", {
                name: "Signing In...",
            })
        ).toBeDisabled();

        expect(
            screen.getByLabelText("Email Address")
        ).toBeDisabled();

        expect(
            screen.getByLabelText("Password")
        ).toBeDisabled();

        resolveLogin({
            id: 1,
            email: "test@example.com",
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(
                "/contacts"
            );
        });
    });
});