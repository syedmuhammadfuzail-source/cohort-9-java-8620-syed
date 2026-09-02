import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

function AddContact() {
const navigate = useNavigate();
const { showToast } = useToast();


const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    title: "",
    emails: [
        {
            email: "",
            label: "work",
        },
    ],
    phones: [
        {
            phone: "",
            label: "mobile",
        },
    ],
});

const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleBasicChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
        ...previous,
        [name]: value,
    }));
};

const handleEmailChange = (index, field, value) => {
    setForm((previous) => ({
        ...previous,
        emails: previous.emails.map((email, emailIndex) =>
            emailIndex === index
                ? {
                      ...email,
                      [field]: value,
                  }
                : email
        ),
    }));
};

const handlePhoneChange = (index, field, value) => {
    setForm((previous) => ({
        ...previous,
        phones: previous.phones.map((phone, phoneIndex) =>
            phoneIndex === index
                ? {
                      ...phone,
                      [field]: value,
                  }
                : phone
        ),
    }));
};

const addEmail = () => {
    setForm((previous) => ({
        ...previous,
        emails: [
            ...previous.emails,
            {
                email: "",
                label: "personal",
            },
        ],
    }));
};

const removeEmail = (index) => {
    setForm((previous) => ({
        ...previous,
        emails: previous.emails.filter(
            (_, emailIndex) => emailIndex !== index
        ),
    }));
};

const addPhone = () => {
    setForm((previous) => ({
        ...previous,
        phones: [
            ...previous.phones,
            {
                phone: "",
                label: "mobile",
            },
        ],
    }));
};

const removePhone = (index) => {
    setForm((previous) => ({
        ...previous,
        phones: previous.phones.filter(
            (_, phoneIndex) => phoneIndex !== index
        ),
    }));
};

const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.firstName.trim()) {
        setError("First name is required.");
        return;
    }

    const validEmails = form.emails.filter(
        (item) => item.email.trim()
    );

    const validPhones = form.phones.filter(
        (item) => item.phone.trim()
    );

    if (validEmails.length === 0) {
        setError("At least one email is required.");
        return;
    }

    if (validPhones.length === 0) {
        setError("At least one phone number is required.");
        return;
    }

    const requestBody = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        title: form.title.trim(),

        emails: validEmails.map((item) => ({
            email: item.email.trim(),
            label: item.label,
        })),

        phones: validPhones.map((item) => ({
            phone: item.phone.trim(),
            label: item.label,
        })),
    };

    try {
        setLoading(true);

        await api.post("/contacts", requestBody);

        showToast(
            "Contact added successfully.",
            "success"
        );

        navigate("/contacts");
    } catch (err) {
        console.error("Failed to create contact:", err);

        if (
            err.response?.status === 401 ||
            err.response?.status === 403
        ) {
            setError(
                "Your session has expired. Please login again."
            );
            return;
        }

        if (err.response?.data?.error) {
            setError(err.response.data.error);
        } else {
            setError(
                "Unable to create contact. Please try again."
            );
        }
    } finally {
        setLoading(false);
    }
};

return (
    <div className="dashboard">
        <header className="dashboard-header">
            <div>
                <h1>Contact Management</h1>
                <p>Add Contact</p>
            </div>

            <button
                type="button"
                className="edit-back-button"
                onClick={() => navigate("/contacts")}
                disabled={loading}
            >
                Back to Contacts
            </button>
        </header>

        <main className="edit-contact-container">
            <div className="edit-contact-card">
                <div className="edit-card-header">
                    <div className="edit-profile-info">
                        <div className="edit-avatar">
                            +
                        </div>

                        <div>
                            <h2>Add New Contact</h2>

                            <p>
                                Create a new contact and add
                                their communication details.
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="edit-error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <section className="edit-section">
                        <div className="edit-section-heading">
                            <div className="edit-section-icon">
                                1
                            </div>

                            <div>
                                <h3>Basic Information</h3>

                                <p>
                                    Enter the contact's
                                    personal information.
                                </p>
                            </div>
                        </div>

                        <div className="edit-form-grid">
                            <div className="edit-form-group">
                                <label htmlFor="firstName">
                                    First Name *
                                </label>

                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    placeholder="Enter first name"
                                    value={form.firstName}
                                    onChange={
                                        handleBasicChange
                                    }
                                    disabled={loading}
                                />
                            </div>

                            <div className="edit-form-group">
                                <label htmlFor="lastName">
                                    Last Name
                                </label>

                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    placeholder="Enter last name"
                                    value={form.lastName}
                                    onChange={
                                        handleBasicChange
                                    }
                                    disabled={loading}
                                />
                            </div>

                            <div className="edit-form-group edit-full-width">
                                <label htmlFor="title">
                                    Job Title
                                </label>

                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    placeholder="e.g. Software Engineer"
                                    value={form.title}
                                    onChange={
                                        handleBasicChange
                                    }
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="edit-section">
                        <div className="edit-section-top">
                            <div className="edit-section-heading">
                                <div className="edit-section-icon">
                                    @
                                </div>

                                <div>
                                    <h3>Email Addresses</h3>

                                    <p>
                                        Add one or more email
                                        addresses.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="edit-add-button"
                                onClick={addEmail}
                                disabled={loading}
                            >
                                + Add Email
                            </button>
                        </div>

                        <div className="edit-dynamic-list">
                            {form.emails.map(
                                (item, index) => (
                                    <div
                                        className="edit-dynamic-row"
                                        key={index}
                                    >
                                        <div className="edit-input-wrapper">
                                            <label>
                                                Email Address
                                            </label>

                                            <input
                                                type="email"
                                                placeholder="name@example.com"
                                                value={
                                                    item.email
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    handleEmailChange(
                                                        index,
                                                        "email",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                disabled={
                                                    loading
                                                }
                                            />
                                        </div>

                                        <div className="edit-label-wrapper">
                                            <label>
                                                Label
                                            </label>

                                            <select
                                                value={
                                                    item.label
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    handleEmailChange(
                                                        index,
                                                        "label",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                disabled={
                                                    loading
                                                }
                                            >
                                                <option value="work">
                                                    Work
                                                </option>

                                                <option value="personal">
                                                    Personal
                                                </option>

                                                <option value="other">
                                                    Other
                                                </option>
                                            </select>
                                        </div>

                                        {form.emails.length >
                                            1 && (
                                            <button
                                                type="button"
                                                className="edit-remove-button"
                                                onClick={() =>
                                                    removeEmail(
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    loading
                                                }
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </section>

                    <section className="edit-section">
                        <div className="edit-section-top">
                            <div className="edit-section-heading">
                                <div className="edit-section-icon">
                                    #
                                </div>

                                <div>
                                    <h3>Phone Numbers</h3>

                                    <p>
                                        Add one or more phone
                                        numbers.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="edit-add-button"
                                onClick={addPhone}
                                disabled={loading}
                            >
                                + Add Phone
                            </button>
                        </div>

                        <div className="edit-dynamic-list">
                            {form.phones.map(
                                (item, index) => (
                                    <div
                                        className="edit-dynamic-row"
                                        key={index}
                                    >
                                        <div className="edit-input-wrapper">
                                            <label>
                                                Phone Number
                                            </label>

                                            <input
                                                type="text"
                                                placeholder="03XXXXXXXXX"
                                                value={
                                                    item.phone
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    handlePhoneChange(
                                                        index,
                                                        "phone",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                disabled={
                                                    loading
                                                }
                                            />
                                        </div>

                                        <div className="edit-label-wrapper">
                                            <label>
                                                Label
                                            </label>

                                            <select
                                                value={
                                                    item.label
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    handlePhoneChange(
                                                        index,
                                                        "label",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                disabled={
                                                    loading
                                                }
                                            >
                                                <option value="mobile">
                                                    Mobile
                                                </option>

                                                <option value="home">
                                                    Home
                                                </option>

                                                <option value="work">
                                                    Work
                                                </option>

                                                <option value="other">
                                                    Other
                                                </option>
                                            </select>
                                        </div>

                                        {form.phones.length >
                                            1 && (
                                            <button
                                                type="button"
                                                className="edit-remove-button"
                                                onClick={() =>
                                                    removePhone(
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    loading
                                                }
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </section>

                    <div className="edit-form-actions">
                        <button
                            type="button"
                            className="edit-secondary-button"
                            onClick={() =>
                                navigate("/contacts")
                            }
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="edit-save-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Contact..."
                                : "Create Contact"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    </div>
);


}

export default AddContact;
