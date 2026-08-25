package com.contactmanagement.backend.controller;

import com.contactmanagement.backend.dto.ContactRequest;
import com.contactmanagement.backend.dto.ContactResponse;
import com.contactmanagement.backend.entity.User;
import com.contactmanagement.backend.service.ContactService;
import com.contactmanagement.backend.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contacts")
@Validated
public class ContactController {

    private final ContactService contactService;
    private final UserService userService;

    public ContactController(
            ContactService contactService,
            UserService userService
    ) {
        this.contactService = contactService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<Page<ContactResponse>> getContacts(
            Authentication authentication,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")
            @Min(value = 0, message = "Page must be greater than or equal to 0")
            int page,
            @RequestParam(defaultValue = "10")
            @Min(value = 1, message = "Size must be at least 1")
            @Max(value = 100, message = "Size must not exceed 100")
            int size
    ) {

        User user = getAuthenticatedUser(authentication);

        Pageable pageable = PageRequest.of(page, size);

        Page<ContactResponse> contacts =
                contactService.getContacts(
                        user,
                        search,
                        pageable
                );

        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getContact(
            Authentication authentication,
            @PathVariable Long id
    ) {

        User user = getAuthenticatedUser(authentication);

        ContactResponse contact =
                contactService.getContact(id, user);

        return ResponseEntity.ok(contact);
    }

    @PostMapping
    public ResponseEntity<ContactResponse> createContact(
            Authentication authentication,
            @Valid @RequestBody ContactRequest request
    ) {

        User user = getAuthenticatedUser(authentication);

        ContactResponse contact =
                contactService.createContact(
                        request,
                        user
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(contact);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactResponse> updateContact(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ContactRequest request
    ) {

        User user = getAuthenticatedUser(authentication);

        ContactResponse contact =
                contactService.updateContact(
                        id,
                        request,
                        user
                );

        return ResponseEntity.ok(contact);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(
            Authentication authentication,
            @PathVariable Long id
    ) {

        User user = getAuthenticatedUser(authentication);

        contactService.deleteContact(
                id,
                user
        );

        return ResponseEntity.noContent().build();
    }

    private User getAuthenticatedUser(
            Authentication authentication
    ) {

        String identifier = authentication.getName();

        return userService
                .findByIdentifier(identifier)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Authenticated user not found"
                        )
                );
    }
}



