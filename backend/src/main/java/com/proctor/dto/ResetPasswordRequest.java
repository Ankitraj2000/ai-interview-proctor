package com.proctor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6)
    private String token; // OTP code

    @NotBlank
    @Size(min = 6, max = 40)
    private String newPassword;
}
