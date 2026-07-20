package com.proctor.repository;

import com.proctor.entity.CodingTestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CodingTestCaseRepository extends JpaRepository<CodingTestCase, Long> {
    List<CodingTestCase> findByQuestionIdOrderByOrderIndexAsc(Long questionId);
}
