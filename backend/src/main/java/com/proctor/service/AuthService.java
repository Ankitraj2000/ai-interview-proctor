package com.proctor.service;

import com.proctor.dto.*;
import com.proctor.entity.Role;
import com.proctor.entity.User;
import com.proctor.repository.RoleRepository;
import com.proctor.repository.UserRepository;
import com.proctor.security.JwtUtils;
import com.proctor.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    // In-memory OTP storage
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();
    private final Map<String, Instant> otpExpiryStore = new ConcurrentHashMap<>();
    private final Map<String, String> tempRegistrationStore = new ConcurrentHashMap<>(); // stores temp JSON signup requests

    @Transactional
    public MessageResponse registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Generate OTP
        String otp = generateOtp();
        otpStore.put(signUpRequest.getEmail(), otp);
        otpExpiryStore.put(signUpRequest.getEmail(), Instant.now().plus(10, ChronoUnit.MINUTES));

        // Create user (disabled by default until OTP is verified)
        User user = User.builder()
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .firstName(signUpRequest.getFirstName())
                .lastName(signUpRequest.getLastName())
                .isEnabled(false)
                .build();

        Set<Role> roles = new HashSet<>();
        Set<String> strRoles = signUpRequest.getRoles();

        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName("ROLE_CANDIDATE")
                    .orElseThrow(() -> new RuntimeException("Error: Role ROLE_CANDIDATE is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.toUpperCase()) {
                    case "ADMIN":
                        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                                .orElseThrow(() -> new RuntimeException("Error: Role ROLE_ADMIN is not found."));
                        roles.add(adminRole);
                        break;
                    case "INTERVIEWER":
                        Role intRole = roleRepository.findByName("ROLE_INTERVIEWER")
                                .orElseThrow(() -> new RuntimeException("Error: Role ROLE_INTERVIEWER is not found."));
                        roles.add(intRole);
                        break;
                    default:
                        Role candRole = roleRepository.findByName("ROLE_CANDIDATE")
                                .orElseThrow(() -> new RuntimeException("Error: Role ROLE_CANDIDATE is not found."));
                        roles.add(candRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        // Send OTP
        emailService.sendOtpEmail(signUpRequest.getEmail(), otp);

        return new MessageResponse("User registered successfully. Please verify your email with the OTP sent.");
    }

    @Transactional
    public MessageResponse resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found with email: " + email));

        if (user.getIsEnabled()) {
            return new MessageResponse("Error: Account is already verified.");
        }

        // Generate OTP
        String otp = generateOtp();
        otpStore.put(email, otp);
        otpExpiryStore.put(email, Instant.now().plus(10, java.time.temporal.ChronoUnit.MINUTES));

        // Send OTP
        emailService.sendOtpEmail(email, otp);

        return new MessageResponse("A new OTP verification code has been sent to your email.");
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        String refreshToken = jwtUtils.generateTokenFromUsername(loginRequest.getEmail()); // For simplified demo, reuse JWT signing

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return JwtResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken)
                .id(userDetails.getId())
                .email(userDetails.getEmail())
                .firstName(userDetails.getFirstName())
                .lastName(userDetails.getLastName())
                .roles(roles)
                .build();
    }

    @Transactional
    public MessageResponse verifyOtp(VerifyOtpRequest request) {
        String email = request.getEmail();
        String otp = request.getOtp();

        if (!otpStore.containsKey(email) || !otpStore.get(email).equals(otp)) {
            throw new RuntimeException("Error: Invalid OTP!");
        }

        if (otpExpiryStore.get(email).isBefore(Instant.now())) {
            otpStore.remove(email);
            otpExpiryStore.remove(email);
            throw new RuntimeException("Error: OTP expired!");
        }

        // Activate User
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));
        user.setIsEnabled(true);
        userRepository.save(user);

        // Cleanup
        otpStore.remove(email);
        otpExpiryStore.remove(email);

        return new MessageResponse("Email verified successfully! You can now log in.");
    }

    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: Email address not found."));

        String otp = generateOtp();
        otpStore.put(user.getEmail(), otp);
        otpExpiryStore.put(user.getEmail(), Instant.now().plus(10, ChronoUnit.MINUTES));

        emailService.sendOtpEmail(user.getEmail(), otp);

        return new MessageResponse("OTP sent to your email address.");
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail();
        String otp = request.getToken();

        if (!otpStore.containsKey(email) || !otpStore.get(email).equals(otp)) {
            throw new RuntimeException("Error: Invalid OTP code!");
        }

        if (otpExpiryStore.get(email).isBefore(Instant.now())) {
            otpStore.remove(email);
            otpExpiryStore.remove(email);
            throw new RuntimeException("Error: OTP code expired!");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
        notificationService.createNotification(user, "Password Changed", "Your password has been successfully updated/reset.", "PASSWORD_CHANGED");

        otpStore.remove(email);
        otpExpiryStore.remove(email);

        return new MessageResponse("Password reset successfully.");
    }

    private String generateOtp() {
        Random random = new Random();
        int number = 100000 + random.nextInt(900000);
        return String.valueOf(number);
    }
}
