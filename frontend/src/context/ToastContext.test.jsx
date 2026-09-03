import { render, screen, fireEvent } from "@testing-library/react";
import {
    describe,
    it,
    expect,
    vi,
    afterEach,
} from "vitest";
import {
    ToastProvider,
    useToast,
} from "./ToastContext";

function TestComponent() {
    const { showToast, hideToast } = useToast();

    return (
        <div>
            <button
                type="button"
                onClick={() => showToast("Success message")}
            >
                Show Success
            </button>

            <button
                type="button"
                onClick={() => showToast("Error message", "error")}
            >
                Show Error
            </button>

            <button
                type="button"
                onClick={hideToast}
            >
                Hide Toast
            </button>
        </div>
    );
}

describe("ToastContext", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("shows a success toast with the default type", () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Show Success",
            })
        );

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("Success")).toBeInTheDocument();
        expect(
            screen.getByText("Success message")
        ).toBeInTheDocument();
    });

    it("shows an error toast when error type is provided", () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Show Error",
            })
        );

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("Error")).toBeInTheDocument();
        expect(
            screen.getByText("Error message")
        ).toBeInTheDocument();
    });

    it("hides the toast when hideToast is called", () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Show Success",
            })
        );

        expect(screen.getByRole("alert")).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Hide Toast",
            })
        );

        expect(
            screen.queryByRole("alert")
        ).not.toBeInTheDocument();
    });

    it("hides the toast when the Toast close button is clicked", () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Show Success",
            })
        );

        expect(screen.getByRole("alert")).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Close notification",
            })
        );

        expect(
            screen.queryByRole("alert")
        ).not.toBeInTheDocument();
    });

    it("throws an error when useToast is used outside ToastProvider", () => {
        function ComponentOutsideProvider() {
            useToast();
            return null;
        }

        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        expect(() =>
            render(<ComponentOutsideProvider />)
        ).toThrow(
            "useToast must be used inside ToastProvider"
        );

        consoleError.mockRestore();
    });
});