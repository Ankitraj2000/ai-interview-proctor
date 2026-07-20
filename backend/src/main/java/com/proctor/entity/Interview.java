package com.proctor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false, length = 20)
    private String status; // SCHEDULED, LIVE, COMPLETED, CANCELLED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_set_id")
    private QuestionSet questionSet;

    @Column(length = 20)
    private String difficulty; // EASY, MEDIUM, HARD

    @Column(name = "question_count")
    private Integer questionCount;

    @Column(name = "interview_type", length = 50)
    private String interviewType; // PROGRAMMING, MCQ, SUBJECTIVE, AI_INTERVIEW, CODING_INTERVIEW, FULL_STACK

    @Column(name = "enable_ai_proctoring")
    private Boolean enableAiProctoring;

    @Column(name = "enable_browser_lock")
    private Boolean enableBrowserLock;

    @Column(name = "enable_webcam")
    private Boolean enableWebcam;

    @Column(name = "enable_microphone")
    private Boolean enableMicrophone;

    @Column(name = "scheduled_start")
    private LocalDateTime scheduledStart;

    @Column(name = "scheduled_end")
    private LocalDateTime scheduledEnd;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (enableAiProctoring == null) enableAiProctoring = true;
        if (enableBrowserLock == null) enableBrowserLock = true;
        if (enableWebcam == null) enableWebcam = true;
        if (enableMicrophone == null) enableMicrophone = true;
    }
}
