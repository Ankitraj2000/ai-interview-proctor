package com.proctor.repository;

import com.proctor.entity.CandidateSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateSessionRepository extends JpaRepository<CandidateSession, Long> {
    Optional<CandidateSession> findFirstByInterviewIdAndUserIdOrderByStartedAtDesc(Long interviewId, Long userId);
    List<CandidateSession> findByInterviewId(Long interviewId);
    List<CandidateSession> findByUserId(Long userId);
}
