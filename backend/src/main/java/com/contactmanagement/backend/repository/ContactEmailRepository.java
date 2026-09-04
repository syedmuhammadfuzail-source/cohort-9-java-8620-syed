package com.contactmanagement.backend.repository;

import com.contactmanagement.backend.entity.Contact;
import com.contactmanagement.backend.entity.ContactEmail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactEmailRepository extends JpaRepository<ContactEmail, Long> {

    List<ContactEmail> findByContact(Contact contact);

    List<ContactEmail> findByContactIdIn(List<Long> contactIds);

    void deleteByContact(Contact contact);
}