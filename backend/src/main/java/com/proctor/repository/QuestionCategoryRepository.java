package com.proctor.repository;

import com.proctor.entity.QuestionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface QuestionCategoryRepository extends JpaRepository<QuestionCategory, Long> {
    Optional<QuestionCategory> findByNameIgnoreCase(String name);
}
