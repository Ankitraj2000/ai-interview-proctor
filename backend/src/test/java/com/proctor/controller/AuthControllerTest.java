package com.proctor.controller;

import com.proctor.dto.JwtResponse;
import com.proctor.dto.LoginRequest;
import com.proctor.dto.MessageResponse;
import com.proctor.dto.SignupRequest;
import com.proctor.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private SignupRequest signupRequest;
    private LoginRequest loginRequest;
    private JwtResponse jwtResponse;

    @BeforeEach
    public void setUp() {
        signupRequest = new SignupRequest();
        signupRequest.setEmail("candidate@email.com");
        signupRequest.setPassword("password123");
        signupRequest.setFirstName("Jane");
        signupRequest.setLastName("Doe");
        signupRequest.setRoles(new HashSet<>(Collections.singletonList("ROLE_CANDIDATE")));

        loginRequest = new LoginRequest();
        loginRequest.setEmail("candidate@email.com");
        loginRequest.setPassword("password123");

        jwtResponse = JwtResponse.builder()
                .token("test.jwt.token")
                .refreshToken("test.refresh.token")
                .id(1L)
                .email("candidate@email.com")
                .firstName("Jane")
                .lastName("Doe")
                .roles(Collections.singletonList("ROLE_CANDIDATE"))
                .build();
    }

    @Test
    public void testRegisterUser_Success() {
        MessageResponse successResponse = new MessageResponse("User registered successfully! Activate your account with the OTP sent to your email.");
        when(authService.registerUser(any(SignupRequest.class))).thenReturn(successResponse);

        ResponseEntity<MessageResponse> responseEntity = authController.registerUser(signupRequest);

        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCode().value());
        assertEquals(successResponse.getMessage(), responseEntity.getBody().getMessage());
        verify(authService, times(1)).registerUser(any(SignupRequest.class));
    }

    @Test
    public void testAuthenticateUser_Success() {
        when(authService.authenticateUser(any(LoginRequest.class))).thenReturn(jwtResponse);

        ResponseEntity<JwtResponse> responseEntity = authController.authenticateUser(loginRequest);

        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCode().value());
        assertEquals("test.jwt.token", responseEntity.getBody().getToken());
        verify(authService, times(1)).authenticateUser(any(LoginRequest.class));
    }
}
