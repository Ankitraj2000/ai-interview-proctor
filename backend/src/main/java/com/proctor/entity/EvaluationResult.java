package com.proctor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false, unique = true)
    private Long sessionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @Column(name = "total_score", nullable = false)
    private Double totalScore;

    @Column(name = "max_score", nullable = false)
    private Double maxScore;

    @Column(name = "passing_marks", nullable = false)
    private Double passingMarks;

    @Column(nullable = false)
    private Boolean passed;

    @Column(name = "evaluation_type", length = 30)
    private String evaluationType;

    @CreationTimestamp
    @Column(name = "evaluated_at", nullable = false, updatable = false)
    private LocalDateTime evaluatedAt;
}
