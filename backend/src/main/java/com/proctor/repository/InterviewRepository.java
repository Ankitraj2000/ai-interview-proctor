package com.proctor.repository;

import com.proctor.entity.Interview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    Optional<Interview> findByCode(String code);
    
    Page<Interview> findByCandidateId(Long candidateId, Pageable pageable);
    
    Page<Interview> findByCreatorId(Long creatorId, Pageable pageable);
    
    @Query("SELECT i FROM Interview i WHERE " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Interview> searchInterviews(@Param("status") String status, @Param("search") String search, Pageable pageable);
}
