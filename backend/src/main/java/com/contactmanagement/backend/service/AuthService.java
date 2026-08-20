package com.contactmanagement.backend.service;

import com.contactmanagement.backend.dto.LoginRequest;
import com.contactmanagement.backend.dto.LoginResponse;
import com.contactmanagement.backend.dto.RegisterRequest;
import com.contactmanagement.backend.dto.UserResponse;
import com.contactmanagement.backend.entity.User;
import com.contactmanagement.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

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

        // At least one identifier is required
        if ((request.getEmail() == null || request.getEmail().isBlank())
                && (request.getPhone() == null || request.getPhone().isBlank())) {
            throw new IllegalArgumentException(
                    "Either email or phone number is required"
            );
        }

        // Check duplicate email
        if (request.getEmail() != null
                && !request.getEmail().isBlank()
                && userService.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        // Check duplicate phone
        if (request.getPhone() != null
                && !request.getPhone().isBlank()
                && userService.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException(
                    "Phone number is already registered"
            );
        }

        User user = new User();

        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        User savedUser = userService.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getFirstName(),
                savedUser.getLastName()
        );
    }

    public LoginResponse login(LoginRequest request) {

        String identifier = request.getIdentifier().trim();

        User user;

        // Login using email
        if (identifier.contains("@")) {
            user = userService.findByEmail(identifier)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Invalid email or password"
                    ));
        }
        // Login using phone
        else {
            user = userService.findByPhone(identifier)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Invalid phone or password"
                    ));
        }

        // Verify password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getPhone(),
                user.getFirstName(),
                user.getLastName()
        );

        // Use email when available, otherwise phone
        String userIdentifier = user.getEmail() != null
                ? user.getEmail()
                : user.getPhone();

        // Generate JWT
        String token = jwtService.generateToken(userIdentifier);

        return new LoginResponse(
                token,
                userResponse
        );
    }
}