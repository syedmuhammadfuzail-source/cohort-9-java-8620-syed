package com.contactmanagement.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ContactEmailRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @NotBlank(message = "Email label is required")
    @Size(max = 50, message = "Email label must not exceed 50 characters")
    private String label;

    /**
     * Default constructor required by Jackson for JSON deserialization.
     */
    public ContactEmailRequest() {
        // Required by Jackson
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }
}