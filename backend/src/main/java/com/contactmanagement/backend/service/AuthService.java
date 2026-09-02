package com.contactmanagement.backend.service;

import com.contactmanagement.backend.dto.ChangePasswordRequest;
import com.contactmanagement.backend.dto.LoginRequest;
import com.contactmanagement.backend.dto.LoginResponse;
import com.contactmanagement.backend.dto.RegisterRequest;
import com.contactmanagement.backend.dto.UserResponse;
import com.contactmanagement.backend.entity.User;
import com.contactmanagement.backend.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger logger =
            LoggerFactory.getLogger(AuthService.class);

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserService userService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserResponse register(RegisterRequest request) {

        logger.info("User registration attempt");

        // At least one identifier is required
        if ((request.getEmail() == null
                || request.getEmail().isBlank())
                && (request.getPhone() == null
                || request.getPhone().isBlank())) {

            logger.warn(
                    "User registration failed: no email or phone provided"
            );

            throw new IllegalArgumentException(
                    "Either email or phone number is required"
            );
        }

        // Check duplicate email
        if (request.getEmail() != null
                && !request.getEmail().isBlank()
                && userService.existsByEmail(request.getEmail())) {

            logger.warn(
                    "User registration failed: email already registered"
            );

            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        // Check duplicate phone
        if (request.getPhone() != null
                && !request.getPhone().isBlank()
                && userService.existsByPhone(request.getPhone())) {

            logger.warn(
                    "User registration failed: phone number already registered"
            );

            throw new IllegalArgumentException(
                    "Phone number is already registered"
            );
        }

        User user = new User();

        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        User savedUser;

        try {

            savedUser = userService.save(user);

        } catch (DataIntegrityViolationException exception) {

            logger.warn(
                    "User registration failed due to duplicate email or phone"
            );

            throw new IllegalArgumentException(
                    "Email or phone number is already registered"
            );
        }

        logger.info("User registered successfully");

        return new UserResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getFirstName(),
                savedUser.getLastName()
        );
    }

    public LoginResponse login(LoginRequest request) {

        logger.info("User login attempt");

        String identifier =
                request.getIdentifier().trim();

        User user;

        // Login using email
        if (identifier.contains("@")) {

            user = userService.findByEmail(identifier)
                    .orElseThrow(() -> {

                        logger.warn(
                                "User login failed: invalid identifier"
                        );

                        return new IllegalArgumentException(
                                "Invalid identifier or password"
                        );
                    });

        } else {

            // Login using phone
            user = userService.findByPhone(identifier)
                    .orElseThrow(() -> {

                        logger.warn(
                                "User login failed: invalid identifier"
                        );

                        return new IllegalArgumentException(
                                "Invalid identifier or password"
                        );
                    });
        }

        // Verify password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {

            logger.warn(
                    "User login failed: invalid password"
            );

            throw new IllegalArgumentException(
                    "Invalid identifier or password"
            );
        }

        UserResponse userResponse =
                new UserResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getPhone(),
                        user.getFirstName(),
                        user.getLastName()
                );

        // Use email when available,
        // otherwise use phone
        String userIdentifier =
                user.getEmail() != null
                        ? user.getEmail()
                        : user.getPhone();

        // Generate JWT
        String token =
                jwtService.generateToken(
                        userIdentifier
                );

        logger.info("User login successful");

        return new LoginResponse(
                token,
                userResponse
        );
    }

    public void changePassword(
            String identifier,
            ChangePasswordRequest request
    ) {

        logger.info("Password change attempt");

        User user;

        // Find user by email
        if (identifier.contains("@")) {

            user = userService.findByEmail(identifier)
                    .orElseThrow(() -> {

                        logger.warn(
                                "Password change failed: user not found"
                        );

                        return new IllegalArgumentException(
                                "User not found"
                        );
                    });

        } else {

            // Find user by phone
            user = userService.findByPhone(identifier)
                    .orElseThrow(() -> {

                        logger.warn(
                                "Password change failed: user not found"
                        );

                        return new IllegalArgumentException(
                                "User not found"
                        );
                    });
        }

        // Verify current password
        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        )) {

            logger.warn(
                    "Password change failed: current password is incorrect"
            );

            throw new IllegalArgumentException(
                    "Current password is incorrect"
            );
        }

        // Prevent using the same password
        if (request.getCurrentPassword().equals(
                request.getNewPassword()
        )) {

            logger.warn(
                    "Password change failed: new password matches current password"
            );

            throw new IllegalArgumentException(
                    "New password must be different from current password"
            );
        }

        // Encode and save the new password
        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userService.save(user);

        logger.info("Password changed successfully");
    }
}