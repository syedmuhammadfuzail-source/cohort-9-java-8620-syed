package com.contactmanagement.backend.service;

import com.contactmanagement.backend.entity.User;
import com.contactmanagement.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean existsByPhone(String phone) {
        return userRepository.existsByPhone(phone);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public Optional<User> findByIdentifier(String identifier) {

        Optional<User> userByEmail =
                userRepository.findByEmail(identifier);

        if (userByEmail.isPresent()) {
            return userByEmail;
        }

        return userRepository.findByPhone(identifier);
    }
}