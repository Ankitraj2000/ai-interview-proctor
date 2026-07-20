package com.proctor.controller;

import com.proctor.entity.QuestionSet;
import com.proctor.service.QuestionSetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/question-sets")
@Tag(name = "Question Sets", description = "Endpoints for managing question paper sets")
@SecurityRequirement(name = "Bearer Authentication")
public class QuestionSetController {

    @Autowired
    private QuestionSetService questionSetService;

    @GetMapping
    @Operation(summary = "Get all question sets")
    public ResponseEntity<List<QuestionSet>> getAllQuestionSets() {
        return ResponseEntity.ok(questionSetService.getAllQuestionSets());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get question set by ID")
    public ResponseEntity<QuestionSet> getQuestionSetById(@PathVariable Long id) {
        return ResponseEntity.ok(questionSetService.getQuestionSetById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Create or update a question set")
    public ResponseEntity<QuestionSet> createQuestionSet(@RequestBody QuestionSet questionSet) {
        return ResponseEntity.ok(questionSetService.saveQuestionSet(questionSet));
    }

    @PostMapping("/{id}/clone")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Clone a question set")
    public ResponseEntity<QuestionSet> cloneQuestionSet(@PathVariable Long id) {
        return ResponseEntity.ok(questionSetService.cloneQuestionSet(id));
    }

    @PostMapping("/generate-random")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Generate random question set paper")
    public ResponseEntity<QuestionSet> generateRandomSet(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String category = (String) payload.get("category");
        String difficulty = (String) payload.get("difficulty");
        String type = (String) payload.get("type");
        int count = payload.get("count") != null ? Integer.parseInt(payload.get("count").toString()) : 5;
        int duration = payload.get("duration") != null ? Integer.parseInt(payload.get("duration").toString()) : 60;

        return ResponseEntity.ok(questionSetService.generateRandomQuestionSet(name, category, difficulty, type, count, duration));
    }

    @PutMapping("/{setId}/questions/{questionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Add a question to a question set")
    public ResponseEntity<QuestionSet> addQuestionToSet(@PathVariable Long setId, @PathVariable Long questionId) {
        return ResponseEntity.ok(questionSetService.addQuestionToSet(setId, questionId));
    }

    @DeleteMapping("/{setId}/questions/{questionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Remove a question from a question set")
    public ResponseEntity<QuestionSet> removeQuestionFromSet(@PathVariable Long setId, @PathVariable Long questionId) {
        return ResponseEntity.ok(questionSetService.removeQuestionFromSet(setId, questionId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Delete a question set")
    public ResponseEntity<String> deleteQuestionSet(@PathVariable Long id) {
        questionSetService.deleteQuestionSet(id);
        return ResponseEntity.ok("Question set deleted successfully.");
    }
}
