import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

function Register() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!form.email.trim()) {
            setError("Email is required.");
            return;
        }

        if (!form.password) {
            setError("Password is required.");
            return;
        }

        if (form.password.length < 8) {
            setError(
                "Password must be at least 8 characters."
            );
            return;
        }

        if (
            form.password !==
            form.confirmPassword
        ) {
            setError("Passwords do not match.");
            return;
        }

        const requestBody = {
            email: form.email.trim(),
            phone: form.phone.trim(),
            password: form.password,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
        };

        try {
            setLoading(true);

            await api.post(
                "/auth/register",
                requestBody
            );

            showToast(
                "Account created successfully. Please login.",
                "success"
            );

            navigate("/login");
        } catch (err) {
            console.error(
                "Registration failed:",
                err
            );

            if (err.response?.status === 409) {
                setError(
                    "An account with this email already exists."
                );
            } else if (
                err.response?.status === 400
            ) {
                const responseData =
                    err.response?.data;

                if (
                    responseData?.error
                ) {
                    setError(
                        responseData.error
                    );
                } else if (
                    responseData?.message
                ) {
                    setError(
                        responseData.message
                    );
                } else {
                    setError(
                        "Please check your registration details."
                    );
                }
            } else {
                setError(
                    "Unable to create your account. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card register-card">
                <div className="auth-header">
                    <div className="auth-icon">
                          👤
                    </div>

                    <h1>
                        Create Account
                    </h1>

                    <p>
                        Create your Contact Management
                        account.
                    </p>
                </div>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <div className="auth-form-row">
                        <div className="auth-form-group">
                            <label htmlFor="firstName">
                                First Name
                            </label>

                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                placeholder="Enter first name"
                                value={
                                    form.firstName
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={loading}
                            />
                        </div>

                        <div className="auth-form-group">
                            <label htmlFor="lastName">
                                Last Name
                            </label>

                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                placeholder="Enter last name"
                                value={
                                    form.lastName
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="auth-form-group">
                        <label htmlFor="email">
                            Email Address *
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            value={form.email}
                            onChange={
                                handleChange
                            }
                            disabled={loading}
                        />
                    </div>

                    <div className="auth-form-group">
                        <label htmlFor="phone">
                            Phone Number
                        </label>

                        <input
                            id="phone"
                            name="phone"
                            type="text"
                            placeholder="03XXXXXXXXX"
                            value={form.phone}
                            onChange={
                                handleChange
                            }
                            disabled={loading}
                        />
                    </div>

                    <div className="auth-form-group">
                        <label htmlFor="password">
                            Password *
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Minimum 8 characters"
                            value={
                                form.password
                            }
                            onChange={
                                handleChange
                            }
                            disabled={loading}
                        />
                    </div>

                    <div className="auth-form-group">
                        <label htmlFor="confirmPassword">
                            Confirm Password *
                        </label>

                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Re-enter your password"
                            value={
                                form.confirmPassword
                            }
                            onChange={
                                handleChange
                            }
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>
                        Already have an account?
                    </span>

                    <Link to="/login">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;