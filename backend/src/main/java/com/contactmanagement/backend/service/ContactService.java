package com.contactmanagement.backend.service;

import com.contactmanagement.backend.dto.ContactEmailRequest;
import com.contactmanagement.backend.dto.ContactEmailResponse;
import com.contactmanagement.backend.dto.ContactPhoneRequest;
import com.contactmanagement.backend.dto.ContactPhoneResponse;
import com.contactmanagement.backend.dto.ContactRequest;
import com.contactmanagement.backend.dto.ContactResponse;
import com.contactmanagement.backend.entity.Contact;
import com.contactmanagement.backend.entity.ContactEmail;
import com.contactmanagement.backend.entity.ContactPhone;
import com.contactmanagement.backend.entity.User;
import com.contactmanagement.backend.repository.ContactEmailRepository;
import com.contactmanagement.backend.repository.ContactPhoneRepository;
import com.contactmanagement.backend.repository.ContactRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ContactService {

    private static final Logger logger =
            LoggerFactory.getLogger(ContactService.class);

    private static final String CONTACT_NOT_FOUND = "Contact not found";

    private final ContactRepository contactRepository;
    private final ContactEmailRepository contactEmailRepository;
    private final ContactPhoneRepository contactPhoneRepository;

    public ContactService(
            ContactRepository contactRepository,
            ContactEmailRepository contactEmailRepository,
            ContactPhoneRepository contactPhoneRepository
    ) {
        this.contactRepository = contactRepository;
        this.contactEmailRepository = contactEmailRepository;
        this.contactPhoneRepository = contactPhoneRepository;
    }

    @Transactional(readOnly = true)
    public Page<ContactResponse> getContacts(
            User user,
            String search,
            Pageable pageable
    ) {

        logger.info(
                "Fetching contacts for user id={}, page={}, size={}, searchProvided={}",
                user.getId(),
                pageable.getPageNumber(),
                pageable.getPageSize(),
                search != null && !search.isBlank()
        );

        Page<Contact> contacts;

        if (search == null || search.isBlank()) {

            contacts = contactRepository.findByUser(
                    user,
                    pageable
            );

        } else {

            contacts =
                    contactRepository
                            .findByUserAndFirstNameContainingIgnoreCaseOrUserAndLastNameContainingIgnoreCase(
                                    user,
                                    search,
                                    user,
                                    search,
                                    pageable
                            );
        }

        List<Contact> contactList = contacts.getContent();

        if (contactList.isEmpty()) {

            logger.info(
                    "No contacts found for user id={}",
                    user.getId()
            );

            return contacts.map(contact ->
                    createContactResponse(
                            contact,
                            List.of(),
                            List.of()
                    )
            );
        }

        List<Long> contactIds = contactList.stream()
                .map(Contact::getId)
                .toList();

        List<ContactEmail> emails =
                contactEmailRepository.findByContactIdIn(contactIds);

        List<ContactPhone> phones =
                contactPhoneRepository.findByContactIdIn(contactIds);

        Map<Long, List<ContactEmailResponse>> emailsByContact =
                emails.stream()
                        .collect(Collectors.groupingBy(
                                email -> email.getContact().getId(),
                                Collectors.mapping(
                                        email -> new ContactEmailResponse(
                                                email.getId(),
                                                email.getEmail(),
                                                email.getLabel()
                                        ),
                                        Collectors.toList()
                                )
                        ));

        Map<Long, List<ContactPhoneResponse>> phonesByContact =
                phones.stream()
                        .collect(Collectors.groupingBy(
                                phone -> phone.getContact().getId(),
                                Collectors.mapping(
                                        phone -> new ContactPhoneResponse(
                                                phone.getId(),
                                                phone.getPhone(),
                                                phone.getLabel()
                                        ),
                                        Collectors.toList()
                                )
                        ));

        logger.info(
                "Successfully fetched {} contacts for user id={}",
                contactList.size(),
                user.getId()
        );

        return contacts.map(contact ->
                createContactResponse(
                        contact,
                        emailsByContact.getOrDefault(
                                contact.getId(),
                                List.of()
                        ),
                        phonesByContact.getOrDefault(
                                contact.getId(),
                                List.of()
                        )
                )
        );
    }

    @Transactional(readOnly = true)
    public ContactResponse getContact(
            Long id,
            User user
    ) {

        logger.info(
                "Fetching contact id={} for user id={}",
                id,
                user.getId()
        );

        Contact contact = contactRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() -> {

                    logger.warn(
                            "Contact not found: id={}, user id={}",
                            id,
                            user.getId()
                    );

                    return new IllegalArgumentException(
                            CONTACT_NOT_FOUND
                    );
                });

        logger.info(
                "Successfully fetched contact id={} for user id={}",
                id,
                user.getId()
        );

        return toResponse(contact);
    }

    @Transactional
    public ContactResponse createContact(
            ContactRequest request,
            User user
    ) {

        logger.info(
                "Creating new contact for user id={}",
                user.getId()
        );

        Contact contact = new Contact();

        contact.setUser(user);
        contact.setFirstName(request.getFirstName());
        contact.setLastName(request.getLastName());
        contact.setTitle(request.getTitle());

        Contact savedContact = contactRepository.save(contact);

        if (request.getEmails() != null) {

            for (ContactEmailRequest emailRequest : request.getEmails()) {

                ContactEmail contactEmail = new ContactEmail();

                contactEmail.setContact(savedContact);
                contactEmail.setEmail(emailRequest.getEmail());
                contactEmail.setLabel(emailRequest.getLabel());

                contactEmailRepository.save(contactEmail);
            }
        }

        if (request.getPhones() != null) {

            for (ContactPhoneRequest phoneRequest : request.getPhones()) {

                ContactPhone contactPhone = new ContactPhone();

                contactPhone.setContact(savedContact);
                contactPhone.setPhone(phoneRequest.getPhone());
                contactPhone.setLabel(phoneRequest.getLabel());

                contactPhoneRepository.save(contactPhone);
            }
        }

        logger.info(
                "Contact created successfully: contact id={}, user id={}",
                savedContact.getId(),
                user.getId()
        );

        return toResponse(savedContact);
    }

    @Transactional
    public ContactResponse updateContact(
            Long id,
            ContactRequest request,
            User user
    ) {

        logger.info(
                "Updating contact id={} for user id={}",
                id,
                user.getId()
        );

        Contact contact = contactRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() -> {

                    logger.warn(
                            "Contact update failed: contact id={} not found for user id={}",
                            id,
                            user.getId()
                    );

                    return new IllegalArgumentException(
                            CONTACT_NOT_FOUND
                    );
                });

        contact.setFirstName(request.getFirstName());
        contact.setLastName(request.getLastName());
        contact.setTitle(request.getTitle());

        contactRepository.save(contact);

        contactEmailRepository.deleteByContact(contact);

        if (request.getEmails() != null) {

            for (ContactEmailRequest emailRequest : request.getEmails()) {

                ContactEmail contactEmail = new ContactEmail();

                contactEmail.setContact(contact);
                contactEmail.setEmail(emailRequest.getEmail());
                contactEmail.setLabel(emailRequest.getLabel());

                contactEmailRepository.save(contactEmail);
            }
        }

        contactPhoneRepository.deleteByContact(contact);

        if (request.getPhones() != null) {

            for (ContactPhoneRequest phoneRequest : request.getPhones()) {

                ContactPhone contactPhone = new ContactPhone();

                contactPhone.setContact(contact);
                contactPhone.setPhone(phoneRequest.getPhone());
                contactPhone.setLabel(phoneRequest.getLabel());

                contactPhoneRepository.save(contactPhone);
            }
        }

        logger.info(
                "Contact updated successfully: contact id={}, user id={}",
                id,
                user.getId()
        );

        return toResponse(contact);
    }

    @Transactional
    public void deleteContact(
            Long id,
            User user
    ) {

        logger.info(
                "Deleting contact id={} for user id={}",
                id,
                user.getId()
        );

        Contact contact = contactRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() -> {

                    logger.warn(
                            "Contact deletion failed: contact id={} not found for user id={}",
                            id,
                            user.getId()
                    );

                    return new IllegalArgumentException(
                            CONTACT_NOT_FOUND
                    );
                });

        contactEmailRepository.deleteByContact(contact);

        contactPhoneRepository.deleteByContact(contact);

        contactRepository.delete(contact);

        logger.info(
                "Contact deleted successfully: contact id={}, user id={}",
                id,
                user.getId()
        );
    }

    private ContactResponse toResponse(
            Contact contact
    ) {

        List<ContactEmailResponse> emails =
                contactEmailRepository
                        .findByContact(contact)
                        .stream()
                        .map(email ->
                                new ContactEmailResponse(
                                        email.getId(),
                                        email.getEmail(),
                                        email.getLabel()
                                )
                        )
                        .toList();

        List<ContactPhoneResponse> phones =
                contactPhoneRepository
                        .findByContact(contact)
                        .stream()
                        .map(phone ->
                                new ContactPhoneResponse(
                                        phone.getId(),
                                        phone.getPhone(),
                                        phone.getLabel()
                                )
                        )
                        .toList();

        return createContactResponse(
                contact,
                emails,
                phones
        );
    }

    private ContactResponse createContactResponse(
            Contact contact,
            List<ContactEmailResponse> emails,
            List<ContactPhoneResponse> phones
    ) {

       ContactResponse response = new ContactResponse(
        contact.getId(),
        contact.getFirstName(),
        contact.getLastName(),
        contact.getTitle(),
        emails,
        phones
);

response.setCreatedAt(contact.getCreatedAt());
response.setUpdatedAt(contact.getUpdatedAt());

return response;
    }
}