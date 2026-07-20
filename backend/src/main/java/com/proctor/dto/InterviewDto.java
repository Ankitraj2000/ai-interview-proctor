package com.proctor.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InterviewDto {
    private Long id;
    private String title;
    private String description;
    private String code;
    private Integer durationMinutes;
    private String status;
    private Long creatorId;
    private String creatorEmail;
    private Long candidateId;
    private String candidateEmail;
    private String candidateName;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime scheduledStart;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime scheduledEnd;

    private String timezone;
    private Long questionSetId;
    private String questionSetName;
    private String difficulty;
    private Integer questionCount;
    private String interviewType;
    private Boolean enableAiProctoring;
    private Boolean enableBrowserLock;
    private Boolean enableWebcam;
    private Boolean enableMicrophone;
}
