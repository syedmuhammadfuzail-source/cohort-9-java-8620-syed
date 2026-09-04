import { render, screen, fireEvent } from "@testing-library/react";
import {
    describe,
    it,
    expect,
    beforeEach,
    afterEach,
    vi,
} from "vitest";
import Toast from "./Toast";

describe("Toast", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it("renders a success toast correctly", () => {
        const onClose = vi.fn();

        render(
            <Toast
                message="Contact added successfully"
                type="success"
                onClose={onClose}
            />
        );

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("Success")).toBeInTheDocument();
        expect(
            screen.getByText("Contact added successfully")
        ).toBeInTheDocument();
        expect(screen.getByText("✓")).toBeInTheDocument();
    });

    it("renders an error toast correctly", () => {
        const onClose = vi.fn();

        render(
            <Toast
                message="Something went wrong"
                type="error"
                onClose={onClose}
            />
        );

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("Error")).toBeInTheDocument();
        expect(
            screen.getByText("Something went wrong")
        ).toBeInTheDocument();
        expect(screen.getByText("!")).toBeInTheDocument();
    });

    it("calls onClose when the close button is clicked", () => {
        const onClose = vi.fn();

        render(
            <Toast
                message="Test message"
                onClose={onClose}
            />
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Close notification",
            })
        );

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("automatically calls onClose after 4 seconds", () => {
        const onClose = vi.fn();

        render(
            <Toast
                message="Test message"
                onClose={onClose}
            />
        );

        expect(onClose).not.toHaveBeenCalled();

        vi.advanceTimersByTime(3999);

        expect(onClose).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("cleans up the timer when the component is unmounted", () => {
        const onClose = vi.fn();

        const { unmount } = render(
            <Toast
                message="Test message"
                onClose={onClose}
            />
        );

        unmount();

        vi.advanceTimersByTime(4000);

        expect(onClose).not.toHaveBeenCalled();
    });
});