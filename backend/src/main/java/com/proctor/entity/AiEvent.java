package com.proctor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private CandidateSession session;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType; // FACE_NOT_FOUND, MULTIPLE_FACES, PHONE_DETECTED, etc.

    @Column(nullable = false)
    private Double confidence;

    @Column(name = "screenshot_path", length = 255)
    private String screenshotPath;
}
