
import { describe, expect, it, beforeEach, vi } from "vitest";
import {
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import EditContact from "./EditContact";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

vi.mock("../services/api", () => ({
    default: {
        get: vi.fn(),
        put: vi.fn(),
    },
}));

vi.mock("../context/ToastContext", () => ({
    useToast: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ id: "123" }),
    };
});

const contact = {
    id: 123,
    firstName: "John",
    lastName: "Doe",
    title: "Software Engineer",
    emails: [
        {
            id: 1,
            email: "john@example.com",
            label: "work",
        },
    ],
    phones: [
        {
            id: 2,
            phone: "03001234567",
            label: "mobile",
        },
    ],
};

function renderEditContact() {
    return render(
        <MemoryRouter>
            <EditContact />
        </MemoryRouter>
    );
}

describe("EditContact", () => {
    const showToast = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        useToast.mockReturnValue({
            showToast,
        });

        api.get.mockResolvedValue({
            data: contact,
        });

        api.put.mockResolvedValue({
            data: contact,
        });
    });

    it("shows loading state while fetching contact", async () => {
        let resolveRequest;

        api.get.mockReturnValue(
            new Promise((resolve) => {
                resolveRequest = resolve;
            })
        );

        renderEditContact();

        expect(
            screen.getByText("Loading contact...")
        ).toBeInTheDocument();

        resolveRequest({
            data: contact,
        });

        await waitFor(() => {
            expect(
                screen.getByText("Edit Contact")
            ).toBeInTheDocument();
        });
    });

    it("loads and displays contact information", async () => {
        renderEditContact();

        expect(
            await screen.findByDisplayValue("John")
        ).toBeInTheDocument();

        expect(
            screen.getByDisplayValue("Doe")
        ).toBeInTheDocument();

        expect(
            screen.getByDisplayValue("Software Engineer")
        ).toBeInTheDocument();

        expect(
            screen.getByDisplayValue("john@example.com")
        ).toBeInTheDocument();

        expect(
            screen.getByDisplayValue("03001234567")
        ).toBeInTheDocument();

        expect(api.get).toHaveBeenCalledWith(
            "/contacts/123"
        );
    });

    it("uses fallback values for missing contact fields", async () => {
        api.get.mockResolvedValueOnce({
            data: {
                firstName: null,
                lastName: null,
                title: null,
                emails: [
                    {
                        id: 10,
                        email: null,
                        label: null,
                    },
                ],
                phones: [
                    {
                        id: 20,
                        phone: null,
                        label: null,
                    },
                ],
            },
        });

        renderEditContact();

        await waitFor(() => {
            expect(
                screen.getByLabelText("First Name *")
            ).toHaveValue("");
        });

        expect(
            screen.getByLabelText("Last Name")
        ).toHaveValue("");

        expect(
            screen.getByLabelText("Job Title")
        ).toHaveValue("");

        expect(
            screen.getByLabelText("Email Address")
        ).toHaveValue("");

        expect(
            screen.getByLabelText("Phone Number")
        ).toHaveValue("");

        expect(
            screen.getByLabelText("Label", {
                selector: "#email-label-0",
            })
        ).toHaveValue("work");

        expect(
            screen.getByLabelText("Label", {
                selector: "#phone-label-0",
            })
        ).toHaveValue("mobile");
    });

    it.each([
        {
            description: "unauthorized",
            status: 401,
        },
        {
            description: "forbidden",
            status: 403,
        },
        {
            description: "generic contact loading error",
            status: 500,
        },
    ])(
        "handles $description contact loading",
        async ({ status }) => {
            api.get.mockRejectedValueOnce({
                response: {
                    status,
                },
            });

            renderEditContact();

            expect(
                await screen.findByText(
                    status === 500
                        ? "Unable to load contact. Please try again."
                        : "You are not authorized to edit this contact."
                )
            ).toBeInTheDocument();
        }
    );

    it("navigates back to contact from error screen", async () => {
        const user = userEvent.setup();

        api.get.mockRejectedValueOnce({
            response: {
                status: 404,
            },
        });

        renderEditContact();

        const button = await screen.findByRole(
            "button",
            {
                name: "Back to Contact",
            }
        );

        await user.click(button);

        expect(mockNavigate).toHaveBeenCalledWith(
            "/contacts/123"
        );
    });

    it("navigates back to contacts from error screen", async () => {
        const user = userEvent.setup();

        api.get.mockRejectedValueOnce({
            response: {
                status: 404,
            },
        });

        renderEditContact();

        const button = await screen.findByRole(
            "button",
            {
                name: "Back to Contacts",
            }
        );

        await user.click(button);

        expect(mockNavigate).toHaveBeenCalledWith(
            "/contacts"
        );
    });

    it("updates basic contact fields", async () => {
        const user = userEvent.setup();

        renderEditContact();

        const firstName =
            await screen.findByLabelText("First Name *");

        const lastName =
            screen.getByLabelText("Last Name");

        const title =
            screen.getByLabelText("Job Title");

        await user.clear(firstName);
        await user.type(firstName, "Jane");

        await user.clear(lastName);
        await user.type(lastName, "Smith");

        await user.clear(title);
        await user.type(title, "Manager");

        expect(firstName).toHaveValue("Jane");
        expect(lastName).toHaveValue("Smith");
        expect(title).toHaveValue("Manager");
    });

    it("updates email and email label", async () => {
        const user = userEvent.setup();

        renderEditContact();

        const email =
            await screen.findByLabelText(
                "Email Address"
            );

        const label =
            screen.getByLabelText("Label", {
                selector: "#email-label-0",
            });

        await user.clear(email);
        await user.type(
            email,
            "jane@example.com"
        );

        await user.selectOptions(
            label,
            "personal"
        );

        expect(email).toHaveValue(
            "jane@example.com"
        );

        expect(label).toHaveValue("personal");
    });

    it("updates phone and phone label", async () => {
        const user = userEvent.setup();

        renderEditContact();

        const phone =
            await screen.findByLabelText(
                "Phone Number"
            );

        const label =
            screen.getByLabelText("Label", {
                selector: "#phone-label-0",
            });

        await user.clear(phone);
        await user.type(phone, "03111234567");

        await user.selectOptions(
            label,
            "home"
        );

        expect(phone).toHaveValue(
            "03111234567"
        );

        expect(label).toHaveValue("home");
    });

    it("adds a new email", async () => {
        const user = userEvent.setup();

        renderEditContact();

        await screen.findByDisplayValue(
            "john@example.com"
        );

        await user.click(
            screen.getByRole("button", {
                name: "+ Add Email",
            })
        );

        expect(
            screen.getAllByLabelText("Email Address")
        ).toHaveLength(2);

        expect(
            screen.getByLabelText("Label", {
                selector: "#email-label-1",
            })
        ).toHaveValue("work");
    });

    it("removes an email", async () => {
        const user = userEvent.setup();

        api.get.mockResolvedValueOnce({
            data: {
                ...contact,
                emails: [
                    {
                        id: 1,
                        email: "one@example.com",
                        label: "work",
                    },
                    {
                        id: 2,
                        email: "two@example.com",
                        label: "personal",
                    },
                ],
            },
        });

        renderEditContact();

        await screen.findByDisplayValue(
            "one@example.com"
        );

        expect(
            screen.getAllByRole("button", {
                name: "Remove",
            })
        ).toHaveLength(3);

        await user.click(
            screen.getAllByRole("button", {
                name: "Remove",
            })[0]
        );

        expect(
            screen.queryByDisplayValue(
                "one@example.com"
            )
        ).not.toBeInTheDocument();

        expect(
            screen.getByDisplayValue(
                "two@example.com"
            )
        ).toBeInTheDocument();
    });

    it("adds a new phone", async () => {
        const user = userEvent.setup();

        renderEditContact();

        await screen.findByDisplayValue(
            "03001234567"
        );

        await user.click(
            screen.getByRole("button", {
                name: "+ Add Phone",
            })
        );

        expect(
            screen.getAllByLabelText(
                "Phone Number"
            )
        ).toHaveLength(2);

        expect(
            screen.getByLabelText("Label", {
                selector: "#phone-label-1",
            })
        ).toHaveValue("mobile");
    });

    it("removes a phone", async () => {
        const user = userEvent.setup();

        api.get.mockResolvedValueOnce({
            data: {
                ...contact,
                phones: [
                    {
                        id: 1,
                        phone: "03001111111",
                        label: "mobile",
                    },
                    {
                        id: 2,
                        phone: "03002222222",
                        label: "home",
                    },
                ],
            },
        });

        renderEditContact();

        await screen.findByDisplayValue(
            "03001111111"
        );

        expect(
            screen.getAllByRole("button", {
                name: "Remove",
            })
        ).toHaveLength(3);

        await user.click(
            screen.getAllByRole("button", {
                name: "Remove",
            })[2]
        );

        expect(
            screen.getByDisplayValue(
                "03001111111"
            )
        ).toBeInTheDocument();

        expect(
            screen.queryByDisplayValue(
                "03002222222"
            )
        ).not.toBeInTheDocument();
    });

    it.each([
        {
            field: "first name",
            label: "First Name *",
            message: "First name is required.",
        },
        {
            field: "email",
            label: "Email Address",
            message: "At least one email is required.",
        },
        {
            field: "phone",
            label: "Phone Number",
            message: "At least one phone number is required.",
        },
    ])(
        "shows validation error when $field is empty",
        async ({ label, message }) => {
            const user = userEvent.setup();

            renderEditContact();

            const input =
                await screen.findByLabelText(label);

            await user.clear(input);

            await user.click(
                screen.getByRole("button", {
                    name: "Save Changes",
                })
            );

            expect(
                screen.getByText(message)
            ).toBeInTheDocument();

            expect(api.put).not.toHaveBeenCalled();
        }
    );

    it("submits trimmed contact data successfully", async () => {
        const user = userEvent.setup();

        renderEditContact();

        const firstName =
            await screen.findByLabelText("First Name *");

        const lastName =
            screen.getByLabelText("Last Name");

        const title =
            screen.getByLabelText("Job Title");

        const email =
            screen.getByLabelText(
                "Email Address"
            );

        const phone =
            screen.getByLabelText(
                "Phone Number"
            );

        await user.clear(firstName);
        await user.type(firstName, "  Jane  ");

        await user.clear(lastName);
        await user.type(lastName, "  Smith  ");

        await user.clear(title);
        await user.type(
            title,
            "  Project Manager  "
        );

        await user.clear(email);
        await user.type(
            email,
            "  jane@example.com  "
        );

        await user.clear(phone);
        await user.type(
            phone,
            " 03111234567 "
        );

        await user.click(
            screen.getByRole("button", {
                name: "Save Changes",
            })
        );

        await waitFor(() => {
            expect(api.put).toHaveBeenCalledWith(
                "/contacts/123",
                {
                    firstName: "Jane",
                    lastName: "Smith",
                    title: "Project Manager",
                    emails: [
                        {
                            email: "jane@example.com",
                            label: "work",
                        },
                    ],
                    phones: [
                        {
                            phone: "03111234567",
                            label: "mobile",
                        },
                    ],
                }
            );
        });

        expect(showToast).toHaveBeenCalledWith(
            "Contact updated successfully.",
            "success"
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/contacts/123"
        );
    });

    it("ignores empty email and phone entries when submitting", async () => {
        const user = userEvent.setup();

        renderEditContact();

        await screen.findByDisplayValue(
            "john@example.com"
        );

        await user.click(
            screen.getByRole("button", {
                name: "+ Add Email",
            })
        );

        await user.click(
            screen.getByRole("button", {
                name: "+ Add Phone",
            })
        );

        await user.click(
            screen.getByRole("button", {
                name: "Save Changes",
            })
        );

        await waitFor(() => {
            expect(api.put).toHaveBeenCalledWith(
                "/contacts/123",
                {
                    firstName: "John",
                    lastName: "Doe",
                    title: "Software Engineer",
                    emails: [
                        {
                            email: "john@example.com",
                            label: "work",
                        },
                    ],
                    phones: [
                        {
                            phone: "03001234567",
                            label: "mobile",
                        },
                    ],
                }
            );
        });
    });

    it("handles unauthorized update", async () => {
        const user = userEvent.setup();

        api.put.mockRejectedValueOnce({
            response: {
                status: 401,
            },
        });

        renderEditContact();

        await screen.findByDisplayValue(
            "John"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Save Changes",
            })
        );

        expect(
            await screen.findByText(
                "Your session has expired or you are not authorized."
            )
        ).toBeInTheDocument();

        expect(mockNavigate).not.toHaveBeenCalledWith(
            "/contacts/123"
        );
    });

    it("handles forbidden update", async () => {
        const user = userEvent.setup();

        api.put.mockRejectedValueOnce({
            response: {
                status: 403,
            },
        });

        renderEditContact();

        await screen.findByDisplayValue(
            "John"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Save Changes",
            })
        );

        expect(
            await screen.findByText(
                "Your session has expired or you are not authorized."
            )
        ).toBeInTheDocument();
    });

    it("handles server validation error during update", async () => {
        const user = userEvent.setup();

        api.put.mockRejectedValueOnce({
            response: {
                status: 400,
                data: {
                    error: "Email already exists.",
                },
            },
        });

        renderEditContact();

        await screen.findByDisplayValue(
            "John"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Save Changes",
            })
        );

        expect(
            await screen.findByText(
                "Email already exists."
            )
        ).toBeInTheDocument();
    });

    it("handles generic update error", async () => {
        const user = userEvent.setup();

        api.put.mockRejectedValueOnce({
            response: {
                status: 500,
                data: {},
            },
        });

        renderEditContact();

        await screen.findByDisplayValue(
            "John"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Save Changes",
            })
        );

        expect(
            await screen.findByText(
                "Unable to update contact. Please try again."
            )
        ).toBeInTheDocument();
    });

    it("shows saving state while update is in progress", async () => {
        const user = userEvent.setup();

        let resolveUpdate;

        api.put.mockReturnValue(
            new Promise((resolve) => {
                resolveUpdate = resolve;
            })
        );

        renderEditContact();

        await screen.findByDisplayValue(
            "John"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Save Changes",
            })
        );

        expect(
            screen.getByRole("button", {
                name: "Saving Changes...",
            })
        ).toBeDisabled();

        expect(
            screen.getByRole("button", {
                name: "Cancel",
            })
        ).toBeDisabled();

        expect(
            screen.getByRole("button", {
                name: "Back to Contact",
            })
        ).toBeDisabled();

        resolveUpdate({
            data: contact,
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(
                "/contacts/123"
            );
        });
    });

    it("navigates to contact when Cancel is clicked", async () => {
        const user = userEvent.setup();

        renderEditContact();

        await screen.findByDisplayValue(
            "John"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Cancel",
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/contacts/123"
        );
    });

    it("disables form controls while saving", async () => {
        const user = userEvent.setup();

        let resolveUpdate;

        api.put.mockReturnValue(
            new Promise((resolve) => {
                resolveUpdate = resolve;
            })
        );

        renderEditContact();

        await screen.findByDisplayValue(
            "John"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Save Changes",
            })
        );

        expect(
            screen.getByLabelText("First Name *")
        ).toBeDisabled();

        expect(
            screen.getByLabelText("Last Name")
        ).toBeDisabled();

        expect(
            screen.getByLabelText("Job Title")
        ).toBeDisabled();

        expect(
            screen.getByLabelText("Email Address")
        ).toBeDisabled();

        expect(
            screen.getByLabelText("Phone Number")
        ).toBeDisabled();

        resolveUpdate({
            data: contact,
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalled();
        });
    });
});
