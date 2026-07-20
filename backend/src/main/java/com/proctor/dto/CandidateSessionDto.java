package com.proctor.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CandidateSessionDto {
    private Long id;
    private Long interviewId;
    private String interviewTitle;
    private Long userId;
    private String userEmail;
    private String userName;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String clientIp;
    private String userAgent;
    private Integer fullscreenExits;
    private Integer tabSwitches;
    private Integer warningCount;
}
