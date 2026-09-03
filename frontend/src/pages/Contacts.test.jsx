
import { describe, expect, it, beforeEach, vi } from "vitest";
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Contacts from "./Contacts";

vi.mock("../services/api", () => ({
    default: {
        get: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock("../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../context/ToastContext", () => ({
    useToast: vi.fn(),
}));

const mockNavigate = vi.fn();
const mockLogout = vi.fn();
const mockShowToast = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const mockContacts = [
    {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        title: "Developer",
        emails: [{ id: 1, email: "john@example.com" }],
        phones: [{ id: 1, phone: "123456789" }],
    },
    {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        title: "Manager",
        emails: [{ id: 2, email: "jane@example.com" }],
        phones: [{ id: 2, phone: "987654321" }],
    },
];

function renderContacts() {
    return render(
        <MemoryRouter>
            <Contacts />
        </MemoryRouter>
    );
}

beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
        user: {
            firstName: "Test",
            email: "test@example.com",
        },
        logout: mockLogout,
    });

    useToast.mockReturnValue({
        showToast: mockShowToast,
    });

    api.get.mockResolvedValue({
        data: {
            content: mockContacts,
            totalPages: 2,
            totalElements: 12,
        },
    });

    api.delete.mockResolvedValue({});
});

describe("Contacts", () => {
    it("renders and loads contacts", async () => {
        renderContacts();

        expect(
            screen.getByText("Loading contacts...")
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText("Jane Smith")
        ).toBeInTheDocument();

        expect(api.get).toHaveBeenCalledWith(
            "/contacts",
            {
                params: {
                    page: 0,
                    size: 10,
                },
            }
        );
    });

    it("uses email when user firstName is missing", async () => {
        useAuth.mockReturnValue({
            user: {
                email: "fallback@example.com",
            },
            logout: mockLogout,
        });

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("fallback@example.com")
            ).toBeInTheDocument();
        });
    });

    it("uses User when user is null", async () => {
        useAuth.mockReturnValue({
            user: null,
            logout: mockLogout,
        });

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("User")
            ).toBeInTheDocument();
        });
    });

    it("shows singular contact count", async () => {
        api.get.mockResolvedValue({
            data: {
                content: [mockContacts[0]],
                totalPages: 1,
                totalElements: 1,
            },
        });

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText("1 contact")
        ).toBeInTheDocument();
    });

    it("shows empty state when there are no contacts", async () => {
        api.get.mockResolvedValue({
            data: {
                content: [],
                totalPages: 0,
                totalElements: 0,
            },
        });

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("No contacts yet")
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText(
                "You haven't added any contacts yet."
            )
        ).toBeInTheDocument();
    });

    it("navigates to add contact from empty state", async () => {
        api.get.mockResolvedValue({
            data: {
                content: [],
                totalPages: 0,
                totalElements: 0,
            },
        });

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("No contacts yet")
            ).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /add your first contact/i,
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/contacts/new"
        );
    });

    it("navigates to add contact from header", async () => {
        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /add contact/i,
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/contacts/new"
        );
    });

    it("navigates to profile", async () => {
        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /profile/i,
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/profile"
        );
    });

    it("logs out and navigates to login", async () => {
        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /logout/i,
            })
        );

        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(
            "/login"
        );
    });

    it("shows dash when contact has no email", async () => {
        api.get.mockResolvedValue({
            data: {
                content: [
                    {
                        ...mockContacts[0],
                        emails: [],
                    },
                ],
                totalPages: 1,
                totalElements: 1,
            },
        });

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText("-")
        ).toBeInTheDocument();
    });

    it("shows dash when contact has no phone", async () => {
        api.get.mockResolvedValue({
            data: {
                content: [
                    {
                        ...mockContacts[0],
                        phones: [],
                    },
                ],
                totalPages: 1,
                totalElements: 1,
            },
        });

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText("john@example.com")
        ).toBeInTheDocument();
    });

    it("shows first name only when last name is missing", async () => {
        api.get.mockResolvedValue({
            data: {
                content: [
                    {
                        ...mockContacts[0],
                        lastName: "",
                    },
                ],
                totalPages: 1,
                totalElements: 1,
            },
        });

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John")
            ).toBeInTheDocument();
        });
    });

    it("shows dash when contact title is missing", async () => {
        api.get.mockResolvedValue({
            data: {
                content: [
                    {
                        ...mockContacts[0],
                        title: "",
                    },
                ],
                totalPages: 1,
                totalElements: 1,
            },
        });

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText("-")
        ).toBeInTheDocument();
    });

    it("navigates to view contact", async () => {
        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        const viewButtons = screen.getAllByRole(
            "button",
            { name: /view/i }
        );

        fireEvent.click(viewButtons[0]);

        expect(mockNavigate).toHaveBeenCalledWith(
            "/contacts/1"
        );
    });

    it("navigates to edit contact", async () => {
        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        const editButtons = screen.getAllByRole(
            "button",
            { name: /edit/i }
        );

        fireEvent.click(editButtons[0]);

        expect(mockNavigate).toHaveBeenCalledWith(
            "/contacts/1/edit"
        );
    });

    it("opens delete modal", async () => {
        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByRole(
            "button",
            { name: /^delete$/i }
        );

        fireEvent.click(deleteButtons[0]);

        expect(
            screen.getByText("Delete Contact?")
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /Are you sure you want to delete/i
            )
        ).toBeInTheDocument();
    });

    it("closes delete modal with cancel", async () => {
        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByRole(
            "button",
            { name: /^delete$/i }
        );

        fireEvent.click(deleteButtons[0]);

        fireEvent.click(
            screen.getByRole("button", {
                name: /cancel/i,
            })
        );

        expect(
            screen.queryByText("Delete Contact?")
        ).not.toBeInTheDocument();
    });

    it("successfully deletes a contact and refreshes", async () => {
        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByRole(
            "button",
            { name: /^delete$/i }
        );

        fireEvent.click(deleteButtons[0]);

        fireEvent.click(
            screen.getByRole("button", {
                name: /delete contact/i,
            })
        );

        await waitFor(() => {
            expect(api.delete).toHaveBeenCalledWith(
                "/contacts/1"
            );
        });

        expect(mockShowToast).toHaveBeenCalledWith(
            "Contact deleted successfully.",
            "success"
        );
    });

    it("shows deleting state while delete request is pending", async () => {
        let resolveDelete;

        api.delete.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveDelete = resolve;
                })
        );

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByRole(
            "button",
            { name: /^delete$/i }
        );

        fireEvent.click(deleteButtons[0]);

        fireEvent.click(
            screen.getByRole("button", {
                name: /delete contact/i,
            })
        );

        await waitFor(() => {
            expect(
                screen.getByRole("button", {
                    name: /deleting/i,
                })
            ).toBeInTheDocument();
        });

        resolveDelete({});

        await waitFor(() => {
            expect(
                screen.queryByRole("button", {
                    name: /deleting/i,
                })
            ).not.toBeInTheDocument();
        });
    });

    it("moves to previous page when deleting last contact on later page", async () => {
        api.get.mockResolvedValue({
            data: {
                content: [mockContacts[0]],
                totalPages: 2,
                totalElements: 11,
            },
        });

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /next/i,
            })
        );

        await waitFor(() => {
            expect(
                api.get.mock.calls.some(
                    ([url, config]) =>
                        url === "/contacts" &&
                        config.params.page === 1
                )
            ).toBe(true);
        });

        const deleteButtons = screen.getAllByRole(
            "button",
            { name: /^delete$/i }
        );

        fireEvent.click(deleteButtons[0]);

        fireEvent.click(
            screen.getByRole("button", {
                name: /delete contact/i,
            })
        );

        await waitFor(() => {
            expect(
                api.get.mock.calls.some(
                    ([url, config]) =>
                        url === "/contacts" &&
                        config.params.page === 0
                )
            ).toBe(true);
        });
    });

    it("logs out on 401 while loading contacts", async () => {
        api.get.mockRejectedValue({
            response: {
                status: 401,
            },
        });

        renderContacts();

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
        });

        expect(mockNavigate).toHaveBeenCalledWith(
            "/login"
        );
    });

    it("logs out on 403 while loading contacts", async () => {
        api.get.mockRejectedValue({
            response: {
                status: 403,
            },
        });

        renderContacts();

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
        });

        expect(mockNavigate).toHaveBeenCalledWith(
            "/login"
        );
    });

    it("shows generic error when loading contacts fails", async () => {
        api.get.mockRejectedValue(
            new Error("Network error")
        );

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Unable to load contacts. Please try again."
                )
            ).toBeInTheDocument();
        });
    });

    it("searches contacts using the entered search text", async () => {
        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        const searchInput =
            screen.getByPlaceholderText(
                "Search by name or title..."
            );

        fireEvent.change(searchInput, {
            target: {
                value: "  John  ",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /^search$/i,
            })
        );

        await waitFor(() => {
            expect(api.get).toHaveBeenLastCalledWith(
                "/contacts",
                {
                    params: {
                        page: 0,
                        size: 10,
                        search: "John",
                    },
                }
            );
        });

        expect(
            screen.getByText((_, element) =>
                element?.classList?.contains(
                    "search-result-message"
                ) &&
                element.textContent.includes(
                    "Showing results for:"
                ) &&
                element.textContent.includes("John")
            )
        ).toBeInTheDocument();
    });

    it("clears an active search", async () => {
        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        const searchInput =
            screen.getByPlaceholderText(
                "Search by name or title..."
            );

        fireEvent.change(searchInput, {
            target: {
                value: "John",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /^search$/i,
            })
        );

        await waitFor(() => {
            expect(
                screen.getByText((_, element) =>
                    element?.classList?.contains(
                        "search-result-message"
                    ) &&
                    element.textContent.includes(
                        "Showing results for:"
                    ) &&
                    element.textContent.includes("John")
                )
            ).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /^clear$/i,
            })
        );

        await waitFor(() => {
            expect(searchInput).toHaveValue("");
        });

        expect(api.get).toHaveBeenLastCalledWith(
            "/contacts",
            {
                params: {
                    page: 0,
                    size: 10,
                },
            }
        );
    });

    it("shows no results message for an active search", async () => {
        api.get.mockResolvedValueOnce({
            data: {
                content: mockContacts,
                totalPages: 1,
                totalElements: 2,
            },
        });

        api.get.mockImplementationOnce(() =>
            Promise.resolve({
                data: {
                    content: [],
                    totalPages: 0,
                    totalElements: 0,
                },
            })
        );

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        const searchInput =
            screen.getByPlaceholderText(
                "Search by name or title..."
            );

        fireEvent.change(searchInput, {
            target: {
                value: "Nobody",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /^search$/i,
            })
        );

        await waitFor(() => {
            expect(
                screen.getByText("No contacts found")
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText(
                'No contacts matched "Nobody".'
            )
        ).toBeInTheDocument();
    });

    it("clears no-results search", async () => {
        api.get.mockResolvedValueOnce({
            data: {
                content: mockContacts,
                totalPages: 1,
                totalElements: 2,
            },
        });

        api.get.mockImplementationOnce(() =>
            Promise.resolve({
                data: {
                    content: [],
                    totalPages: 0,
                    totalElements: 0,
                },
            })
        );

        api.get.mockImplementationOnce(() =>
            Promise.resolve({
                data: {
                    content: mockContacts,
                    totalPages: 1,
                    totalElements: 2,
                },
            })
        );

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        const searchInput =
            screen.getByPlaceholderText(
                "Search by name or title..."
            );

        fireEvent.change(searchInput, {
            target: {
                value: "Nobody",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /^search$/i,
            })
        );

        await waitFor(() => {
            expect(
                screen.getByText("No contacts found")
            ).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /clear search/i,
            })
        );

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        expect(searchInput).toHaveValue("");
    });

    it("goes to previous page", async () => {
        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /next/i,
            })
        );

        await waitFor(() => {
            expect(
                api.get.mock.calls.some(
                    ([url, config]) =>
                        url === "/contacts" &&
                        config.params.page === 1
                )
            ).toBe(true);
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /previous/i,
            })
        );

        await waitFor(() => {
            expect(
                api.get.mock.calls.some(
                    ([url, config]) =>
                        url === "/contacts" &&
                        config.params.page === 0
                )
            ).toBe(true);
        });
    });

    it("disables pagination buttons appropriately", async () => {
        api.get.mockResolvedValue({
            data: {
                content: mockContacts,
                totalPages: 1,
                totalElements: 2,
            },
        });

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        expect(
            screen.getByRole("button", {
                name: /previous/i,
            })
        ).toBeDisabled();

        expect(
            screen.getByRole("button", {
                name: /next/i,
            })
        ).toBeDisabled();
    });

    it("handles missing pagination data", async () => {
        api.get.mockResolvedValue({
            data: {
                content: mockContacts,
            },
        });

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText("Page 0 of 0")
        ).toBeInTheDocument();
    });

    it("shows error toast when delete fails", async () => {
        api.delete.mockRejectedValue(
            new Error("Delete failed")
        );

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByRole(
            "button",
            { name: /^delete$/i }
        );

        fireEvent.click(deleteButtons[0]);

        fireEvent.click(
            screen.getByRole("button", {
                name: /delete contact/i,
            })
        );

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
                "Unable to delete contact. Please try again.",
                "error"
            );
        });
    });

    it("logs out when delete returns 401", async () => {
        api.delete.mockRejectedValue({
            response: {
                status: 401,
            },
        });

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByRole(
            "button",
            { name: /^delete$/i }
        );

        fireEvent.click(deleteButtons[0]);

        fireEvent.click(
            screen.getByRole("button", {
                name: /delete contact/i,
            })
        );

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
        });

        expect(mockNavigate).toHaveBeenCalledWith(
            "/login"
        );
    });

    it("logs out when delete returns 403", async () => {
        api.delete.mockRejectedValue({
            response: {
                status: 403,
            },
        });

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByRole(
            "button",
            { name: /^delete$/i }
        );

        fireEvent.click(deleteButtons[0]);

        fireEvent.click(
            screen.getByRole("button", {
                name: /delete contact/i,
            })
        );

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
        });

        expect(mockNavigate).toHaveBeenCalledWith(
            "/login"
        );
    });

    it("does not close delete modal while deleting", async () => {
        let resolveDelete;

        api.delete.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveDelete = resolve;
                })
        );

        renderContacts();

        await waitFor(() => {
            expect(
                screen.getByText("John Doe")
            ).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByRole(
            "button",
            { name: /^delete$/i }
        );

        fireEvent.click(deleteButtons[0]);

        fireEvent.click(
            screen.getByRole("button", {
                name: /delete contact/i,
            })
        );

        await waitFor(() => {
            expect(
                screen.getByRole("button", {
                    name: /deleting/i,
                })
            ).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /cancel/i,
            })
        );

        expect(
            screen.getByText("Delete Contact?")
        ).toBeInTheDocument();

        resolveDelete({});

        await waitFor(() => {
            expect(
                screen.queryByText("Delete Contact?")
            ).not.toBeInTheDocument();
        });
    });
});

