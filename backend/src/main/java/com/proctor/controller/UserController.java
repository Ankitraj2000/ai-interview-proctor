package com.proctor.controller;

import com.proctor.dto.UserDto;
import com.proctor.entity.Resume;
import com.proctor.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/users")
@Tag(name = "User Management", description = "Endpoints for Profile, Resume Uploads, and Admin User management")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get the currently authenticated user profile")
    public ResponseEntity<UserDto> getUserProfile(Principal principal) {
        UserDto profile = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile fields (First/Last name)")
    public ResponseEntity<UserDto> updateUserProfile(Principal principal, @RequestBody UserDto dto) {
        UserDto updated = userService.updateUserProfile(principal.getName(), dto);
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload candidate resume (PDF/DOCX format)")
    public ResponseEntity<String> uploadResume(Principal principal, @RequestParam("file") MultipartFile file) throws IOException {
        userService.saveUserResume(principal.getName(), file);
        return ResponseEntity.ok("Resume uploaded and parsed successfully.");
    }

    @GetMapping("/resume")
    @Operation(summary = "Get uploaded resume metadata & parsed text content")
    public ResponseEntity<Resume> getResume(Principal principal) {
        Resume resume = userService.getResumeByEmail(principal.getName());
        return ResponseEntity.ok(resume);
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change authenticated user password")
    public ResponseEntity<String> changePassword(Principal principal, @RequestBody java.util.Map<String, String> request) {
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        userService.changePassword(principal.getName(), oldPassword, newPassword);
        return ResponseEntity.ok("Password updated successfully.");
    }

    @DeleteMapping("/resume")
    @Operation(summary = "Delete uploaded candidate resume")
    public ResponseEntity<String> deleteResume(Principal principal) {
        userService.deleteUserResume(principal.getName());
        return ResponseEntity.ok("Resume removed successfully.");
    }

    @GetMapping("/resume/download")
    @Operation(summary = "Download candidate resume file")
    public ResponseEntity<org.springframework.core.io.Resource> downloadResume(Principal principal) {
        Resume resume = userService.getResumeByEmail(principal.getName());
        if (resume == null || resume.getFilePath() == null) {
            return ResponseEntity.notFound().build();
        }
        java.io.File file = new java.io.File(resume.getFilePath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        org.springframework.core.io.FileSystemResource resource = new org.springframework.core.io.FileSystemResource(file);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resume.getFileName() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(file.length())
                .body(resource);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Retrieve lists of all user registrations (Admin only)")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user registration account (Admin only)")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully.");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user details by Admin (Admin only)")
    public ResponseEntity<UserDto> adminUpdateUser(@PathVariable Long id, @RequestBody UserDto dto) {
        return ResponseEntity.ok(userService.adminUpdateUser(id, dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate or Deactivate user account (Admin only)")
    public ResponseEntity<String> toggleUserStatus(@PathVariable Long id, @RequestParam boolean isEnabled) {
        userService.toggleUserStatus(id, isEnabled);
        return ResponseEntity.ok("User status updated to: " + (isEnabled ? "ACTIVE" : "DEACTIVATED"));
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reset candidate or interviewer password by Admin (Admin only)")
    public ResponseEntity<String> adminResetPassword(@PathVariable Long id, @RequestBody java.util.Map<String, String> request) {
        String newPassword = request.get("newPassword");
        userService.adminResetPassword(id, newPassword);
        return ResponseEntity.ok("User password reset successfully.");
    }
}
