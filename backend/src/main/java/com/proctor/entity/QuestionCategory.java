package com.proctor.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "question_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(name = "is_custom")
    private Boolean isCustom;
}
