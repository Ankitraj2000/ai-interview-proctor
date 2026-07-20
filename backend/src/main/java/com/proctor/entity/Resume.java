package com.proctor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "resume")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(name = "file_path", nullable = false, length = 255)
    private String filePath;

    @Column(name = "file_name", nullable = false, length = 100)
    private String fileName;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Lob
    @Column(name = "parsed_text", columnDefinition = "LONGTEXT")
    private String parsedText;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
}
