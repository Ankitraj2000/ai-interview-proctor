package com.proctor.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Boolean isEnabled;
    private List<String> roles;
    private String phone;
    private String skills;
    private String education;
    private String photo;
    private String address;
    private String dob;
    private String gender;
    private String bio;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String certifications;
    private String experience;
    private String createdAt;
}
