package com.proctor.repository;

import com.proctor.entity.QuestionSet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionSetRepository extends JpaRepository<QuestionSet, Long> {
    List<QuestionSet> findByCategoryIgnoreCase(String category);
    List<QuestionSet> findByDifficultyIgnoreCase(String difficulty);
}
