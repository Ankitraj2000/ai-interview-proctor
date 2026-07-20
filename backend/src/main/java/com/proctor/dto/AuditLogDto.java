package com.proctor.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditLogDto {
    private Long id;
    private Long userId;
    private String userEmail;
    private String action;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;
}
