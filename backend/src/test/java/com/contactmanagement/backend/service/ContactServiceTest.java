package com.contactmanagement.backend.service;

import com.contactmanagement.backend.dto.ContactRequest;
import com.contactmanagement.backend.dto.ContactResponse;
import com.contactmanagement.backend.entity.Contact;
import com.contactmanagement.backend.entity.User;
import com.contactmanagement.backend.repository.ContactEmailRepository;
import com.contactmanagement.backend.repository.ContactPhoneRepository;
import com.contactmanagement.backend.repository.ContactRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private ContactEmailRepository contactEmailRepository;

    @Mock
    private ContactPhoneRepository contactPhoneRepository;

    @InjectMocks
    private ContactService contactService;

    private User user;
    private Contact contact;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");

        contact = new Contact();
        contact.setId(1L);
        contact.setUser(user);
        contact.setFirstName("John");
        contact.setLastName("Doe");
        contact.setTitle("Developer");
    }

    @Test
    void getContact_shouldReturnContact_whenContactExists() {

        when(contactRepository.findByIdAndUser(1L, user))
                .thenReturn(Optional.of(contact));

        when(contactEmailRepository.findByContact(contact))
                .thenReturn(List.of());

        when(contactPhoneRepository.findByContact(contact))
                .thenReturn(List.of());

        ContactResponse response =
                contactService.getContact(1L, user);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("John", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        assertEquals("Developer", response.getTitle());

        verify(contactRepository)
                .findByIdAndUser(1L, user);
    }

    @Test
    void getContact_shouldThrowException_whenContactDoesNotExist() {

        when(contactRepository.findByIdAndUser(1L, user))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> contactService.getContact(1L, user)
                );

        assertEquals(
                "Contact not found",
                exception.getMessage()
        );

        verify(contactRepository)
                .findByIdAndUser(1L, user);
    }

    @Test
    void getContacts_shouldReturnContacts_whenContactsExist() {

        Pageable pageable = PageRequest.of(0, 10);

        Page<Contact> page =
                new PageImpl<>(
                        List.of(contact),
                        pageable,
                        1
                );

        when(contactRepository.findByUser(user, pageable))
                .thenReturn(page);

        when(contactEmailRepository.findByContactIdIn(List.of(1L)))
                .thenReturn(List.of());

        when(contactPhoneRepository.findByContactIdIn(List.of(1L)))
                .thenReturn(List.of());

        Page<ContactResponse> response =
                contactService.getContacts(
                        user,
                        null,
                        pageable
                );

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals(
                "John",
                response.getContent().get(0).getFirstName()
        );

        verify(contactRepository)
                .findByUser(user, pageable);
    }

    @Test
    void getContacts_shouldReturnEmptyPage_whenNoContactsExist() {

        Pageable pageable = PageRequest.of(0, 10);

        Page<Contact> emptyPage =
                new PageImpl<>(
                        List.of(),
                        pageable,
                        0
                );

        when(contactRepository.findByUser(user, pageable))
                .thenReturn(emptyPage);

        Page<ContactResponse> response =
                contactService.getContacts(
                        user,
                        null,
                        pageable
                );

        assertNotNull(response);
        assertEquals(0, response.getTotalElements());
        assertTrue(response.getContent().isEmpty());

        verify(contactRepository)
                .findByUser(user, pageable);
    }

    @Test
    void deleteContact_shouldDeleteContact_whenContactExists() {

        when(contactRepository.findByIdAndUser(1L, user))
                .thenReturn(Optional.of(contact));

        contactService.deleteContact(1L, user);

        verify(contactEmailRepository)
                .deleteByContact(contact);

        verify(contactPhoneRepository)
                .deleteByContact(contact);

        verify(contactRepository)
                .delete(contact);
    }

    @Test
    void deleteContact_shouldThrowException_whenContactDoesNotExist() {

        when(contactRepository.findByIdAndUser(1L, user))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> contactService.deleteContact(1L, user)
                );

        assertEquals(
                "Contact not found",
                exception.getMessage()
        );

        verify(contactRepository, never())
                .delete(any(Contact.class));
    }
}