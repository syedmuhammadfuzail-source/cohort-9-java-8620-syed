import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function ContactDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [contact, setContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchContact = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(`/contacts/${id}`);

                setContact(response.data);
            } catch (err) {
                console.error("Failed to fetch contact:", err);

                if (err.response?.status === 404) {
                    setError("Contact not found.");
                } else if (
                    err.response?.status === 401 ||
                    err.response?.status === 403
                ) {
                    setError(
                        "You are not authorized to view this contact."
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

    const handleEdit = () => {
        navigate(`/contacts/${contact.id}/edit`);
    };

    const handleBack = () => {
        navigate("/contacts");
    };

    if (loading) {
        return (
            <div className="dashboard">
                <header className="dashboard-header">
                    <div>
                        <h1>Contact Management</h1>
                        <p>Contact Details</p>
                    </div>
                </header>

                <main className="details-container">
                    <div className="status-message">
                        Loading contact...
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <header className="dashboard-header">
                    <div>
                        <h1>Contact Management</h1>
                        <p>Contact Details</p>
                    </div>

                    <button
                        type="button"
                        className="back-to-contacts-button"
                        onClick={handleBack}
                    >
                        Back to Contacts
                    </button>
                </header>

                <main className="details-container">
                    <div className="error-message">
                        {error}
                    </div>

                    <button
                        type="button"
                        className="details-secondary-button"
                        onClick={handleBack}
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
                    <p>Contact Details</p>
                </div>

                <button
                    type="button"
                    className="back-to-contacts-button"
                    onClick={handleBack}
                >
                    Back to Contacts
                </button>
            </header>

            <main className="details-container">
                <div className="contact-details-card">

                    {/* Contact Header */}
                    <div className="details-profile-header">
                        <div className="details-profile-info">
                            <div className="contact-avatar">
                                {contact.firstName
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <h2>
                                    {contact.firstName}{" "}
                                    {contact.lastName || ""}
                                </h2>

                                <p>
                                    {contact.title ||
                                        "No title provided"}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="details-primary-button"
                            onClick={handleEdit}
                        >
                            Edit Contact
                        </button>
                    </div>

                    {/* Email Section */}
                    <section className="details-section">
                        <div className="details-section-heading">
                            <div className="details-section-icon">
                                @
                            </div>

                            <div>
                                <h3>Email Addresses</h3>
                                <p>
                                    Contact email addresses
                                </p>
                            </div>
                        </div>

                        {contact.emails &&
                        contact.emails.length > 0 ? (
                            <div className="details-list">
                                {contact.emails.map((email) => (
                                    <div
                                        className="detail-item"
                                        key={email.id}
                                    >
                                        <span className="detail-label">
                                            {email.label ||
                                                "Email"}
                                        </span>

                                        <a
                                            className="detail-value"
                                            href={`mailto:${email.email}`}
                                        >
                                            {email.email}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="muted-text">
                                No email addresses.
                            </p>
                        )}
                    </section>

                    {/* Phone Section */}
                    <section className="details-section">
                        <div className="details-section-heading">
                            <div className="details-section-icon">
                                #
                            </div>

                            <div>
                                <h3>Phone Numbers</h3>
                                <p>
                                    Contact phone numbers
                                </p>
                            </div>
                        </div>

                        {contact.phones &&
                        contact.phones.length > 0 ? (
                            <div className="details-list">
                                {contact.phones.map((phone) => (
                                    <div
                                        className="detail-item"
                                        key={phone.id}
                                    >
                                        <span className="detail-label">
                                            {phone.label ||
                                                "Phone"}
                                        </span>

                                        <a
                                            className="detail-value"
                                            href={`tel:${phone.phone}`}
                                        >
                                            {phone.phone}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="muted-text">
                                No phone numbers.
                            </p>
                        )}
                    </section>

                    {/* Information Section */}
                    <section className="details-section metadata-section">
                        <div className="details-section-heading">
                            <div className="details-section-icon">
                                i
                            </div>

                            <div>
                                <h3>Information</h3>
                                <p>
                                    Contact record information
                                </p>
                            </div>
                        </div>

                        <div className="metadata-grid">
                            <div className="metadata-item">
                                <span className="metadata-label">
                                    Contact ID
                                </span>

                                <strong>
                                    #{contact.id}
                                </strong>
                            </div>

                            <div className="metadata-item">
                                <span className="metadata-label">
                                    Created
                                </span>

                                <strong>
                                    {new Date(
                                        contact.createdAt
                                    ).toLocaleString()}
                                </strong>
                            </div>

                            <div className="metadata-item">
                                <span className="metadata-label">
                                    Last Updated
                                </span>

                                <strong>
                                    {new Date(
                                        contact.updatedAt
                                    ).toLocaleString()}
                                </strong>
                            </div>
                        </div>
                    </section>

                    {/* Bottom Actions */}
                    <div className="details-actions">
                        <button
                            type="button"
                            className="details-secondary-button"
                            onClick={handleBack}
                        >
                            Back to Contacts
                        </button>

                        <button
                            type="button"
                            className="details-primary-button"
                            onClick={handleEdit}
                        >
                            Edit Contact
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ContactDetails;