import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();

    const [form, setForm] = useState({
        email: "",
        password: "",
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

        try {
            setLoading(true);

            await login(
                form.email.trim(),
                form.password
            );

            showToast(
                "Login successful!",
                "success"
            );

            navigate("/contacts");
        } catch (err) {
            console.error(
                "Login failed:",
                err
            );

            if (err.response?.status === 401) {
                setError(
                    "Invalid email or password."
                );
            } else if (
                err.response?.status === 400
            ) {
                const responseData =
                    err.response?.data;

                if (responseData?.error) {
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
                        "Please check your login details."
                    );
                }
            } else {
                setError(
                    "Unable to login. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon">
                        👤
                    </div>

                    <h1>
                        Contact Management
                    </h1>

                    <p>
                        Sign in to manage your contacts.
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
                    <div className="auth-form-group">
                        <label htmlFor="email">
                            Email Address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            value={form.email}
                            onChange={handleChange}
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-form-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing In..."
                            : "Login"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/register">
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;