import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

function Profile() {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [changePasswordOpen, setChangePasswordOpen] =
        useState(false);

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [passwordError, setPasswordError] =
        useState("");

    const [changingPassword, setChangingPassword] =
        useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleOpenPasswordModal = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
        setChangePasswordOpen(true);
    };

    const handleClosePasswordModal = () => {
        if (changingPassword) {
            return;
        }

        setChangePasswordOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();

        setPasswordError("");

        if (!currentPassword) {
            setPasswordError(
                "Current password is required."
            );
            return;
        }

        if (!newPassword) {
            setPasswordError(
                "New password is required."
            );
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError(
                "New password must be at least 8 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(
                "New passwords do not match."
            );
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError(
                "New password must be different from current password."
            );
            return;
        }

        try {
            setChangingPassword(true);

            await api.put(
                "/auth/change-password",
                {
                    currentPassword,
                    newPassword,
                }
            );

            showToast(
                "Password changed successfully.",
                "success"
            );

            handleClosePasswordModal();
        } catch (err) {
            console.error(
                "Failed to change password:",
                err
            );

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                logout();
                navigate("/login");
                return;
            }

            const responseData =
                err.response?.data;

            if (responseData?.message) {
                setPasswordError(
                    responseData.message
                );
            } else if (typeof responseData === "string") {
                setPasswordError(responseData);
            } else {
                setPasswordError(
                    "Unable to change password. Please try again."
                );
            }
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Contact Management</h1>

                    <p>
                        User Profile
                    </p>
                </div>

                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </header>

            <main className="profile-container">
                <div className="profile-header">
                    <button
                        type="button"
                        className="back-button"
                        onClick={() =>
                            navigate("/contacts")
                        }
                    >
                        ← Back to Contacts
                    </button>
                </div>

                <div className="profile-card">
                    <div className="profile-icon">
                        👤
                    </div>

                    <h2>
                        User Profile
                    </h2>

                    <p className="profile-subtitle">
                        Manage your account information
                        and password.
                    </p>

                    <div className="profile-details">
                        <div className="profile-detail">
                            <span className="profile-label">
                                First Name
                            </span>

                            <span className="profile-value">
                                {user?.firstName || "-"}
                            </span>
                        </div>

                        <div className="profile-detail">
                            <span className="profile-label">
                                Last Name
                            </span>

                            <span className="profile-value">
                                {user?.lastName || "-"}
                            </span>
                        </div>

                        <div className="profile-detail">
                            <span className="profile-label">
                                Email
                            </span>

                            <span className="profile-value">
                                {user?.email || "-"}
                            </span>
                        </div>

                        <div className="profile-detail">
                            <span className="profile-label">
                                Phone
                            </span>

                            <span className="profile-value">
                                {user?.phone || "-"}
                            </span>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button
                            type="button"
                            className="profile-password-button"
                            onClick={
                                handleOpenPasswordModal
                            }
                        >
                            Change Password
                        </button>

                        <button
                            type="button"
                            className="profile-logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </main>

            {changePasswordOpen && (
                <div className="password-modal-overlay">
                    <div className="password-modal">
                        <div className="password-modal-header">
                            <h2>
                                Change Password
                            </h2>

                            <button
                                type="button"
                                className="password-modal-close"
                                onClick={
                                    handleClosePasswordModal
                                }
                                disabled={
                                    changingPassword
                                }
                            >
                                ×
                            </button>
                        </div>

                        <p className="password-modal-description">
                            Enter your current password
                            and choose a new password.
                        </p>

                        {passwordError && (
                            <div className="auth-error">
                                {passwordError}
                            </div>
                        )}

                        <form
                            className="password-form"
                            onSubmit={
                                handleChangePassword
                            }
                        >
                            <div className="auth-form-group">
                                <label htmlFor="currentPassword">
                                    Current Password
                                </label>

                                <input
                                    id="currentPassword"
                                    type="password"
                                    value={
                                        currentPassword
                                    }
                                    onChange={(event) =>
                                        setCurrentPassword(
                                            event.target.value
                                        )
                                    }
                                    disabled={
                                        changingPassword
                                    }
                                    autoComplete="current-password"
                                />
                            </div>

                            <div className="auth-form-group">
                                <label htmlFor="newPassword">
                                    New Password
                                </label>

                                <input
                                    id="newPassword"
                                    type="password"
                                    value={
                                        newPassword
                                    }
                                    onChange={(event) =>
                                        setNewPassword(
                                            event.target.value
                                        )
                                    }
                                    disabled={
                                        changingPassword
                                    }
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="auth-form-group">
                                <label htmlFor="confirmPassword">
                                    Confirm New Password
                                </label>

                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={
                                        confirmPassword
                                    }
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    disabled={
                                        changingPassword
                                    }
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="password-modal-actions">
                                <button
                                    type="button"
                                    className="delete-cancel-button"
                                    onClick={
                                        handleClosePasswordModal
                                    }
                                    disabled={
                                        changingPassword
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="auth-submit-button"
                                    disabled={
                                        changingPassword
                                    }
                                >
                                    {changingPassword
                                        ? "Changing..."
                                        : "Change Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;