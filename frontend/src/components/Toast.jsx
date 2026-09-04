import { useEffect } from "react";

function Toast({
    message,
    type = "success",
    onClose,
}) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);

        return () => {
            clearTimeout(timer);
        };
    }, [message, onClose]);

    return (
        <div
            className={`toast toast-${type}`}
            role="alert"
        >
            <div className="toast-icon">
                {type === "success" ? "✓" : "!"}
            </div>

            <div className="toast-content">
                <strong>
                    {type === "success"
                        ? "Success"
                        : "Error"}
                </strong>

                <span>{message}</span>
            </div>

            <button
                type="button"
                className="toast-close"
                onClick={onClose}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
}

export default Toast;
