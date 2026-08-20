package com.contactmanagement.backend.repository;

import com.contactmanagement.backend.entity.Contact;
import com.contactmanagement.backend.entity.ContactPhone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactPhoneRepository extends JpaRepository<ContactPhone, Long> {

    List<ContactPhone> findByContact(Contact contact);

    void deleteByContact(Contact contact);
}