package com.contactmanagement.backend.repository;

import com.contactmanagement.backend.entity.Contact;
import com.contactmanagement.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContactRepository extends JpaRepository<Contact, Long> {

    Page<Contact> findByUser(User user, Pageable pageable);

    Optional<Contact> findByIdAndUser(Long id, User user);

    Page<Contact> findByUserAndFirstNameContainingIgnoreCase(
            User user,
            String firstName,
            Pageable pageable
    );

    Page<Contact> findByUserAndLastNameContainingIgnoreCase(
            User user,
            String lastName,
            Pageable pageable
    );

    Page<Contact> findByUserAndFirstNameContainingIgnoreCaseOrUserAndLastNameContainingIgnoreCase(
            User user1,
            String firstName,
            User user2,
            String lastName,
            Pageable pageable
    );
}