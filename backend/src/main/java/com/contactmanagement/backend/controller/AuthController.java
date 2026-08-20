package com.contactmanagement.backend.controller;

import com.contactmanagement.backend.dto.LoginRequest;
import com.contactmanagement.backend.dto.LoginResponse;
import com.contactmanagement.backend.dto.RegisterRequest;
import com.contactmanagement.backend.dto.UserResponse;
import com.contactmanagement.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        UserResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }
    @GetMapping("/me")
public ResponseEntity<String> me(
        Authentication authentication
) {
    return ResponseEntity.ok(authentication.getName());
}
}