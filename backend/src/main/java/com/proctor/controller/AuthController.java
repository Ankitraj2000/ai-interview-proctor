package com.proctor.controller;

import com.proctor.dto.*;
import com.proctor.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Endpoints for User Register, Login, OTP verification, and Password resets")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user account (inactive by default)")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        MessageResponse response = authService.registerUser(signUpRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials and return JWT & Refresh Token")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP to activate registered user account")
    public ResponseEntity<MessageResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        MessageResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-otp")
    @Operation(summary = "Resend validation OTP to user email")
    public ResponseEntity<MessageResponse> resendOtp(@RequestParam String email) {
        MessageResponse response = authService.resendOtp(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Initiate password recovery by sending an OTP to the email address")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        MessageResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset account password using the recovery OTP token")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        MessageResponse response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }
}
