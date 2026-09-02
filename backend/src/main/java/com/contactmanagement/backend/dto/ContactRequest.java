package com.contactmanagement.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

public class ContactRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @Valid
    private List<@NotNull(message = "Email entry must not be null") ContactEmailRequest> emails = new ArrayList<>();

    @Valid
    private List<@NotNull(message = "Phone entry must not be null") ContactPhoneRequest> phones = new ArrayList<>();

    /**
     * Default constructor required by Jackson for JSON deserialization.
     */
    public ContactRequest() {
        // Required by Jackson
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<ContactEmailRequest> getEmails() {
        return emails;
    }

    public void setEmails(List<ContactEmailRequest> emails) {
        this.emails = emails;
    }

    public List<ContactPhoneRequest> getPhones() {
        return phones;
    }

    public void setPhones(List<ContactPhoneRequest> phones) {
        this.phones = phones;
    }
}