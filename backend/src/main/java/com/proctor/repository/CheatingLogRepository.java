package com.proctor.repository;

import com.proctor.entity.CheatingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CheatingLogRepository extends JpaRepository<CheatingLog, Long> {
    List<CheatingLog> findBySessionIdOrderByTimestampAsc(Long sessionId);
}
