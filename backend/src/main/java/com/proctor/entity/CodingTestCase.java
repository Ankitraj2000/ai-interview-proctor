package com.proctor.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coding_test_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingTestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "sample_input", columnDefinition = "TEXT")
    private String sampleInput;

    @Column(name = "sample_output", columnDefinition = "TEXT")
    private String sampleOutput;

    @Column(name = "is_hidden")
    private Boolean isHidden;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "order_index")
    private Integer orderIndex;
}
