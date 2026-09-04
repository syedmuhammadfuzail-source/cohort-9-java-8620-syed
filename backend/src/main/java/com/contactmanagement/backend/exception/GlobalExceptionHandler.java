package com.contactmanagement.backend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private static final String ERROR = "error";

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(
            IllegalArgumentException exception
    ) {

        String message = exception.getMessage();

        logger.warn(
                "Illegal argument exception: {}",
                message
        );

        // Contact not found
        if ("Contact not found".equals(message)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            ERROR, message
                    ));
        }

        // Authentication / login errors
        if (message != null
                && message.toLowerCase().contains("invalid")) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            ERROR, message
                    ));
        }

        // Duplicate registration and other bad requests
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        ERROR,
                        message != null
                                ? message
                                : "Invalid request"
                ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(
            DataIntegrityViolationException exception
    ) {

        logger.warn(
                "Database integrity violation occurred",
                exception
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        ERROR,
                        "Email or phone number is already registered"
                ));
    }
}