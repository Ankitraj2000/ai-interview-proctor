package com.proctor.controller;

import com.proctor.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Operations", description = "Endpoints for Admin Console metrics, audit logs, and system backups")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/dashboard-stats")
    @Operation(summary = "Get admin console system statistics and resource metrics")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getAdminDashboardStats());
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get list of administrator action audit trail logs")
    public ResponseEntity<List<Map<String, Object>>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }

    @PostMapping("/backup")
    @Operation(summary = "Export and download database SQL backup dump")
    public ResponseEntity<byte[]> downloadBackup() {
        byte[] backupBytes = adminService.exportDatabaseBackup();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"proctor_db_backup.sql\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(backupBytes);
    }
}
