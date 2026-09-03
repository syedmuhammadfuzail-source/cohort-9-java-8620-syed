
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const createEmailEntry = () => ({
    id: crypto.randomUUID(),
    email: "",
    label: "Personal",
});

const createPhoneEntry = () => ({
    id: crypto.randomUUID(),
    phone: "",
    label: "Mobile",
});

const AddContact = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        title: "",
        emails: [createEmailEntry()],
        phones: [createPhoneEntry()],
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEmailChange = (index, field, value) => {
        setForm((prev) => {
            const emails = [...prev.emails];

            emails[index] = {
                ...emails[index],
                [field]: value,
            };

            return {
                ...prev,
                emails,
            };
        });
    };

    const handlePhoneChange = (index, field, value) => {
        setForm((prev) => {
            const phones = [...prev.phones];

            phones[index] = {
                ...phones[index],
                [field]: value,
            };

            return {
                ...prev,
                phones,
            };
        });
    };

    const addEmail = () => {
        setForm((prev) => ({
            ...prev,
            emails: [
                ...prev.emails,
                createEmailEntry(),
            ],
        }));
    };

    const removeEmail = (index) => {
        setForm((prev) => ({
            ...prev,
            emails: prev.emails.filter((_, i) => i !== index),
        }));
    };

    const addPhone = () => {
        setForm((prev) => ({
            ...prev,
            phones: [
                ...prev.phones,
                createPhoneEntry(),
            ],
        }));
    };

    const removePhone = (index) => {
        setForm((prev) => ({
            ...prev,
            phones: prev.phones.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const payload = {
                ...form,
                emails: form.emails.map(
                    ({ id, ...email }) => email
                ),
                phones: form.phones.map(
                    ({ id, ...phone }) => phone
                ),
            };

            await axios.post(
                "http://localhost:8080/api/contacts",
                payload
            );

            navigate("/contacts");
        } catch (error) {
            console.error(
                "Error creating contact:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-contact-container">
            <div className="add-contact-header">
                <h1>Add Contact</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="edit-input-wrapper">
                    <label htmlFor="firstName">
                        First Name
                    </label>

                    <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={form.firstName}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <div className="edit-input-wrapper">
                    <label htmlFor="lastName">
                        Last Name
                    </label>

                    <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={form.lastName}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <div className="edit-input-wrapper">
                    <label htmlFor="title">
                        Title
                    </label>

                    <input
                        id="title"
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={form.title}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <div className="section-header">
                    <h2>Email Addresses</h2>
                </div>

                {form.emails.map((item, index) => (
                    <div
                        className="email-row"
                        key={item.id}
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
                                value={item.email}
                                onChange={(e) =>
                                    handleEmailChange(
                                        index,
                                        "email",
                                        e.target.value
                                    )
                                }
                                disabled={loading}
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
                                value={item.label}
                                onChange={(e) =>
                                    handleEmailChange(
                                        index,
                                        "label",
                                        e.target.value
                                    )
                                }
                                disabled={loading}
                            >
                                <option value="Personal">
                                    Personal
                                </option>
                                <option value="Work">
                                    Work
                                </option>
                                <option value="Other">
                                    Other
                                </option>
                            </select>
                        </div>

                        {form.emails.length > 1 && (
                            <button
                                type="button"
                                onClick={() =>
                                    removeEmail(index)
                                }
                                disabled={loading}
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addEmail}
                    disabled={loading}
                >
                    Add Email
                </button>

                <div className="section-header">
                    <h2>Phone Numbers</h2>
                </div>

                {form.phones.map((item, index) => (
                    <div
                        className="phone-row"
                        key={item.id}
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
                                placeholder="Phone Number"
                                value={item.phone}
                                onChange={(e) =>
                                    handlePhoneChange(
                                        index,
                                        "phone",
                                        e.target.value
                                    )
                                }
                                disabled={loading}
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
                                value={item.label}
                                onChange={(e) =>
                                    handlePhoneChange(
                                        index,
                                        "label",
                                        e.target.value
                                    )
                                }
                                disabled={loading}
                            >
                                <option value="Mobile">
                                    Mobile
                                </option>
                                <option value="Home">
                                    Home
                                </option>
                                <option value="Work">
                                    Work
                                </option>
                                <option value="Other">
                                    Other
                                </option>
                            </select>
                        </div>

                        {form.phones.length > 1 && (
                            <button
                                type="button"
                                onClick={() =>
                                    removePhone(index)
                                }
                                disabled={loading}
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addPhone}
                    disabled={loading}
                >
                    Add Phone
                </button>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/contacts")
                        }
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : "Save Contact"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddContact;
