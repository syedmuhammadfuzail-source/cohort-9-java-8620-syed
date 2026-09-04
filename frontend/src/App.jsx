import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Contacts from "./pages/Contacts";
import AddContact from "./pages/AddContact";
import ContactDetails from "./pages/ContactDetails";
import EditContact from "./pages/EditContact";
import Profile from "./pages/Profile";

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {
    return (
        <ToastProvider>
            <Routes>

                {/* Login */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Register */}
                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Contacts */}
                <Route
                    path="/contacts"
                    element={
                        <ProtectedRoute>
                            <Contacts />
                        </ProtectedRoute>
                    }
                />

                {/* Add Contact */}
                <Route
                    path="/contacts/new"
                    element={
                        <ProtectedRoute>
                            <AddContact />
                        </ProtectedRoute>
                    }
                />

                {/* Contact Details */}
                <Route
                    path="/contacts/:id"
                    element={
                        <ProtectedRoute>
                            <ContactDetails />
                        </ProtectedRoute>
                    }
                />

                {/* Edit Contact */}
                <Route
                    path="/contacts/:id/edit"
                    element={
                        <ProtectedRoute>
                            <EditContact />
                        </ProtectedRoute>
                    }
                />

                {/* User Profile */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                {/* Default */}
                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                {/* Unknown route */}
                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>
        </ToastProvider>
    );
}

export default App;