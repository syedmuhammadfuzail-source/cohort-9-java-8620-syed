import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

function EditContact() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        title: "",
        emails: [],
        phones: [],
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchContact = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/contacts/${id}`
                );

                const contact = response.data;

                setForm({
                    firstName: contact.firstName || "",
                    lastName: contact.lastName || "",
                    title: contact.title || "",

                    emails:
                        contact.emails?.map((item) => ({
                            id: item.id,
                            email: item.email || "",
                            label: item.label || "work",
                        })) || [],

                    phones:
                        contact.phones?.map((item) => ({
                            id: item.id,
                            phone: item.phone || "",
                            label: item.label || "mobile",
                        })) || [],
                });
            } catch (err) {
                console.error(
                    "Failed to fetch contact:",
                    err
                );

                if (err.response?.status === 404) {
                    setError("Contact not found.");
                } else if (
                    err.response?.status === 401 ||
                    err.response?.status === 403
                ) {
                    setError(
                        "You are not authorized to edit this contact."
                    );
                } else {
                    setError(
                        "Unable to load contact. Please try again."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchContact();
    }, [id]);

    const handleBasicChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleEmailChange = (
        index,
        field,
        value
    ) => {
        setForm((previous) => ({
            ...previous,

            emails: previous.emails.map(
                (item, itemIndex) =>
                    itemIndex === index
                        ? {
                              ...item,
                              [field]: value,
                          }
                        : item
            ),
        }));
    };

    const handlePhoneChange = (
        index,
        field,
        value
    ) => {
        setForm((previous) => ({
            ...previous,

            phones: previous.phones.map(
                (item, itemIndex) =>
                    itemIndex === index
                        ? {
                              ...item,
                              [field]: value,
                          }
                        : item
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
                    label: "work",
                },
            ],
        }));
    };

    const removeEmail = (index) => {
        setForm((previous) => ({
            ...previous,

            emails: previous.emails.filter(
                (_, itemIndex) =>
                    itemIndex !== index
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
                (_, itemIndex) =>
                    itemIndex !== index
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
            setError(
                "At least one phone number is required."
            );
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
            setSaving(true);

            await api.put(
                `/contacts/${id}`,
                requestBody
            );

            showToast(
                "Contact updated successfully.",
                "success"
            );

            navigate(`/contacts/${id}`);
        } catch (err) {
            console.error(
                "Failed to update contact:",
                err
            );

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                setError(
                    "Your session has expired or you are not authorized."
                );
                return;
            }

            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError(
                    "Unable to update contact. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard">
                <header className="dashboard-header">
                    <div>
                        <h1>Contact Management</h1>
                        <p>Edit Contact</p>
                    </div>
                </header>

                <main className="edit-contact-container">
                    <div className="status-message">
                        Loading contact...
                    </div>
                </main>
            </div>
        );
    }

    if (error && !form.firstName) {
        return (
            <div className="dashboard">
                <header className="dashboard-header">
                    <div>
                        <h1>Contact Management</h1>
                        <p>Edit Contact</p>
                    </div>

                    <button
                        type="button"
                        className="edit-back-button"
                        onClick={() =>
                            navigate(
                                `/contacts/${id}`
                            )
                        }
                    >
                        Back to Contact
                    </button>
                </header>

                <main className="edit-contact-container">
                    <div className="error-message">
                        {error}
                    </div>

                    <button
                        type="button"
                        className="edit-secondary-button"
                        onClick={() =>
                            navigate("/contacts")
                        }
                    >
                        Back to Contacts
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Contact Management</h1>
                    <p>Edit Contact</p>
                </div>

                <button
                    type="button"
                    className="edit-back-button"
                    onClick={() =>
                        navigate(
                            `/contacts/${id}`
                        )
                    }
                    disabled={saving}
                >
                    Back to Contact
                </button>
            </header>

            <main className="edit-contact-container">
                <div className="edit-contact-card">
                    <div className="edit-card-header">
                        <div className="edit-profile-info">
                            <div className="edit-avatar">
                                {form.firstName
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <h2>Edit Contact</h2>

                                <p>
                                    Update contact
                                    information and
                                    communication
                                    details.
                                </p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="edit-error-message">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                    >
                        <section className="edit-section">
                            <div className="edit-section-heading">
                                <div className="edit-section-icon">
                                    1
                                </div>

                                <div>
                                    <h3>
                                        Basic Information
                                    </h3>

                                    <p>
                                        Update the
                                        contact's
                                        personal
                                        information.
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
                                        value={
                                            form.firstName
                                        }
                                        onChange={
                                            handleBasicChange
                                        }
                                        disabled={
                                            saving
                                        }
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
                                        value={
                                            form.lastName
                                        }
                                        onChange={
                                            handleBasicChange
                                        }
                                        disabled={
                                            saving
                                        }
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
                                        value={
                                            form.title
                                        }
                                        onChange={
                                            handleBasicChange
                                        }
                                        disabled={
                                            saving
                                        }
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
                                        <h3>
                                            Email Addresses
                                        </h3>

                                        <p>
                                            Manage email
                                            addresses
                                            for this
                                            contact.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="edit-add-button"
                                    onClick={
                                        addEmail
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    + Add Email
                                </button>
                            </div>

                            <div className="edit-dynamic-list">
                                {form.emails.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <div
                                            className="edit-dynamic-row"
                                            key={
                                                item.id ||
                                                `email-${index}`
                                            }
                                        >
                                            <div className="edit-input-wrapper">
                                                <label
                                                    htmlFor={`email-${index}`}
                                                >
                                                    Email Address
                                                </label>

                                                <input
                                                    id={`email-${index}`}
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
                                                        saving
                                                    }
                                                />
                                            </div>

                                            <div className="edit-label-wrapper">
                                                <label
                                                    htmlFor={`email-label-${index}`}
                                                >
                                                    Label
                                                </label>

                                                <select
                                                    id={`email-label-${index}`}
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
                                                        saving
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

                                            <button
                                                type="button"
                                                className="edit-remove-button"
                                                onClick={() =>
                                                    removeEmail(
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >
                                                Remove
                                            </button>
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
                                        <h3>
                                            Phone Numbers
                                        </h3>

                                        <p>
                                            Manage phone
                                            numbers
                                            for this
                                            contact.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="edit-add-button"
                                    onClick={
                                        addPhone
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    + Add Phone
                                </button>
                            </div>

                            <div className="edit-dynamic-list">
                                {form.phones.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <div
                                            className="edit-dynamic-row"
                                            key={
                                                item.id ||
                                                `phone-${index}`
                                            }
                                        >
                                            <div className="edit-input-wrapper">
                                                <label
                                                    htmlFor={`phone-${index}`}
                                                >
                                                    Phone Number
                                                </label>

                                                <input
                                                    id={`phone-${index}`}
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
                                                        saving
                                                    }
                                                />
                                            </div>

                                            <div className="edit-label-wrapper">
                                                <label
                                                    htmlFor={`phone-label-${index}`}
                                                >
                                                    Label
                                                </label>

                                                <select
                                                    id={`phone-label-${index}`}
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
                                                        saving
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

                                            <button
                                                type="button"
                                                className="edit-remove-button"
                                                onClick={() =>
                                                    removePhone(
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >
                                                Remove
                                            </button>
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
                                    navigate(
                                        `/contacts/${id}`
                                    )
                                }
                                disabled={
                                    saving
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="edit-save-button"
                                disabled={
                                    saving
                                }
                            >
                                {saving
                                    ? "Saving Changes..."
                                    : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default EditContact;