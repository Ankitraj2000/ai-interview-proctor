package com.proctor.repository;

import com.proctor.entity.InterviewSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InterviewScheduleRepository extends JpaRepository<InterviewSchedule, Long> {
    Optional<InterviewSchedule> findByInterviewId(Long interviewId);
}
