package com.proctor.repository;

import com.proctor.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByIsArchivedFalse();

    List<Question> findByIsArchived(Boolean isArchived);

    @Query("SELECT q FROM Question q WHERE (:archived IS NULL OR q.isArchived = :archived) " +
           "AND (:category IS NULL OR LOWER(q.category) = LOWER(:category)) " +
           "AND (:difficulty IS NULL OR LOWER(q.difficulty) = LOWER(:difficulty)) " +
           "AND (:type IS NULL OR LOWER(q.type) = LOWER(:type)) " +
           "AND (:search IS NULL OR LOWER(q.text) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Question> findFilteredQuestions(
        @Param("category") String category,
        @Param("difficulty") String difficulty,
        @Param("type") String type,
        @Param("search") String search,
        @Param("archived") Boolean archived
    );

    @Query(value = "SELECT * FROM questions q WHERE q.is_archived = false " +
           "AND (:category IS NULL OR LOWER(q.category) = LOWER(:category)) " +
           "AND (:difficulty IS NULL OR LOWER(q.difficulty) = LOWER(:difficulty)) " +
           "AND (:type IS NULL OR LOWER(q.type) = LOWER(:type)) " +
           "ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestions(
        @Param("category") String category,
        @Param("difficulty") String difficulty,
        @Param("type") String type,
        @Param("limit") int limit
    );
}
