package com.contactmanagement.backend.service;

import com.contactmanagement.backend.dto.ChangePasswordRequest;
import com.contactmanagement.backend.dto.LoginRequest;
import com.contactmanagement.backend.dto.LoginResponse;
import com.contactmanagement.backend.dto.RegisterRequest;
import com.contactmanagement.backend.dto.UserResponse;
import com.contactmanagement.backend.entity.User;
import com.contactmanagement.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {

        user = new User();

        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPhone("03001234567");
        user.setPassword("encodedPassword");
        user.setFirstName("Test");
        user.setLastName("User");
    }

    // ============================================================
    // REGISTER TESTS
    // ============================================================

    @Test
    void registerWithEmailShouldCreateUserSuccessfully() {

        RegisterRequest request = new RegisterRequest();

        request.setEmail("test@example.com");
        request.setPassword("password123");
        request.setFirstName("Test");
        request.setLastName("User");

        when(userService.existsByEmail("test@example.com"))
                .thenReturn(false);

        when(passwordEncoder.encode("password123"))
                .thenReturn("encodedPassword");

        when(userService.save(any(User.class)))
                .thenReturn(user);

        UserResponse response =
                authService.register(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Test", response.getFirstName());
        assertEquals("User", response.getLastName());

        verify(userService)
                .existsByEmail("test@example.com");

        verify(passwordEncoder)
                .encode("password123");

        verify(userService)
                .save(any(User.class));
    }

    @Test
    void registerWithPhoneShouldCreateUserSuccessfully() {

        RegisterRequest request = new RegisterRequest();

        request.setPhone("03001234567");
        request.setPassword("password123");
        request.setFirstName("Test");
        request.setLastName("User");

        when(userService.existsByPhone("03001234567"))
                .thenReturn(false);

        when(passwordEncoder.encode("password123"))
                .thenReturn("encodedPassword");

        when(userService.save(any(User.class)))
                .thenReturn(user);

        UserResponse response =
                authService.register(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());

        verify(userService)
                .existsByPhone("03001234567");

        verify(passwordEncoder)
                .encode("password123");

        verify(userService)
                .save(any(User.class));
    }

    @Test
    void registerWithoutEmailAndPhoneShouldThrowException() {

        RegisterRequest request = new RegisterRequest();

        request.setPassword("password123");

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.register(request)
                );

        assertEquals(
                "Either email or phone number is required",
                exception.getMessage()
        );

        verifyNoInteractions(userService);
    }

    @Test
    void registerWithExistingEmailShouldThrowException() {

        RegisterRequest request = new RegisterRequest();

        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(userService.existsByEmail("test@example.com"))
                .thenReturn(true);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.register(request)
                );

        assertEquals(
                "Email is already registered",
                exception.getMessage()
        );

        verify(userService)
                .existsByEmail("test@example.com");

        verify(userService, never())
                .save(any(User.class));
    }

    @Test
    void registerWithExistingPhoneShouldThrowException() {

        RegisterRequest request = new RegisterRequest();

        request.setPhone("03001234567");
        request.setPassword("password123");

        when(userService.existsByPhone("03001234567"))
                .thenReturn(true);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.register(request)
                );

        assertEquals(
                "Phone number is already registered",
                exception.getMessage()
        );

        verify(userService)
                .existsByPhone("03001234567");

        verify(userService, never())
                .save(any(User.class));
    }

    @Test
    void registerWhenDatabaseDuplicateOccursShouldThrowException() {

        RegisterRequest request = new RegisterRequest();

        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(userService.existsByEmail("test@example.com"))
                .thenReturn(false);

        when(passwordEncoder.encode("password123"))
                .thenReturn("encodedPassword");

        when(userService.save(any(User.class)))
                .thenThrow(
                        new DataIntegrityViolationException(
                                "Duplicate email"
                        )
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.register(request)
                );

        assertEquals(
                "Email or phone number is already registered",
                exception.getMessage()
        );
    }

    // ============================================================
    // LOGIN TESTS
    // ============================================================

    @Test
    void loginWithEmailShouldReturnToken() {

        LoginRequest request = new LoginRequest();

        request.setIdentifier("test@example.com");
        request.setPassword("password123");

        when(userService.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "password123",
                "encodedPassword"
        )).thenReturn(true);

        when(jwtService.generateToken("test@example.com"))
                .thenReturn("jwt-token");

        LoginResponse response =
                authService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertNotNull(response.getUser());

        verify(userService)
                .findByEmail("test@example.com");

        verify(passwordEncoder)
                .matches(
                        "password123",
                        "encodedPassword"
                );

        verify(jwtService)
                .generateToken("test@example.com");
    }

    @Test
    void loginWithPhoneShouldReturnToken() {

        LoginRequest request = new LoginRequest();

        request.setIdentifier("03001234567");
        request.setPassword("password123");

        when(userService.findByPhone("03001234567"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "password123",
                "encodedPassword"
        )).thenReturn(true);

        when(jwtService.generateToken("test@example.com"))
                .thenReturn("jwt-token");

        LoginResponse response =
                authService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());

        verify(userService)
                .findByPhone("03001234567");

        verify(passwordEncoder)
                .matches(
                        "password123",
                        "encodedPassword"
                );

        verify(jwtService)
                .generateToken("test@example.com");
    }

    @Test
    void loginWithInvalidEmailShouldThrowException() {

        LoginRequest request = new LoginRequest();

        request.setIdentifier("wrong@example.com");
        request.setPassword("password123");

        when(userService.findByEmail("wrong@example.com"))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.login(request)
                );

        assertEquals(
                "Invalid identifier or password",
                exception.getMessage()
        );

        verify(userService)
                .findByEmail("wrong@example.com");

        verify(jwtService, never())
                .generateToken(anyString());
    }

    @Test
    void loginWithInvalidPhoneShouldThrowException() {

        LoginRequest request = new LoginRequest();

        request.setIdentifier("03111111111");
        request.setPassword("password123");

        when(userService.findByPhone("03111111111"))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.login(request)
                );

        assertEquals(
                "Invalid identifier or password",
                exception.getMessage()
        );
    }

    @Test
    void loginWithWrongPasswordShouldThrowException() {

        LoginRequest request = new LoginRequest();

        request.setIdentifier("test@example.com");
        request.setPassword("wrongPassword");

        when(userService.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "wrongPassword",
                "encodedPassword"
        )).thenReturn(false);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.login(request)
                );

        assertEquals(
                "Invalid identifier or password",
                exception.getMessage()
        );

        verify(jwtService, never())
                .generateToken(anyString());
    }

    // ============================================================
    // CHANGE PASSWORD TESTS
    // ============================================================

    @Test
    void changePasswordWithEmailShouldSucceed() {

        ChangePasswordRequest request =
                new ChangePasswordRequest();

        request.setCurrentPassword("oldPassword");
        request.setNewPassword("newPassword123");

        when(userService.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "oldPassword",
                "encodedPassword"
        )).thenReturn(true);

        when(passwordEncoder.encode("newPassword123"))
                .thenReturn("newEncodedPassword");

        authService.changePassword(
                "test@example.com",
                request
        );

        assertEquals(
                "newEncodedPassword",
                user.getPassword()
        );

        verify(passwordEncoder)
                .encode("newPassword123");

        verify(userService)
                .save(user);
    }

    @Test
    void changePasswordWithPhoneShouldSucceed() {

        ChangePasswordRequest request =
                new ChangePasswordRequest();

        request.setCurrentPassword("oldPassword");
        request.setNewPassword("newPassword123");

        when(userService.findByPhone("03001234567"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "oldPassword",
                "encodedPassword"
        )).thenReturn(true);

        when(passwordEncoder.encode("newPassword123"))
                .thenReturn("newEncodedPassword");

        authService.changePassword(
                "03001234567",
                request
        );

        assertEquals(
                "newEncodedPassword",
                user.getPassword()
        );

        verify(userService)
                .save(user);
    }

    @Test
    void changePasswordForUnknownUserShouldThrowException() {

        ChangePasswordRequest request =
                new ChangePasswordRequest();

        request.setCurrentPassword("oldPassword");
        request.setNewPassword("newPassword123");

        when(userService.findByEmail("unknown@example.com"))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.changePassword(
                                "unknown@example.com",
                                request
                        )
                );

        assertEquals(
                "User not found",
                exception.getMessage()
        );

        verify(userService, never())
                .save(any(User.class));
    }

    @Test
    void changePasswordWithWrongCurrentPasswordShouldThrowException() {

        ChangePasswordRequest request =
                new ChangePasswordRequest();

        request.setCurrentPassword("wrongPassword");
        request.setNewPassword("newPassword123");

        when(userService.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "wrongPassword",
                "encodedPassword"
        )).thenReturn(false);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.changePassword(
                                "test@example.com",
                                request
                        )
                );

        assertEquals(
                "Current password is incorrect",
                exception.getMessage()
        );

        verify(userService, never())
                .save(any(User.class));
    }

    @Test
    void changePasswordUsingSamePasswordShouldThrowException() {

        ChangePasswordRequest request =
                new ChangePasswordRequest();

        request.setCurrentPassword("oldPassword");
        request.setNewPassword("oldPassword");

        when(userService.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "oldPassword",
                "encodedPassword"
        )).thenReturn(true);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.changePassword(
                                "test@example.com",
                                request
                        )
                );

        assertEquals(
                "New password must be different from current password",
                exception.getMessage()
        );

        verify(passwordEncoder, never())
                .encode("oldPassword");

        verify(userService, never())
                .save(any(User.class));
    }
}