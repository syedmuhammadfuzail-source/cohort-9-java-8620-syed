package com.contactmanagement.backend.controller;

import com.contactmanagement.backend.dto.ChangePasswordRequest;
import com.contactmanagement.backend.dto.LoginRequest;
import com.contactmanagement.backend.dto.LoginResponse;
import com.contactmanagement.backend.dto.RegisterRequest;
import com.contactmanagement.backend.dto.UserResponse;
import com.contactmanagement.backend.entity.User;
import com.contactmanagement.backend.service.AuthService;
import com.contactmanagement.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(
            AuthService authService,
            UserService userService
    ) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        UserResponse response =
                authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        LoginResponse response =
                authService.login(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(
            Authentication authentication
    ) {
        User user = userService
                .findByIdentifier(
                        authentication.getName()
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Authenticated user not found"
                        )
                );

        UserResponse response =
                new UserResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getPhone(),
                        user.getFirstName(),
                        user.getLastName()
                );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        authService.changePassword(
                authentication.getName(),
                request
        );

        return ResponseEntity.ok(
                "Password changed successfully"
        );
    }
}