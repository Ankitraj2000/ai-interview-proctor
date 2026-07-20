package com.proctor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "question_sets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 20)
    private String difficulty;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "total_marks")
    private Integer totalMarks;

    @Column(name = "passing_marks")
    private Integer passingMarks;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "randomize_order")
    private Boolean randomizeOrder;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "question_set_questions",
        joinColumns = @JoinColumn(name = "question_set_id"),
        inverseJoinColumns = @JoinColumn(name = "question_id")
    )
    private List<Question> questions = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (totalQuestions == null) totalQuestions = questions != null ? questions.size() : 0;
        if (totalMarks == null) totalMarks = 100;
        if (passingMarks == null) passingMarks = 40;
        if (durationMinutes == null) durationMinutes = 60;
        if (randomizeOrder == null) randomizeOrder = true;
    }
}
