import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

function Contacts() {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);

    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] =
        useState(false);

    const [contactToDelete, setContactToDelete] =
        useState(null);

    const [deleting, setDeleting] = useState(false);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
                size: pageSize,
            };

            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await api.get("/contacts", {
                params,
            });

            const data = response.data;

            setContacts(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            console.error(
                "Failed to fetch contacts:",
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

            setError(
                "Unable to load contacts. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [page, search]);

    const handleSearch = (event) => {
        event.preventDefault();

        setPage(0);
        setSearch(searchInput);
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setSearch("");
        setPage(0);
    };

    const handlePreviousPage = () => {
        if (page > 0) {
            setPage(
                (previousPage) =>
                    previousPage - 1
            );
        }
    };

    const handleNextPage = () => {
        if (page < totalPages - 1) {
            setPage(
                (previousPage) =>
                    previousPage + 1
            );
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleProfile = () => {
        navigate("/profile");
    };

    /*
     * Open custom delete confirmation modal.
     */
    const handleDeleteClick = (contact) => {
        setContactToDelete(contact);
        setDeleteModalOpen(true);
    };

    /*
     * Close delete confirmation modal.
     */
    const handleCloseDeleteModal = () => {
        if (deleting) {
            return;
        }

        setDeleteModalOpen(false);
        setContactToDelete(null);
    };

    /*
     * Delete the selected contact.
     */
    const handleConfirmDelete = async () => {
        if (!contactToDelete) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            await api.delete(
                `/contacts/${contactToDelete.id}`
            );

            setDeleteModalOpen(false);
            setContactToDelete(null);

            showToast(
                "Contact deleted successfully.",
                "success"
            );

            /*
             * If this was the last contact on the current
             * page, move to the previous page.
             */
            if (contacts.length === 1 && page > 0) {
                setPage(
                    (previousPage) =>
                        previousPage - 1
                );
            } else {
                await fetchContacts();
            }
        } catch (err) {
            console.error(
                "Failed to delete contact:",
                err
            );

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                setDeleteModalOpen(false);
                setContactToDelete(null);
                logout();
                navigate("/login");
                return;
            }

            showToast(
                "Unable to delete contact. Please try again.",
                "error"
            );
        } finally {
            setDeleting(false);
        }
    };

    const getPrimaryEmail = (contact) => {
        if (
            !contact.emails ||
            contact.emails.length === 0
        ) {
            return "-";
        }

        return contact.emails[0].email;
    };

    const getPrimaryPhone = (contact) => {
        if (
            !contact.phones ||
            contact.phones.length === 0
        ) {
            return "-";
        }

        return contact.phones[0].phone;
    };

    const getFullName = (contact) => {
        return `${contact.firstName || ""} ${
            contact.lastName || ""
        }`.trim();
    };

    const currentPageDisplay =
        totalPages === 0 ? 0 : page + 1;

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Contact Management</h1>

                    <p>
                        Welcome,{" "}
                        <strong>
                            {user?.firstName ||
                                user?.email ||
                                "User"}
                        </strong>
                    </p>
                </div>

                <div className="dashboard-header-actions">
                    <button
                        type="button"
                        className="profile-button"
                        onClick={handleProfile}
                    >
                        Profile
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="logout-button"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="contacts-container">
                <div className="contacts-header">
                    <div>
                        <h2>My Contacts</h2>

                        <p>
                            {totalElements} contact
                            {totalElements !== 1
                                ? "s"
                                : ""}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="add-contact-button"
                        onClick={() =>
                            navigate("/contacts/new")
                        }
                    >
                        + Add Contact
                    </button>
                </div>

                <form
                    className="search-container"
                    onSubmit={handleSearch}
                >
                    <input
                        type="search"
                        placeholder="Search by name or title..."
                        value={searchInput}
                        onChange={(event) =>
                            setSearchInput(
                                event.target.value
                            )
                        }
                    />

                    <button
                        type="submit"
                        className="search-button"
                    >
                        Search
                    </button>

                    {search && (
                        <button
                            type="button"
                            className="clear-search-button"
                            onClick={handleClearSearch}
                        >
                            Clear
                        </button>
                    )}
                </form>

                {search && (
                    <div className="search-result-message">
                        Showing results for:{" "}
                        <strong>{search}</strong>
                    </div>
                )}

                {loading && (
                    <div className="status-message">
                        Loading contacts...
                    </div>
                )}

                {!loading && error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    contacts.length === 0 && (
                        <div className="empty-message">
                            <h3>
                                {search
                                    ? "No contacts found"
                                    : "No contacts yet"}
                            </h3>

                            <p>
                                {search
                                    ? `No contacts matched "${search}".`
                                    : "You haven't added any contacts yet."}
                            </p>

                            {search ? (
                                <button
                                    type="button"
                                    className="clear-search-button"
                                    onClick={
                                        handleClearSearch
                                    }
                                >
                                    Clear Search
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="add-contact-button"
                                    onClick={() =>
                                        navigate(
                                            "/contacts/new"
                                        )
                                    }
                                >
                                    + Add Your First Contact
                                </button>
                            )}
                        </div>
                    )}

                {!loading &&
                    !error &&
                    contacts.length > 0 && (
                        <>
                            <div className="contacts-table-wrapper">
                                <table className="contacts-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Title</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {contacts.map(
                                            (contact) => (
                                                <tr
                                                    key={
                                                        contact.id
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {getFullName(
                                                                contact
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {contact.title ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        {getPrimaryEmail(
                                                            contact
                                                        )}
                                                    </td>

                                                    <td>
                                                        {getPrimaryPhone(
                                                            contact
                                                        )}
                                                    </td>

                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="action-button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/contacts/${contact.id}`
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="action-button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/contacts/${contact.id}/edit`
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="action-button delete-button"
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    contact
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="pagination">
                                <button
                                    type="button"
                                    className="pagination-button"
                                    onClick={
                                        handlePreviousPage
                                    }
                                    disabled={
                                        page === 0 ||
                                        loading
                                    }
                                >
                                    Previous
                                </button>

                                <span>
                                    Page{" "}
                                    <strong>
                                        {
                                            currentPageDisplay
                                        }
                                    </strong>{" "}
                                    of{" "}
                                    <strong>
                                        {totalPages}
                                    </strong>
                                </span>

                                <button
                                    type="button"
                                    className="pagination-button"
                                    onClick={
                                        handleNextPage
                                    }
                                    disabled={
                                        page >=
                                            totalPages - 1 ||
                                        loading
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
            </main>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen &&
                contactToDelete && (
                    <div
                        className="delete-modal-overlay"
                        onClick={
                            handleCloseDeleteModal
                        }
                    >
                        <div
                            className="delete-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <div className="delete-modal-icon">
                                !
                            </div>

                            <h2>
                                Delete Contact?
                            </h2>

                            <p>
                                Are you sure you want to
                                delete{" "}
                                <strong>
                                    {getFullName(
                                        contactToDelete
                                    )}
                                </strong>
                                ?
                            </p>

                            <p className="delete-modal-warning">
                                This action cannot be
                                undone.
                            </p>

                            <div className="delete-modal-actions">
                                <button
                                    type="button"
                                    className="delete-cancel-button"
                                    onClick={
                                        handleCloseDeleteModal
                                    }
                                    disabled={
                                        deleting
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="delete-confirm-button"
                                    onClick={
                                        handleConfirmDelete
                                    }
                                    disabled={
                                        deleting
                                    }
                                >
                                    {deleting
                                        ? "Deleting..."
                                        : "Delete Contact"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Contacts;

