package com.proctor.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 20)
    private String difficulty;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "interview_type", nullable = false, length = 50)
    private String interviewType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_set_id")
    private QuestionSet questionSet;

    @Column(name = "enable_ai_proctoring")
    private Boolean enableAiProctoring;

    @Column(name = "enable_browser_lock")
    private Boolean enableBrowserLock;

    @Column(name = "enable_webcam")
    private Boolean enableWebcam;

    @Column(name = "enable_microphone")
    private Boolean enableMicrophone;
}
