package com.proctor.repository;

import com.proctor.entity.EvaluationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EvaluationResultRepository extends JpaRepository<EvaluationResult, Long> {
    Optional<EvaluationResult> findBySessionId(Long sessionId);
}
