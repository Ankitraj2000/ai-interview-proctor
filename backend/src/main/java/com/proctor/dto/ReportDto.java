package com.proctor.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReportDto {
    private Long id;
    private Long sessionId;
    private Long candidateId;
    private String candidateEmail;
    private String candidateName;
    private Double finalScore;
    private String decision;
    private String summary;
    private String filePath;
    private LocalDateTime generatedAt;

    // Detailed score breakdowns
    private Double technicalScore;
    private Double communicationScore;
    private Double codingScore;
    private Double mcqScore;
    private Double subjectiveScore;
    private Double sqlScore;
    private Double debuggingScore;
    private Double overallScore;
    private Double aiIntegrityScore;

    // Proctoring integrity stats
    private Integer totalViolations;
    private Integer highViolations;
    private Integer mediumViolations;
    private Integer lowViolations;
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private String aiRecommendation;

    // Assessment metadata
    private String companyName;
    private String jobRole;
    private Integer duration;
    private String completionStatus;
    private String finalStatus; // SELECTED, REJECTED, PENDING
}
