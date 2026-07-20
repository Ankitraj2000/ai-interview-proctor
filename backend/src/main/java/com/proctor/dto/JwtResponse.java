package com.proctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String refreshToken;
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private List<String> roles;
}
