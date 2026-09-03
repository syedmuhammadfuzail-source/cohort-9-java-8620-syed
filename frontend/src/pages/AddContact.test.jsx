
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AddContact from "./AddContact";

vi.mock("axios", () => ({
    default: {
        post: vi.fn(),
    },
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderAddContact = () =>
    render(
        <MemoryRouter>
            <AddContact />
        </MemoryRouter>
    );

describe("AddContact", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        axios.post.mockResolvedValue({
            data: { id: 1 },
        });
    });

    it("renders the add contact form", () => {
        renderAddContact();

        expect(
            screen.getByRole("heading", {
                name: "Add Contact",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("First Name")
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Last Name")
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Title")
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("name@example.com")
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Phone Number")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Save Contact",
            })
        ).toBeInTheDocument();
    });

    it("updates the basic contact fields", () => {
        renderAddContact();

        const firstName =
            screen.getByPlaceholderText("First Name");
        const lastName =
            screen.getByPlaceholderText("Last Name");
        const title =
            screen.getByPlaceholderText("Title");

        fireEvent.change(firstName, {
            target: {
                name: "firstName",
                value: "John",
            },
        });

        fireEvent.change(lastName, {
            target: {
                name: "lastName",
                value: "Doe",
            },
        });

        fireEvent.change(title, {
            target: {
                name: "title",
                value: "Manager",
            },
        });

        expect(firstName).toHaveValue("John");
        expect(lastName).toHaveValue("Doe");
        expect(title).toHaveValue("Manager");
    });

    it("updates the email value and label", () => {
        renderAddContact();

        const email =
            screen.getByPlaceholderText("name@example.com");

        const emailLabel =
            screen.getByLabelText("Label", {
                selector: "#email-label-0",
            });

        fireEvent.change(email, {
            target: {
                value: "john@example.com",
            },
        });

        fireEvent.change(emailLabel, {
            target: {
                value: "Work",
            },
        });

        expect(email).toHaveValue("john@example.com");
        expect(emailLabel).toHaveValue("Work");
    });

    it("updates the phone value and label", () => {
        renderAddContact();

        const phone =
            screen.getByPlaceholderText("Phone Number");

        const phoneLabel =
            screen.getByLabelText("Label", {
                selector: "#phone-label-0",
            });

        fireEvent.change(phone, {
            target: {
                value: "03001234567",
            },
        });

        fireEvent.change(phoneLabel, {
            target: {
                value: "Home",
            },
        });

        expect(phone).toHaveValue("03001234567");
        expect(phoneLabel).toHaveValue("Home");
    });

    it("adds another email field", () => {
        renderAddContact();

        expect(
            screen.getAllByPlaceholderText(
                "name@example.com"
            )
        ).toHaveLength(1);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Add Email",
            })
        );

        expect(
            screen.getAllByPlaceholderText(
                "name@example.com"
            )
        ).toHaveLength(2);

        expect(
            screen.getAllByRole("button", {
                name: "Remove",
            })
        ).toHaveLength(2);
    });

    it("removes an additional email field", () => {
        renderAddContact();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Add Email",
            })
        );

        expect(
            screen.getAllByPlaceholderText(
                "name@example.com"
            )
        ).toHaveLength(2);

        const emailRemoveButton =
            screen.getAllByRole("button", {
                name: "Remove",
            })[0];

        fireEvent.click(emailRemoveButton);

        expect(
            screen.getAllByPlaceholderText(
                "name@example.com"
            )
        ).toHaveLength(1);
    });

    it("updates a newly added email", () => {
        renderAddContact();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Add Email",
            })
        );

        const emails =
            screen.getAllByPlaceholderText(
                "name@example.com"
            );

        fireEvent.change(emails[1], {
            target: {
                value: "work@example.com",
            },
        });

        const secondEmailLabel =
            screen.getByLabelText("Label", {
                selector: "#email-label-1",
            });

        fireEvent.change(secondEmailLabel, {
            target: {
                value: "Other",
            },
        });

        expect(emails[1]).toHaveValue(
            "work@example.com"
        );

        expect(secondEmailLabel).toHaveValue(
            "Other"
        );
    });

    it("adds another phone field", () => {
        renderAddContact();

        expect(
            screen.getAllByPlaceholderText(
                "Phone Number"
            )
        ).toHaveLength(1);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Add Phone",
            })
        );

        expect(
            screen.getAllByPlaceholderText(
                "Phone Number"
            )
        ).toHaveLength(2);

        expect(
            screen.getAllByRole("button", {
                name: "Remove",
            })
        ).toHaveLength(2);
    });

    it("removes an additional phone field", () => {
        renderAddContact();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Add Phone",
            })
        );

        expect(
            screen.getAllByPlaceholderText(
                "Phone Number"
            )
        ).toHaveLength(2);

        const phoneRemoveButton =
            screen.getAllByRole("button", {
                name: "Remove",
            })[1];

        fireEvent.click(phoneRemoveButton);

        expect(
            screen.getAllByPlaceholderText(
                "Phone Number"
            )
        ).toHaveLength(1);
    });

    it("updates a newly added phone", () => {
        renderAddContact();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Add Phone",
            })
        );

        const phones =
            screen.getAllByPlaceholderText(
                "Phone Number"
            );

        fireEvent.change(phones[1], {
            target: {
                value: "03111234567",
            },
        });

        const secondPhoneLabel =
            screen.getByLabelText("Label", {
                selector: "#phone-label-1",
            });

        fireEvent.change(secondPhoneLabel, {
            target: {
                value: "Work",
            },
        });

        expect(phones[1]).toHaveValue(
            "03111234567"
        );

        expect(secondPhoneLabel).toHaveValue(
            "Work"
        );
    });

    it("navigates to contacts when Cancel is clicked", () => {
        renderAddContact();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Cancel",
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/contacts"
        );
    });

    it("submits the contact successfully", async () => {
        renderAddContact();

        fireEvent.change(
            screen.getByPlaceholderText("First Name"),
            {
                target: {
                    name: "firstName",
                    value: "John",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Last Name"),
            {
                target: {
                    name: "lastName",
                    value: "Doe",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Title"),
            {
                target: {
                    name: "title",
                    value: "Manager",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "name@example.com"
            ),
            {
                target: {
                    value: "john@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Phone Number"),
            {
                target: {
                    value: "03001234567",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Save Contact",
            })
        );

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                "http://localhost:8080/api/contacts",
                {
                    firstName: "John",
                    lastName: "Doe",
                    title: "Manager",
                    emails: [
                        {
                            email: "john@example.com",
                            label: "Personal",
                        },
                    ],
                    phones: [
                        {
                            phone: "03001234567",
                            label: "Mobile",
                        },
                    ],
                }
            );
        });

        expect(mockNavigate).toHaveBeenCalledWith(
            "/contacts"
        );
    });

    it("shows saving state while the request is pending", async () => {
        let resolveRequest;

        axios.post.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
        );

        renderAddContact();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Save Contact",
            })
        );

        expect(
            screen.getByRole("button", {
                name: "Saving...",
            })
        ).toBeDisabled();

        expect(
            screen.getByPlaceholderText("First Name")
        ).toBeDisabled();

        expect(
            screen.getByRole("button", {
                name: "Cancel",
            })
        ).toBeDisabled();

        resolveRequest({
            data: { id: 1 },
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(
                "/contacts"
            );
        });
    });

    it("handles an API error without navigating", async () => {
        axios.post.mockRejectedValue(
            new Error("Network error")
        );

        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        renderAddContact();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Save Contact",
            })
        );

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalledWith(
                "Error creating contact:",
                expect.any(Error)
            );
        });

        expect(mockNavigate).not.toHaveBeenCalled();

        expect(
            screen.getByRole("button", {
                name: "Save Contact",
            })
        ).toBeEnabled();

        consoleError.mockRestore();
    });

    it("allows changing the email label to every available option", () => {
        renderAddContact();

        const label =
            screen.getByLabelText("Label", {
                selector: "#email-label-0",
            });

        fireEvent.change(label, {
            target: {
                value: "Work",
            },
        });

        expect(label).toHaveValue("Work");

        fireEvent.change(label, {
            target: {
                value: "Other",
            },
        });

        expect(label).toHaveValue("Other");

        fireEvent.change(label, {
            target: {
                value: "Personal",
            },
        });

        expect(label).toHaveValue("Personal");
    });

    it("allows changing the phone label to every available option", () => {
        renderAddContact();

        const label =
            screen.getByLabelText("Label", {
                selector: "#phone-label-0",
            });

        fireEvent.change(label, {
            target: {
                value: "Home",
            },
        });

        expect(label).toHaveValue("Home");

        fireEvent.change(label, {
            target: {
                value: "Work",
            },
        });

        expect(label).toHaveValue("Work");

        fireEvent.change(label, {
            target: {
                value: "Other",
            },
        });

        expect(label).toHaveValue("Other");

        fireEvent.change(label, {
            target: {
                value: "Mobile",
            },
        });

        expect(label).toHaveValue("Mobile");
    });
});

