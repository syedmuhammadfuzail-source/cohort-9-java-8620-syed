package com.contactmanagement.backend.controller;

import com.contactmanagement.backend.dto.ContactRequest;
import com.contactmanagement.backend.dto.ContactResponse;
import com.contactmanagement.backend.entity.User;
import com.contactmanagement.backend.service.ContactService;
import com.contactmanagement.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactControllerTest {

    @Mock
    private ContactService contactService;

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ContactController contactController;

    private User user;
    private ContactResponse contactResponse;

    @BeforeEach
    void setUp() {

        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");

        contactResponse = new ContactResponse(
                1L,
                "John",
                "Doe",
                "Developer",
                List.of(),
                List.of()
        );

        when(authentication.getName())
                .thenReturn("test@example.com");

        when(userService.findByIdentifier("test@example.com"))
                .thenReturn(Optional.of(user));
    }

    @Test
    void getContacts_shouldReturnContacts() {

        PageRequest pageable = PageRequest.of(0, 10);

        Page<ContactResponse> page =
                new PageImpl<>(
                        List.of(contactResponse),
                        pageable,
                        1
                );

        when(contactService.getContacts(
                user,
                null,
                pageable
        )).thenReturn(page);

        ResponseEntity<Page<ContactResponse>> response =
                contactController.getContacts(
                        authentication,
                        null,
                        0,
                        10
                );

        assertEquals(
                HttpStatus.OK,
                response.getStatusCode()
        );

        assertNotNull(response.getBody());

        assertEquals(
                1,
                response.getBody().getTotalElements()
        );

        verify(contactService)
                .getContacts(
                        user,
                        null,
                        pageable
                );
    }

    @Test
    void getContact_shouldReturnContact() {

        when(contactService.getContact(
                1L,
                user
        )).thenReturn(contactResponse);

        ResponseEntity<ContactResponse> response =
                contactController.getContact(
                        authentication,
                        1L
                );

        assertEquals(
                HttpStatus.OK,
                response.getStatusCode()
        );

        assertNotNull(response.getBody());

        assertEquals(
                1L,
                response.getBody().getId()
        );

        assertEquals(
                "John",
                response.getBody().getFirstName()
        );

        verify(contactService)
                .getContact(1L, user);
    }

    @Test
    void createContact_shouldReturnCreatedContact() {

        ContactRequest request =
                new ContactRequest();

        request.setFirstName("John");
        request.setLastName("Doe");
        request.setTitle("Developer");

        when(contactService.createContact(
                request,
                user
        )).thenReturn(contactResponse);

        ResponseEntity<ContactResponse> response =
                contactController.createContact(
                        authentication,
                        request
                );

        assertEquals(
                HttpStatus.CREATED,
                response.getStatusCode()
        );

        assertNotNull(response.getBody());

        assertEquals(
                "John",
                response.getBody().getFirstName()
        );

        verify(contactService)
                .createContact(request, user);
    }

    @Test
    void updateContact_shouldReturnUpdatedContact() {

        ContactRequest request =
                new ContactRequest();

        request.setFirstName("John Updated");
        request.setLastName("Doe");
        request.setTitle("Senior Developer");

        ContactResponse updatedResponse =
                new ContactResponse(
                        1L,
                        "John Updated",
                        "Doe",
                        "Senior Developer",
                        List.of(),
                        List.of()
                );

        when(contactService.updateContact(
                1L,
                request,
                user
        )).thenReturn(updatedResponse);

        ResponseEntity<ContactResponse> response =
                contactController.updateContact(
                        authentication,
                        1L,
                        request
                );

        assertEquals(
                HttpStatus.OK,
                response.getStatusCode()
        );

        assertNotNull(response.getBody());

        assertEquals(
                "John Updated",
                response.getBody().getFirstName()
        );

        assertEquals(
                "Senior Developer",
                response.getBody().getTitle()
        );

        verify(contactService)
                .updateContact(1L, request, user);
    }

    @Test
    void deleteContact_shouldReturnNoContent() {

        doNothing().when(contactService)
                .deleteContact(1L, user);

        ResponseEntity<Void> response =
                contactController.deleteContact(
                        authentication,
                        1L
                );

        assertEquals(
                HttpStatus.NO_CONTENT,
                response.getStatusCode()
        );

        assertNull(response.getBody());

        verify(contactService)
                .deleteContact(1L, user);
    }
}