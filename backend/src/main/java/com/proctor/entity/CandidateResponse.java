package com.proctor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_responses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @Column(name = "interview_id", nullable = false)
    private Long interviewId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @Column(name = "response_text", columnDefinition = "TEXT")
    private String responseText;

    @Column(name = "selected_options", length = 255)
    private String selectedOptions;

    @Column(name = "submitted_code", columnDefinition = "TEXT")
    private String submittedCode;

    @Column(name = "programming_language", length = 30)
    private String programmingLanguage;

    @Column
    private Double score;

    @Column(length = 30)
    private String status; // SUBMITTED, EVALUATED, PENDING

    @Column(name = "evaluator_feedback", columnDefinition = "TEXT")
    private String evaluatorFeedback;

    @Column(name = "ai_feedback", columnDefinition = "TEXT")
    private String aiFeedback;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;
}
