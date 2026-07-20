package com.proctor.service;

import com.proctor.dto.*;
import com.proctor.entity.Role;
import com.proctor.entity.User;
import com.proctor.repository.RoleRepository;
import com.proctor.repository.UserRepository;
import com.proctor.security.JwtUtils;
import com.proctor.security.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private User candidate;
    private Role candidateRole;
    private SignupRequest signupRequest;
    private LoginRequest loginRequest;
    private VerifyOtpRequest verifyOtpRequest;
    private ForgotPasswordRequest forgotPasswordRequest;
    private ResetPasswordRequest resetPasswordRequest;

    @BeforeEach
    public void setUp() {
        candidateRole = Role.builder().id(1L).name("ROLE_CANDIDATE").build();

        candidate = User.builder()
                .id(10L)
                .email("candidate@email.com")
                .password("encodedPassword")
                .firstName("Jane")
                .lastName("Doe")
                .isEnabled(false)
                .roles(new HashSet<>(Collections.singletonList(candidateRole)))
                .build();

        signupRequest = new SignupRequest();
        signupRequest.setEmail("candidate@email.com");
        signupRequest.setPassword("password123");
        signupRequest.setFirstName("Jane");
        signupRequest.setLastName("Doe");
        signupRequest.setRoles(new HashSet<>(Collections.singletonList("candidate")));

        loginRequest = new LoginRequest();
        loginRequest.setEmail("candidate@email.com");
        loginRequest.setPassword("password123");

        verifyOtpRequest = new VerifyOtpRequest();
        verifyOtpRequest.setEmail("candidate@email.com");
        verifyOtpRequest.setOtp("123456");

        forgotPasswordRequest = new ForgotPasswordRequest();
        forgotPasswordRequest.setEmail("candidate@email.com");

        resetPasswordRequest = new ResetPasswordRequest();
        resetPasswordRequest.setEmail("candidate@email.com");
        resetPasswordRequest.setToken("123456");
        resetPasswordRequest.setNewPassword("newPassword123");
    }

    @Test
    public void testRegisterUser_Success() {
        when(userRepository.existsByEmail("candidate@email.com")).thenReturn(false);
        when(encoder.encode("password123")).thenReturn("encodedPassword");
        when(roleRepository.findByName("ROLE_CANDIDATE")).thenReturn(Optional.of(candidateRole));
        when(userRepository.save(any(User.class))).thenReturn(candidate);

        MessageResponse response = authService.registerUser(signupRequest);

        assertNotNull(response);
        assertTrue(response.getMessage().contains("registered successfully"));
        verify(emailService, times(1)).sendOtpEmail(eq("candidate@email.com"), anyString());
    }

    @Test
    public void testAuthenticateUser_Success() {
        Authentication authentication = mock(Authentication.class);
        UserDetailsImpl userDetails = new UserDetailsImpl(
                10L,
                "candidate@email.com",
                "encodedPassword",
                "Jane",
                "Doe",
                true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_CANDIDATE"))
        );

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("jwt.token");
        when(jwtUtils.generateTokenFromUsername("candidate@email.com")).thenReturn("refresh.token");

        JwtResponse response = authService.authenticateUser(loginRequest);

        assertNotNull(response);
        assertEquals("jwt.token", response.getToken());
        assertEquals("refresh.token", response.getRefreshToken());
        assertEquals("candidate@email.com", response.getEmail());
    }

    @Test
    public void testVerifyOtp_Success() {
        // Pre-populate maps in in-memory storage using reflection
        Map<String, String> otpStore = new ConcurrentHashMap<>();
        Map<String, Instant> otpExpiryStore = new ConcurrentHashMap<>();
        otpStore.put("candidate@email.com", "123456");
        otpExpiryStore.put("candidate@email.com", Instant.now().plus(10, ChronoUnit.MINUTES));

        ReflectionTestUtils.setField(authService, "otpStore", otpStore);
        ReflectionTestUtils.setField(authService, "otpExpiryStore", otpExpiryStore);

        when(userRepository.findByEmail("candidate@email.com")).thenReturn(Optional.of(candidate));
        when(userRepository.save(candidate)).thenReturn(candidate);

        MessageResponse response = authService.verifyOtp(verifyOtpRequest);

        assertNotNull(response);
        assertTrue(response.getMessage().contains("verified successfully"));
        assertTrue(candidate.getIsEnabled());
    }

    @Test
    public void testVerifyOtp_Expired() {
        Map<String, String> otpStore = new ConcurrentHashMap<>();
        Map<String, Instant> otpExpiryStore = new ConcurrentHashMap<>();
        otpStore.put("candidate@email.com", "123456");
        otpExpiryStore.put("candidate@email.com", Instant.now().minus(5, ChronoUnit.MINUTES)); // expired 5 mins ago

        ReflectionTestUtils.setField(authService, "otpStore", otpStore);
        ReflectionTestUtils.setField(authService, "otpExpiryStore", otpExpiryStore);

        assertThrows(RuntimeException.class, () -> authService.verifyOtp(verifyOtpRequest));
    }

    @Test
    public void testForgotPassword_Success() {
        when(userRepository.findByEmail("candidate@email.com")).thenReturn(Optional.of(candidate));

        MessageResponse response = authService.forgotPassword(forgotPasswordRequest);

        assertNotNull(response);
        assertEquals("OTP sent to your email address.", response.getMessage());
        verify(emailService, times(1)).sendOtpEmail(eq("candidate@email.com"), anyString());
    }

    @Test
    public void testResetPassword_Success() {
        Map<String, String> otpStore = new ConcurrentHashMap<>();
        Map<String, Instant> otpExpiryStore = new ConcurrentHashMap<>();
        otpStore.put("candidate@email.com", "123456");
        otpExpiryStore.put("candidate@email.com", Instant.now().plus(10, ChronoUnit.MINUTES));

        ReflectionTestUtils.setField(authService, "otpStore", otpStore);
        ReflectionTestUtils.setField(authService, "otpExpiryStore", otpExpiryStore);

        when(userRepository.findByEmail("candidate@email.com")).thenReturn(Optional.of(candidate));
        when(encoder.encode("newPassword123")).thenReturn("newEncodedPassword");
        when(userRepository.save(candidate)).thenReturn(candidate);

        MessageResponse response = authService.resetPassword(resetPasswordRequest);

        assertNotNull(response);
        assertEquals("Password reset successfully.", response.getMessage());
        assertEquals("newEncodedPassword", candidate.getPassword());
    }
}
