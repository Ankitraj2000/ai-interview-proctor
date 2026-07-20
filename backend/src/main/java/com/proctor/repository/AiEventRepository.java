package com.proctor.repository;

import com.proctor.entity.AiEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AiEventRepository extends JpaRepository<AiEvent, Long> {
    List<AiEvent> findBySessionIdOrderByTimestampAsc(Long sessionId);
}
