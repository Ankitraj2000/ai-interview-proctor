package com.proctor.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AiEventDto {
    private Long id;
    private Long sessionId;
    private LocalDateTime timestamp;
    private String eventType;
    private Double confidence;
    private String screenshotPath;
}
