import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
    describe,
    it,
    expect,
    beforeEach,
    vi,
} from "vitest";

import {
    AuthProvider,
    useAuth,
} from "./AuthContext";

import api from "../services/api";

vi.mock("../services/api", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

function TestComponent() {
    const {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
    } = useAuth();

    return (
        <div>
            <span data-testid="loading">
                {loading ? "loading" : "loaded"}
            </span>

            <span data-testid="user">
                {user ? user.email : "no user"}
            </span>

            <span data-testid="authenticated">
                {isAuthenticated ? "authenticated" : "not authenticated"}
            </span>

            <button
                type="button"
                onClick={() =>
                    login("test@example.com", "password123")
                }
            >
                Login
            </button>

            <button
                type="button"
                onClick={logout}
            >
                Logout
            </button>
        </div>
    );
}

describe("AuthContext", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it("starts with no user when no token exists", async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId("user")).toHaveTextContent(
            "no user"
        );

        await waitFor(() => {
            expect(
                screen.getByTestId("loading")
            ).toHaveTextContent("loaded");
        });

        expect(
            screen.getByTestId("authenticated")
        ).toHaveTextContent("not authenticated");

        expect(api.get).not.toHaveBeenCalled();
    });

    it("loads the user when a valid token exists", async () => {
        const user = {
            id: 1,
            email: "test@example.com",
        };

        localStorage.setItem("token", "valid-token");

        api.get.mockResolvedValueOnce({
            data: user,
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("user")).toHaveTextContent(
                "test@example.com"
            );
        });

        expect(api.get).toHaveBeenCalledWith("/auth/me");
        expect(
            screen.getByTestId("authenticated")
        ).toHaveTextContent("authenticated");
        expect(
            screen.getByTestId("loading")
        ).toHaveTextContent("loaded");
    });

    it("removes the token when loading the user fails", async () => {
        localStorage.setItem("token", "invalid-token");

        api.get.mockRejectedValueOnce(
            new Error("Unauthorized")
        );

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(
                screen.getByTestId("loading")
            ).toHaveTextContent("loaded");
        });

        expect(localStorage.getItem("token")).toBeNull();
        expect(screen.getByTestId("user")).toHaveTextContent(
            "no user"
        );
        expect(
            screen.getByTestId("authenticated")
        ).toHaveTextContent("not authenticated");
    });

    it("logs in successfully and stores the token", async () => {
        const user = {
            id: 1,
            email: "test@example.com",
        };

        api.post.mockResolvedValueOnce({
            data: {
                token: "new-token",
            },
        });

        api.get.mockResolvedValueOnce({
            data: user,
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(
                screen.getByTestId("loading")
            ).toHaveTextContent("loaded");
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        await waitFor(() => {
            expect(screen.getByTestId("user")).toHaveTextContent(
                "test@example.com"
            );
        });

        expect(api.post).toHaveBeenCalledWith(
            "/auth/login",
            {
                identifier: "test@example.com",
                password: "password123",
            }
        );

        expect(api.get).toHaveBeenCalledWith("/auth/me");
        expect(localStorage.getItem("token")).toBe(
            "new-token"
        );

        expect(
            screen.getByTestId("authenticated")
        ).toHaveTextContent("authenticated");
    });

    it("logs out and removes the token", async () => {
        localStorage.setItem("token", "valid-token");

        const user = {
            id: 1,
            email: "test@example.com",
        };

        api.get.mockResolvedValueOnce({
            data: user,
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("user")).toHaveTextContent(
                "test@example.com"
            );
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Logout",
            })
        );

        expect(localStorage.getItem("token")).toBeNull();
        expect(screen.getByTestId("user")).toHaveTextContent(
            "no user"
        );
        expect(
            screen.getByTestId("authenticated")
        ).toHaveTextContent("not authenticated");
    });

    it("throws an error when useAuth is used outside AuthProvider", () => {
        function ComponentOutsideProvider() {
            useAuth();
            return null;
        }

        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        expect(() =>
            render(<ComponentOutsideProvider />)
        ).toThrow(
            "useAuth must be used inside AuthProvider"
        );

        consoleError.mockRestore();
    });
});