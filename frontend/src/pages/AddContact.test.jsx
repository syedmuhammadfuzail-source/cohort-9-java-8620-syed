
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AddContact from "./AddContact";
import api from "../services/api";

const { mockNavigate, mockShowToast } = vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockShowToast: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock("../context/ToastContext", () => ({
    useToast: () => ({
        showToast: mockShowToast,
    }),
}));

vi.mock("../services/api", () => ({
    default: {
        post: vi.fn(),
    },
}));

describe("AddContact", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.post.mockReset();
    });

    const fillValidContact = () => {
        fireEvent.change(
            screen.getByLabelText("First Name *"),
            {
                target: {
                    value: "John",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Email Address"),
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
    };

    it("renders the Add Contact page", () => {
        render(<AddContact />);

        expect(
            screen.getByText("Contact Management")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Add Contact")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Add New Contact")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Basic Information")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Email Addresses")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Phone Numbers")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Create Contact",
            })
        ).toBeInTheDocument();
    });

    it("renders all basic information fields", () => {
        render(<AddContact />);

        expect(
            screen.getByLabelText("First Name *")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Last Name")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Job Title")
        ).toBeInTheDocument();
    });

    it("renders one email field by default", () => {
        render(<AddContact />);

        expect(
            screen.getByLabelText("Email Address")
        ).toBeInTheDocument();

        const selects = screen.getAllByRole("combobox");

        expect(selects).toHaveLength(2);
        expect(selects[0]).toHaveValue("work");
    });

    it("renders one phone field by default", () => {
        render(<AddContact />);

        expect(
            screen.getByLabelText("Phone Number")
        ).toBeInTheDocument();

        const selects = screen.getAllByRole("combobox");

        expect(selects).toHaveLength(2);
        expect(selects[1]).toHaveValue("mobile");
    });

    it("updates the first name", () => {
        render(<AddContact />);

        const firstName =
            screen.getByLabelText("First Name *");

        fireEvent.change(firstName, {
            target: {
                value: "John",
            },
        });

        expect(firstName).toHaveValue("John");
    });

    it("updates the last name", () => {
        render(<AddContact />);

        const lastName =
            screen.getByLabelText("Last Name");

        fireEvent.change(lastName, {
            target: {
                value: "Doe",
            },
        });

        expect(lastName).toHaveValue("Doe");
    });

    it("updates the job title", () => {
        render(<AddContact />);

        const title =
            screen.getByLabelText("Job Title");

        fireEvent.change(title, {
            target: {
                value: "Software Engineer",
            },
        });

        expect(title).toHaveValue(
            "Software Engineer"
        );
    });

    it("updates the email value and label", () => {
        render(<AddContact />);

        const email =
            screen.getByLabelText("Email Address");

        fireEvent.change(email, {
            target: {
                value: "john@example.com",
            },
        });

        expect(email).toHaveValue(
            "john@example.com"
        );

        const selects =
            screen.getAllByRole("combobox");

        fireEvent.change(selects[0], {
            target: {
                value: "personal",
            },
        });

        expect(selects[0]).toHaveValue("personal");
    });

    it("updates the phone value and label", () => {
        render(<AddContact />);

        const phone =
            screen.getByLabelText("Phone Number");

        fireEvent.change(phone, {
            target: {
                value: "03001234567",
            },
        });

        expect(phone).toHaveValue(
            "03001234567"
        );

        const selects =
            screen.getAllByRole("combobox");

        fireEvent.change(selects[1], {
            target: {
                value: "home",
            },
        });

        expect(selects[1]).toHaveValue("home");
    });

    it("adds another email field", () => {
        render(<AddContact />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "+ Add Email",
            })
        );

        expect(
            screen.getAllByLabelText("Email Address")
        ).toHaveLength(2);

        expect(
            screen.getAllByRole("button", {
                name: "Remove",
            })
        ).toHaveLength(2);
    });

    it("adds another phone field", () => {
        render(<AddContact />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "+ Add Phone",
            })
        );

        expect(
            screen.getAllByLabelText("Phone Number")
        ).toHaveLength(2);

        expect(
            screen.getAllByRole("button", {
                name: "Remove",
            })
        ).toHaveLength(2);
    });

    it("updates a newly added email", () => {
        render(<AddContact />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "+ Add Email",
            })
        );

        const emails =
            screen.getAllByLabelText(
                "Email Address"
            );

        fireEvent.change(emails[1], {
            target: {
                value: "second@example.com",
            },
        });

        expect(emails[1]).toHaveValue(
            "second@example.com"
        );

        const selects =
            screen.getAllByRole("combobox");

        fireEvent.change(selects[1], {
            target: {
                value: "personal",
            },
        });

        expect(selects[1]).toHaveValue(
            "personal"
        );
    });

    it("updates a newly added phone", () => {
        render(<AddContact />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "+ Add Phone",
            })
        );

        const phones =
            screen.getAllByLabelText(
                "Phone Number"
            );

        fireEvent.change(phones[1], {
            target: {
                value: "03111234567",
            },
        });

        expect(phones[1]).toHaveValue(
            "03111234567"
        );

        const selects =
            screen.getAllByRole("combobox");

        expect(selects).toHaveLength(3);

        fireEvent.change(selects[2], {
            target: {
                value: "home",
            },
        });

        expect(selects[2]).toHaveValue("home");
    });

    it("removes an email field", () => {
        render(<AddContact />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "+ Add Email",
            })
        );

        expect(
            screen.getAllByLabelText(
                "Email Address"
            )
        ).toHaveLength(2);

        const removeButtons =
            screen.getAllByRole("button", {
                name: "Remove",
            });

        fireEvent.click(removeButtons[1]);

        expect(
            screen.getAllByLabelText(
                "Email Address"
            )
        ).toHaveLength(1);
    });

    it("removes a phone field", () => {
        render(<AddContact />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "+ Add Phone",
            })
        );

        expect(
            screen.getAllByLabelText(
                "Phone Number"
            )
        ).toHaveLength(2);

        const removeButtons =
            screen.getAllByRole("button", {
                name: "Remove",
            });

        fireEvent.click(removeButtons[1]);

        expect(
            screen.getAllByLabelText(
                "Phone Number"
            )
        ).toHaveLength(1);
    });

    it("navigates back when Back to Contacts is clicked", () => {
        render(<AddContact />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Back to Contacts",
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/contacts"
        );
    });

    it("navigates back when Cancel is clicked", () => {
        render(<AddContact />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Cancel",
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/contacts"
        );
    });

    it("shows first name validation error", async () => {
        render(<AddContact />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Contact",
            })
        );

        expect(
            await screen.findByText(
                "First name is required."
            )
        ).toBeInTheDocument();

        expect(api.post).not.toHaveBeenCalled();
    });

    it("shows email validation error", async () => {
        render(<AddContact />);

        fireEvent.change(
            screen.getByLabelText(
                "First Name *"
            ),
            {
                target: {
                    value: "John",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Contact",
            })
        );

        expect(
            await screen.findByText(
                "At least one email is required."
            )
        ).toBeInTheDocument();

        expect(api.post).not.toHaveBeenCalled();
    });

    it("shows phone validation error", async () => {
        render(<AddContact />);

        fireEvent.change(
            screen.getByLabelText(
                "First Name *"
            ),
            {
                target: {
                    value: "John",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText(
                "Email Address"
            ),
            {
                target: {
                    value: "john@example.com",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Contact",
            })
        );

        expect(
            await screen.findByText(
                "At least one phone number is required."
            )
        ).toBeInTheDocument();

        expect(api.post).not.toHaveBeenCalled();
    });

    it("creates a contact successfully", async () => {
        api.post.mockResolvedValue({
            data: {
                id: 1,
            },
        });

        render(<AddContact />);

        fillValidContact();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Contact",
            })
        );

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledTimes(1);
        });

        expect(api.post).toHaveBeenCalledWith(
            "/contacts",
            {
                firstName: "John",
                lastName: "",
                title: "",
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

        expect(
            mockShowToast
        ).toHaveBeenCalledWith(
            "Contact added successfully.",
            "success"
        );

        expect(
            mockNavigate
        ).toHaveBeenCalledWith(
            "/contacts"
        );
    });

    it("trims contact values before submitting", async () => {
        api.post.mockResolvedValue({
            data: {
                id: 1,
            },
        });

        render(<AddContact />);

        fireEvent.change(
            screen.getByLabelText(
                "First Name *"
            ),
            {
                target: {
                    value: "  John  ",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText(
                "Last Name"
            ),
            {
                target: {
                    value: "  Doe  ",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText(
                "Job Title"
            ),
            {
                target: {
                    value: "  Software Engineer  ",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText(
                "Email Address"
            ),
            {
                target: {
                    value: "  john@example.com  ",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText(
                "Phone Number"
            ),
            {
                target: {
                    value: " 03001234567 ",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Contact",
            })
        );

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledTimes(1);
        });

        expect(api.post).toHaveBeenCalledWith(
            "/contacts",
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

    it("does not submit empty email and phone entries", async () => {
        api.post.mockResolvedValue({
            data: {
                id: 1,
            },
        });

        render(<AddContact />);

        fillValidContact();

        fireEvent.click(
            screen.getByRole("button", {
                name: "+ Add Email",
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "+ Add Phone",
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Contact",
            })
        );

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledTimes(1);
        });

        expect(api.post).toHaveBeenCalledWith(
            "/contacts",
            {
                firstName: "John",
                lastName: "",
                title: "",
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

    it("shows generic error when API request fails", async () => {
        api.post.mockRejectedValue(
            new Error("Network error")
        );

        render(<AddContact />);

        fillValidContact();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Contact",
            })
        );

        expect(
            await screen.findByText(
                "Unable to create contact. Please try again."
            )
        ).toBeInTheDocument();

        expect(
            mockNavigate
        ).not.toHaveBeenCalled();
    });

    it("shows session expired error for 401 response", async () => {
        api.post.mockRejectedValue({
            response: {
                status: 401,
            },
        });

        render(<AddContact />);

        fillValidContact();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Contact",
            })
        );

        expect(
            await screen.findByText(
                "Your session has expired. Please login again."
            )
        ).toBeInTheDocument();

        expect(
            mockNavigate
        ).not.toHaveBeenCalled();
    });

    it("shows session expired error for 403 response", async () => {
        api.post.mockRejectedValue({
            response: {
                status: 403,
            },
        });

        render(<AddContact />);

        fillValidContact();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Contact",
            })
        );

        expect(
            await screen.findByText(
                "Your session has expired. Please login again."
            )
        ).toBeInTheDocument();

        expect(
            mockNavigate
        ).not.toHaveBeenCalled();
    });

    it("shows server validation error from API response", async () => {
        api.post.mockRejectedValue({
            response: {
                status: 400,
                data: {
                    error: "Email already exists",
                },
            },
        });

        render(<AddContact />);

        fillValidContact();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Contact",
            })
        );

        expect(
            await screen.findByText(
                "Email already exists"
            )
        ).toBeInTheDocument();

        expect(
            mockNavigate
        ).not.toHaveBeenCalled();
    });

    it("disables controls while submitting", async () => {
        let resolveRequest;

        api.post.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
        );

        render(<AddContact />);

        fillValidContact();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Contact",
            })
        );

        expect(
            await screen.findByRole("button", {
                name: "Creating Contact...",
            })
        ).toBeDisabled();

        expect(
            screen.getByRole("button", {
                name: "Back to Contacts",
            })
        ).toBeDisabled();

        expect(
            screen.getByRole("button", {
                name: "Cancel",
            })
        ).toBeDisabled();

        expect(
            screen.getByRole("button", {
                name: "+ Add Email",
            })
        ).toBeDisabled();

        expect(
            screen.getByRole("button", {
                name: "+ Add Phone",
            })
        ).toBeDisabled();

        resolveRequest({
            data: {
                id: 1,
            },
        });

        await waitFor(() => {
            expect(
                mockNavigate
            ).toHaveBeenCalledWith(
                "/contacts"
            );
        });
    });
});

