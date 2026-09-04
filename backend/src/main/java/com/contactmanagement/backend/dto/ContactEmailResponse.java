package com.contactmanagement.backend.dto;

public class ContactEmailResponse {

    private Long id;
    private String email;
    private String label;

    public ContactEmailResponse() {
    }

    public ContactEmailResponse(Long id, String email, String label) {
        this.id = id;
        this.email = email;
        this.label = label;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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