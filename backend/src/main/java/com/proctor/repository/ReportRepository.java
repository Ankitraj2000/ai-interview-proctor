package com.proctor.repository;

import com.proctor.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Optional<Report> findBySessionId(Long sessionId);
    List<Report> findByCandidateId(Long candidateId);
}
