package com.proctor.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CheatingLogDto {
    private Long id;
    private Long sessionId;
    private String logType;
    private String message;
    private String severity;
    private LocalDateTime timestamp;
}
