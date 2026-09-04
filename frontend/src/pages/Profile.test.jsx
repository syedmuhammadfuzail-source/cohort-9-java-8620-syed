
import {
    describe,
    expect,
    it,
    beforeEach,
    vi,
} from "vitest";
import {
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Profile from "./Profile";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const mockNavigate = vi.fn();
const mockLogout = vi.fn();
const mockShowToast = vi.fn();

vi.mock("../services/api", () => ({
    default: {
        put: vi.fn(),
    },
}));

vi.mock("../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../context/ToastContext", () => ({
    useToast: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual(
        "react-router-dom"
    );

    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const user = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "03001234567",
};

function renderProfile() {
    return render(
        <MemoryRouter>
            <Profile />
        </MemoryRouter>
    );
}

function getProfileChangePasswordButton() {
    const buttons = screen.getAllByRole("button", {
        name: "Change Password",
    });

    return buttons.find((button) =>
        button.classList.contains(
            "profile-password-button"
        )
    );
}

function getModalChangePasswordButton() {
    const buttons = screen.getAllByRole("button", {
        name: "Change Password",
    });

    return buttons.find((button) =>
        button.classList.contains(
            "auth-submit-button"
        )
    );
}

describe("Profile", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        useAuth.mockReturnValue({
            user,
            logout: mockLogout,
        });

        useToast.mockReturnValue({
            showToast: mockShowToast,
        });

        api.put.mockResolvedValue({
            data: {},
        });
    });

    it("renders the user profile information", () => {
        renderProfile();

        expect(
            screen.getByRole("heading", {
                name: "User Profile",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText("John")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Doe")
        ).toBeInTheDocument();

        expect(
            screen.getByText("john@example.com")
        ).toBeInTheDocument();

        expect(
            screen.getByText("03001234567")
        ).toBeInTheDocument();
    });

    it("shows fallback values when user information is missing", () => {
        useAuth.mockReturnValue({
            user: {
                firstName: "",
                lastName: null,
                email: "",
                phone: null,
            },
            logout: mockLogout,
        });

        renderProfile();

        expect(
            screen.getAllByText("-")
        ).toHaveLength(4);
    });

    it("navigates to contacts when back button is clicked", async () => {
        const userEventSetup = userEvent.setup();

        renderProfile();

        await userEventSetup.click(
            screen.getByRole("button", {
                name: "← Back to Contacts",
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/contacts"
        );
    });

    it("logs out and navigates to login from header logout", async () => {
        const userEventSetup = userEvent.setup();

        renderProfile();

        const logoutButtons =
            screen.getAllByRole("button", {
                name: "Logout",
            });

        await userEventSetup.click(
            logoutButtons[0]
        );

        expect(mockLogout).toHaveBeenCalledTimes(1);

        expect(mockNavigate).toHaveBeenCalledWith(
            "/login"
        );
    });

    it("logs out and navigates to login from profile logout", async () => {
        const userEventSetup = userEvent.setup();

        renderProfile();

        const logoutButtons =
            screen.getAllByRole("button", {
                name: "Logout",
            });

        await userEventSetup.click(
            logoutButtons[1]
        );

        expect(mockLogout).toHaveBeenCalledTimes(1);

        expect(mockNavigate).toHaveBeenCalledWith(
            "/login"
        );
    });

    it("opens the change password modal", async () => {
        const userEventSetup = userEvent.setup();

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        expect(
            screen.getByRole("heading", {
                name: "Change Password",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Current Password")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("New Password")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText(
                "Confirm New Password"
            )
        ).toBeInTheDocument();
    });

    it("clears password fields when opening the modal", async () => {
        const userEventSetup = userEvent.setup();

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        const currentPassword =
            screen.getByLabelText(
                "Current Password"
            );

        const newPassword =
            screen.getByLabelText("New Password");

        const confirmPassword =
            screen.getByLabelText(
                "Confirm New Password"
            );

        await userEventSetup.type(
            currentPassword,
            "oldpassword"
        );

        await userEventSetup.type(
            newPassword,
            "newpassword"
        );

        await userEventSetup.type(
            confirmPassword,
            "newpassword"
        );

        await userEventSetup.click(
            screen.getByRole("button", {
                name: "Cancel",
            })
        );

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        const reopenedCurrentPassword =
            screen.getByLabelText(
                "Current Password"
            );

        const reopenedNewPassword =
            screen.getByLabelText(
                "New Password"
            );

        const reopenedConfirmPassword =
            screen.getByLabelText(
                "Confirm New Password"
            );

        expect(
            reopenedCurrentPassword
        ).toHaveValue("");

        expect(
            reopenedNewPassword
        ).toHaveValue("");

        expect(
            reopenedConfirmPassword
        ).toHaveValue("");
    });

    it("closes password modal with the close button", async () => {
        const userEventSetup = userEvent.setup();

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        expect(
            screen.getByRole("heading", {
                name: "Change Password",
            })
        ).toBeInTheDocument();

        await userEventSetup.click(
            screen.getByRole("button", {
                name: "×",
            })
        );

        expect(
            screen.queryByRole("heading", {
                name: "Change Password",
            })
        ).not.toBeInTheDocument();
    });

    it("closes password modal with Cancel", async () => {
        const userEventSetup = userEvent.setup();

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        await userEventSetup.click(
            screen.getByRole("button", {
                name: "Cancel",
            })
        );

        expect(
            screen.queryByLabelText(
                "Current Password"
            )
        ).not.toBeInTheDocument();
    });

    it("shows error when current password is empty", async () => {
        const userEventSetup = userEvent.setup();

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        await userEventSetup.click(
            getModalChangePasswordButton()
        );

        expect(
            screen.getByText(
                "Current password is required."
            )
        ).toBeInTheDocument();

        expect(api.put).not.toHaveBeenCalled();
    });

    it("shows error when new password is empty", async () => {
        const userEventSetup = userEvent.setup();

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Current Password"
            ),
            "oldpassword"
        );

        await userEventSetup.click(
            getModalChangePasswordButton()
        );

        expect(
            screen.getByText(
                "New password is required."
            )
        ).toBeInTheDocument();

        expect(api.put).not.toHaveBeenCalled();
    });

    it("shows error when new password is shorter than 8 characters", async () => {
        const userEventSetup = userEvent.setup();

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Current Password"
            ),
            "oldpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText("New Password"),
            "1234567"
        );

        await userEventSetup.click(
            getModalChangePasswordButton()
        );

        expect(
            screen.getByText(
                "New password must be at least 8 characters."
            )
        ).toBeInTheDocument();

        expect(api.put).not.toHaveBeenCalled();
    });

    it("shows error when passwords do not match", async () => {
        const userEventSetup = userEvent.setup();

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Current Password"
            ),
            "oldpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText("New Password"),
            "newpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Confirm New Password"
            ),
            "different"
        );

        await userEventSetup.click(
            getModalChangePasswordButton()
        );

        expect(
            screen.getByText(
                "New passwords do not match."
            )
        ).toBeInTheDocument();

        expect(api.put).not.toHaveBeenCalled();
    });

    it("shows error when new password is the same as current password", async () => {
        const userEventSetup = userEvent.setup();

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Current Password"
            ),
            "samepassword"
        );

        await userEventSetup.type(
            screen.getByLabelText("New Password"),
            "samepassword"
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Confirm New Password"
            ),
            "samepassword"
        );

        await userEventSetup.click(
            getModalChangePasswordButton()
        );

        expect(
            screen.getByText(
                "New password must be different from current password."
            )
        ).toBeInTheDocument();

        expect(api.put).not.toHaveBeenCalled();
    });

    it("changes password successfully", async () => {
        const userEventSetup = userEvent.setup();

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Current Password"
            ),
            "oldpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText("New Password"),
            "newpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Confirm New Password"
            ),
            "newpassword"
        );

        await userEventSetup.click(
            getModalChangePasswordButton()
        );

        await waitFor(() => {
            expect(api.put).toHaveBeenCalledWith(
                "/auth/change-password",
                {
                    currentPassword: "oldpassword",
                    newPassword: "newpassword",
                }
            );
        });

        expect(
            mockShowToast
        ).toHaveBeenCalledWith(
            "Password changed successfully.",
            "success"
        );

        expect(
            screen.queryByLabelText(
                "Current Password"
            )
        ).not.toBeInTheDocument();
    });

    it("handles 401 password change error by logging out", async () => {
        const userEventSetup = userEvent.setup();

        api.put.mockRejectedValueOnce({
            response: {
                status: 401,
            },
        });

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Current Password"
            ),
            "oldpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText("New Password"),
            "newpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Confirm New Password"
            ),
            "newpassword"
        );

        await userEventSetup.click(
            getModalChangePasswordButton()
        );

        await waitFor(() => {
            expect(
                mockLogout
            ).toHaveBeenCalledTimes(1);
        });

        expect(
            mockNavigate
        ).toHaveBeenCalledWith(
            "/login"
        );
    });

    it("handles 403 password change error by logging out", async () => {
        const userEventSetup = userEvent.setup();

        api.put.mockRejectedValueOnce({
            response: {
                status: 403,
            },
        });

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Current Password"
            ),
            "oldpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText("New Password"),
            "newpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Confirm New Password"
            ),
            "newpassword"
        );

        await userEventSetup.click(
            getModalChangePasswordButton()
        );

        await waitFor(() => {
            expect(
                mockLogout
            ).toHaveBeenCalledTimes(1);
        });

        expect(
            mockNavigate
        ).toHaveBeenCalledWith(
            "/login"
        );
    });

    it("shows server message when password change returns a message", async () => {
        const userEventSetup = userEvent.setup();

        api.put.mockRejectedValueOnce({
            response: {
                status: 400,
                data: {
                    message:
                        "Current password is incorrect.",
                },
            },
        });

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Current Password"
            ),
            "oldpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText("New Password"),
            "newpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Confirm New Password"
            ),
            "newpassword"
        );

        await userEventSetup.click(
            getModalChangePasswordButton()
        );

        expect(
            await screen.findByText(
                "Current password is incorrect."
            )
        ).toBeInTheDocument();
    });

    it("shows string error when password change returns a string response", async () => {
        const userEventSetup = userEvent.setup();

        api.put.mockRejectedValueOnce({
            response: {
                status: 400,
                data: "Invalid current password.",
            },
        });

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Current Password"
            ),
            "oldpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText("New Password"),
            "newpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Confirm New Password"
            ),
            "newpassword"
        );

        await userEventSetup.click(
            getModalChangePasswordButton()
        );

        expect(
            await screen.findByText(
                "Invalid current password."
            )
        ).toBeInTheDocument();
    });

    it("shows generic error for unexpected password change failure", async () => {
        const userEventSetup = userEvent.setup();

        api.put.mockRejectedValueOnce({
            response: {
                status: 500,
                data: {},
            },
        });

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Current Password"
            ),
            "oldpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText("New Password"),
            "newpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Confirm New Password"
            ),
            "newpassword"
        );

        await userEventSetup.click(
            getModalChangePasswordButton()
        );

        expect(
            await screen.findByText(
                "Unable to change password. Please try again."
            )
        ).toBeInTheDocument();
    });

    it("shows changing state while password request is pending", async () => {
        const userEventSetup = userEvent.setup();

        let resolveRequest;

        api.put.mockReturnValue(
            new Promise((resolve) => {
                resolveRequest = resolve;
            })
        );

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Current Password"
            ),
            "oldpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText("New Password"),
            "newpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Confirm New Password"
            ),
            "newpassword"
        );

        await userEventSetup.click(
            getModalChangePasswordButton()
        );

        expect(
            screen.getByRole("button", {
                name: "Changing...",
            })
        ).toBeDisabled();

        expect(
            screen.getByRole("button", {
                name: "Cancel",
            })
        ).toBeDisabled();

        expect(
            screen.getByRole("button", {
                name: "×",
            })
        ).toBeDisabled();

        expect(
            screen.getByLabelText(
                "Current Password"
            )
        ).toBeDisabled();

        resolveRequest({
            data: {},
        });

        await waitFor(() => {
            expect(
                mockShowToast
            ).toHaveBeenCalled();
        });
    });

    it("does not close the modal while password change is in progress", async () => {
        const userEventSetup = userEvent.setup();

        let resolveRequest;

        api.put.mockReturnValue(
            new Promise((resolve) => {
                resolveRequest = resolve;
            })
        );

        renderProfile();

        await userEventSetup.click(
            getProfileChangePasswordButton()
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Current Password"
            ),
            "oldpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText("New Password"),
            "newpassword"
        );

        await userEventSetup.type(
            screen.getByLabelText(
                "Confirm New Password"
            ),
            "newpassword"
        );

        await userEventSetup.click(
            getModalChangePasswordButton()
        );

        expect(
            screen.getByRole("button", {
                name: "Cancel",
            })
        ).toBeDisabled();

        expect(
            screen.getByRole("heading", {
                name: "Change Password",
            })
        ).toBeInTheDocument();

        resolveRequest({
            data: {},
        });

        await waitFor(() => {
            expect(
                screen.queryByLabelText(
                    "Current Password"
                )
            ).not.toBeInTheDocument();
        });
    });
});
