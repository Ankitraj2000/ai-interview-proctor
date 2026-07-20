package com.proctor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private CandidateSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @Column(name = "final_score", nullable = false)
    private Double finalScore;

    @Column(nullable = false, length = 20)
    private String decision; // PASS, FLAGGED, FAIL

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "final_status", length = 30)
    private String finalStatus; // SELECTED, REJECTED, PENDING

    @Column(name = "company_name", length = 100)
    private String companyName;

    @Column(name = "job_role", length = 100)
    private String jobRole;

    private Integer duration;

    @Column(name = "risk_level", length = 30)
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "ai_recommendation", columnDefinition = "TEXT")
    private String aiRecommendation;

    @Column(name = "file_path", length = 255)
    private String filePath;

    @CreationTimestamp
    @Column(name = "generated_at", nullable = false, updatable = false)
    private LocalDateTime generatedAt;
}
