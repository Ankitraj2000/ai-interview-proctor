package com.proctor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(nullable = false, length = 30)
    private String type; // MCQ, SUBJECTIVE, CODING, SQL, DEBUGGING

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 20)
    private String difficulty; // EASY, MEDIUM, HARD

    @Column(length = 100)
    private String topic;

    @Column(name = "estimated_time_minutes")
    private Integer estimatedTimeMinutes;

    @Column
    private Integer marks;

    @Column(name = "negative_marks")
    private Double negativeMarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @Column
    private Integer version;

    @Column(name = "is_archived")
    private Boolean isArchived;

    @Column(columnDefinition = "TEXT")
    private String options; // Comma or newline or JSON separated options

    @Column(name = "correct_answer", columnDefinition = "TEXT")
    private String correctAnswer;

    @Column(name = "mcq_type", length = 20)
    private String mcqType; // SINGLE, MULTIPLE

    @Column(name = "starter_code", columnDefinition = "TEXT")
    private String starterCode;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "code_snippet", columnDefinition = "TEXT")
    private String codeSnippet;

    @Column(name = "min_words")
    private Integer minWords;

    @Column(name = "max_words")
    private Integer maxWords;

    @Column(name = "evaluation_type", length = 30)
    private String evaluationType; // AUTO, MANUAL, AI_ASSISTED

    @Builder.Default
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<CodingTestCase> testCases = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (title == null || title.isBlank()) {
            title = text != null && text.length() > 50 ? text.substring(0, 47) + "..." : text;
        }
        if (topic == null) topic = "General";
        if (estimatedTimeMinutes == null) estimatedTimeMinutes = 10;
        if (marks == null) marks = 10;
        if (negativeMarks == null) negativeMarks = 0.0;
        if (version == null) version = 1;
        if (isArchived == null) isArchived = false;
        if (mcqType == null) mcqType = "SINGLE";
        if (minWords == null) minWords = 0;
        if (maxWords == null) maxWords = 1000;
        if (evaluationType == null) evaluationType = "AUTO";
    }
}
