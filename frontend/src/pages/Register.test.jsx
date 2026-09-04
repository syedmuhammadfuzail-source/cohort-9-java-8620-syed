import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "./Register";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

vi.mock("../services/api", () => ({
    default: {
        post: vi.fn(),
    },
}));

vi.mock("../context/ToastContext", () => ({
    useToast: vi.fn(),
}));

const mockNavigate = vi.fn();
const mockShowToast = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe("Register", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        useToast.mockReturnValue({
            showToast: mockShowToast,
        });
    });

    const renderRegister = () => {
        return render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
    };

    const fillValidForm = () => {
        fireEvent.change(
            screen.getByLabelText("First Name"),
            {
                target: {
                    value: "John",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Last Name"),
            {
                target: {
                    value: "Doe",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Email Address *"),
            {
                target: {
                    value: "john@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Phone Number"),
            {
                target: {
                    value: "03001234567",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password *"),
            {
                target: {
                    value: "password123",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Confirm Password *"),
            {
                target: {
                    value: "password123",
                },
            }
        );
    };

    it("renders the registration form", () => {
        renderRegister();

        expect(
            screen.getByRole("heading", {
                name: "Create Account",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("First Name")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Last Name")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Email Address *")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Phone Number")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Password *")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Confirm Password *")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Create Account",
            })
        ).toBeInTheDocument();
    });

    it("updates form fields when the user types", () => {
        renderRegister();

        const firstName = screen.getByLabelText("First Name");
        const lastName = screen.getByLabelText("Last Name");
        const email = screen.getByLabelText("Email Address *");
        const phone = screen.getByLabelText("Phone Number");

        fireEvent.change(firstName, {
            target: {
                value: "Jane",
            },
        });

        fireEvent.change(lastName, {
            target: {
                value: "Smith",
            },
        });

        fireEvent.change(email, {
            target: {
                value: "jane@example.com",
            },
        });

        fireEvent.change(phone, {
            target: {
                value: "03111234567",
            },
        });

        expect(firstName).toHaveValue("Jane");
        expect(lastName).toHaveValue("Smith");
        expect(email).toHaveValue("jane@example.com");
        expect(phone).toHaveValue("03111234567");
    });

    it("shows an error when email is empty", async () => {
        renderRegister();

        fireEvent.submit(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            await screen.findByText("Email is required.")
        ).toBeInTheDocument();

        expect(api.post).not.toHaveBeenCalled();
    });

    it("shows an error when password is empty", async () => {
        renderRegister();

        fireEvent.change(
            screen.getByLabelText("Email Address *"),
            {
                target: {
                    value: "john@example.com",
                },
            }
        );

        fireEvent.submit(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            await screen.findByText("Password is required.")
        ).toBeInTheDocument();

        expect(api.post).not.toHaveBeenCalled();
    });

    it("shows an error when password is shorter than 8 characters", async () => {
        renderRegister();

        fireEvent.change(
            screen.getByLabelText("Email Address *"),
            {
                target: {
                    value: "john@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password *"),
            {
                target: {
                    value: "1234567",
                },
            }
        );

        fireEvent.submit(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            await screen.findByText(
                "Password must be at least 8 characters."
            )
        ).toBeInTheDocument();

        expect(api.post).not.toHaveBeenCalled();
    });

    it("shows an error when passwords do not match", async () => {
        renderRegister();

        fireEvent.change(
            screen.getByLabelText("Email Address *"),
            {
                target: {
                    value: "john@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password *"),
            {
                target: {
                    value: "password123",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Confirm Password *"),
            {
                target: {
                    value: "different123",
                },
            }
        );

        fireEvent.submit(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            await screen.findByText("Passwords do not match.")
        ).toBeInTheDocument();

        expect(api.post).not.toHaveBeenCalled();
    });

    it("successfully registers a user", async () => {
        api.post.mockResolvedValue({
            data: {
                message: "Account created",
            },
        });

        renderRegister();

        fillValidForm();

        fireEvent.submit(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                "/auth/register",
                {
                    email: "john@example.com",
                    phone: "03001234567",
                    password: "password123",
                    firstName: "John",
                    lastName: "Doe",
                }
            );
        });

        expect(mockShowToast).toHaveBeenCalledWith(
            "Account created successfully. Please login.",
            "success"
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/login"
        );
    });

    it("trims registration fields before sending the request", async () => {
        api.post.mockResolvedValue({
            data: {},
        });

        renderRegister();

        fireEvent.change(
            screen.getByLabelText("First Name"),
            {
                target: {
                    value: "  John  ",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Last Name"),
            {
                target: {
                    value: "  Doe  ",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Email Address *"),
            {
                target: {
                    value: "  john@example.com  ",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Phone Number"),
            {
                target: {
                    value: " 03001234567 ",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password *"),
            {
                target: {
                    value: "password123",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Confirm Password *"),
            {
                target: {
                    value: "password123",
                },
            }
        );

        fireEvent.submit(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                "/auth/register",
                {
                    email: "john@example.com",
                    phone: "03001234567",
                    password: "password123",
                    firstName: "John",
                    lastName: "Doe",
                }
            );
        });
    });

    it("shows an error for a 409 conflict response", async () => {
        api.post.mockRejectedValue({
            response: {
                status: 409,
            },
        });

        renderRegister();

        fillValidForm();

        fireEvent.submit(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            await screen.findByText(
                "An account with this email already exists."
            )
        ).toBeInTheDocument();
    });

    it("shows the server error for a 400 response containing error", async () => {
        api.post.mockRejectedValue({
            response: {
                status: 400,
                data: {
                    error: "Email format is invalid.",
                },
            },
        });

        renderRegister();

        fillValidForm();

        fireEvent.submit(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            await screen.findByText(
                "Email format is invalid."
            )
        ).toBeInTheDocument();
    });

    it("shows the server message for a 400 response containing message", async () => {
        api.post.mockRejectedValue({
            response: {
                status: 400,
                data: {
                    message: "Invalid registration data.",
                },
            },
        });

        renderRegister();

        fillValidForm();

        fireEvent.submit(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            await screen.findByText(
                "Invalid registration data."
            )
        ).toBeInTheDocument();
    });

    it("shows the default 400 error when the response has no error or message", async () => {
        api.post.mockRejectedValue({
            response: {
                status: 400,
                data: {},
            },
        });

        renderRegister();

        fillValidForm();

        fireEvent.submit(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            await screen.findByText(
                "Please check your registration details."
            )
        ).toBeInTheDocument();
    });

    it("shows the generic error for unexpected registration failures", async () => {
        api.post.mockRejectedValue(
            new Error("Network error")
        );

        renderRegister();

        fillValidForm();

        fireEvent.submit(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            await screen.findByText(
                "Unable to create your account. Please try again."
            )
        ).toBeInTheDocument();
    });

    it("disables the form while registration is loading", async () => {
        let resolveRequest;

        api.post.mockReturnValue(
            new Promise((resolve) => {
                resolveRequest = resolve;
            })
        );

        renderRegister();

        fillValidForm();

        fireEvent.submit(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            await screen.findByRole("button", {
                name: "Creating Account...",
            })
        ).toBeDisabled();

        expect(
            screen.getByLabelText("First Name")
        ).toBeDisabled();

        expect(
            screen.getByLabelText("Last Name")
        ).toBeDisabled();

        expect(
            screen.getByLabelText("Email Address *")
        ).toBeDisabled();

        expect(
            screen.getByLabelText("Phone Number")
        ).toBeDisabled();

        expect(
            screen.getByLabelText("Password *")
        ).toBeDisabled();

        expect(
            screen.getByLabelText("Confirm Password *")
        ).toBeDisabled();

        resolveRequest({
            data: {},
        });

        await waitFor(() => {
            expect(
                screen.getByRole("button", {
                    name: "Create Account",
                })
            ).not.toBeDisabled();
        });
    });
});