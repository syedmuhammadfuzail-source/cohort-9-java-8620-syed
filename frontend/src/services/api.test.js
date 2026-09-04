import { describe, it, expect, beforeEach, vi } from "vitest";
import api from "./api";

describe("api service", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("creates the API instance with the correct base URL", () => {
        expect(api.defaults.baseURL).toBe(
            "/api"
        );
    });

    it("sets the JSON content type", () => {
        expect(api.defaults.headers["Content-Type"]).toBe(
            "application/json"
        );
    });

    it("adds the Bearer token when a token exists", async () => {
        localStorage.setItem("token", "test-token");

        const requestHandler = api.interceptors.request.handlers[0].fulfilled;

        const config = {
            headers: {},
        };

        const result = requestHandler(config);

        expect(result.headers.Authorization).toBe(
            "Bearer test-token"
        );
    });

    it("does not add Authorization when no token exists", async () => {
        const requestHandler = api.interceptors.request.handlers[0].fulfilled;

        const config = {
            headers: {},
        };

        const result = requestHandler(config);

        expect(result.headers.Authorization).toBeUndefined();
    });

    it("passes the request config through unchanged when no token exists", () => {
        const requestHandler = api.interceptors.request.handlers[0].fulfilled;

        const config = {
            url: "/contacts",
            method: "get",
            headers: {},
        };

        const result = requestHandler(config);

        expect(result).toBe(config);
    });

    it("rejects when the request interceptor receives an error", async () => {
        const errorHandler = api.interceptors.request.handlers[0].rejected;
        const error = new Error("Request failed");

        await expect(errorHandler(error)).rejects.toBe(error);
    });
});
