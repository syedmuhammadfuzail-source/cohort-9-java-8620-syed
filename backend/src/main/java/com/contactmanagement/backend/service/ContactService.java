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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ContactService {

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

        Contact contact = contactRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Contact not found"
                        )
                );

        return toResponse(contact);
    }

    @Transactional
    public ContactResponse createContact(
            ContactRequest request,
            User user
    ) {

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

        return toResponse(savedContact);
    }

    @Transactional
    public ContactResponse updateContact(
            Long id,
            ContactRequest request,
            User user
    ) {

        Contact contact = contactRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Contact not found"
                        )
                );

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

        return toResponse(contact);
    }

    @Transactional
    public void deleteContact(
            Long id,
            User user
    ) {

        Contact contact = contactRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Contact not found"
                        )
                );

        contactEmailRepository.deleteByContact(contact);

        contactPhoneRepository.deleteByContact(contact);

        contactRepository.delete(contact);
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

        return new ContactResponse(
                contact.getId(),
                contact.getFirstName(),
                contact.getLastName(),
                contact.getTitle(),
                emails,
                phones,
                contact.getCreatedAt(),
                contact.getUpdatedAt()
        );
    }
}



