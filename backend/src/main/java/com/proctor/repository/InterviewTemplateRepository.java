package com.proctor.repository;

import com.proctor.entity.InterviewTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InterviewTemplateRepository extends JpaRepository<InterviewTemplate, Long> {
    Optional<InterviewTemplate> findByNameIgnoreCase(String name);
}
