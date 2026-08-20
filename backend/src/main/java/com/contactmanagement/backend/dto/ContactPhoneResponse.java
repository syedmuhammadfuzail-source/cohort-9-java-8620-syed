package com.contactmanagement.backend.dto;

public class ContactPhoneResponse {

    private Long id;
    private String phone;
    private String label;

    public ContactPhoneResponse() {
    }

    public ContactPhoneResponse(Long id, String phone, String label) {
        this.id = id;
        this.phone = phone;
        this.label = label;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }
}