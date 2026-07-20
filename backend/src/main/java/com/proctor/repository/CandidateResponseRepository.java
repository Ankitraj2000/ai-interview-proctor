package com.proctor.repository;

import com.proctor.entity.CandidateResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CandidateResponseRepository extends JpaRepository<CandidateResponse, Long> {
    List<CandidateResponse> findBySessionId(Long sessionId);
    List<CandidateResponse> findByInterviewIdAndCandidateId(Long interviewId, Long candidateId);
    Optional<CandidateResponse> findBySessionIdAndQuestionId(Long sessionId, Long questionId);
}
