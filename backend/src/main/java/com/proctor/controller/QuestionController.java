package com.proctor.controller;

import com.proctor.entity.Question;
import com.proctor.entity.QuestionCategory;
import com.proctor.service.QuestionCategoryService;
import com.proctor.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/questions")
@Tag(name = "Question Bank", description = "Endpoints for administering the systemic Question Bank")
@SecurityRequirement(name = "Bearer Authentication")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @Autowired
    private QuestionCategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get questions with optional filters")
    public ResponseEntity<List<Question>> getAllQuestions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") Boolean archived) {
        return ResponseEntity.ok(questionService.getAllQuestions(category, difficulty, type, search, archived));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get question by ID")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Create a new question")
    public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
        return ResponseEntity.ok(questionService.saveQuestion(question));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Update an existing question")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @RequestBody Question q) {
        Question existing = questionService.getQuestionById(id);
        existing.setTitle(q.getTitle());
        existing.setText(q.getText());
        existing.setType(q.getType());
        existing.setCategory(q.getCategory());
        existing.setDifficulty(q.getDifficulty());
        existing.setTopic(q.getTopic());
        existing.setEstimatedTimeMinutes(q.getEstimatedTimeMinutes());
        existing.setMarks(q.getMarks());
        existing.setNegativeMarks(q.getNegativeMarks());
        existing.setOptions(q.getOptions());
        existing.setCorrectAnswer(q.getCorrectAnswer());
        existing.setMcqType(q.getMcqType());
        existing.setStarterCode(q.getStarterCode());
        existing.setConstraints(q.getConstraints());
        existing.setExplanation(q.getExplanation());
        existing.setImageUrl(q.getImageUrl());
        existing.setCodeSnippet(q.getCodeSnippet());
        existing.setMinWords(q.getMinWords());
        existing.setMaxWords(q.getMaxWords());
        existing.setEvaluationType(q.getEvaluationType());
        if (q.getTestCases() != null) {
            existing.setTestCases(q.getTestCases());
        }
        return ResponseEntity.ok(questionService.saveQuestion(existing));
    }

    @PostMapping("/{id}/duplicate")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Duplicate / Clone a question")
    public ResponseEntity<Question> duplicateQuestion(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.duplicateQuestion(id));
    }

    @PostMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Archive a question")
    public ResponseEntity<Question> archiveQuestion(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.archiveQuestion(id));
    }

    @PostMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Restore an archived question")
    public ResponseEntity<Question> restoreQuestion(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.restoreQuestion(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Delete a question permanently")
    public ResponseEntity<String> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok("Question deleted successfully.");
    }

    @PostMapping("/bulk-delete")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Bulk delete questions by IDs")
    public ResponseEntity<String> bulkDelete(@RequestBody List<Long> ids) {
        questionService.bulkDelete(ids);
        return ResponseEntity.ok("Bulk delete executed successfully.");
    }

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Import questions from CSV text")
    public ResponseEntity<String> importCsv(@RequestBody String csvContent) {
        questionService.importQuestionsFromCsv(csvContent);
        return ResponseEntity.ok("CSV Questions imported successfully.");
    }

    @PostMapping("/import-json")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Import questions from JSON payload")
    public ResponseEntity<String> importJson(@RequestBody String jsonContent) {
        questionService.importQuestionsFromJson(jsonContent);
        return ResponseEntity.ok("JSON Questions imported successfully.");
    }

    @GetMapping("/export")
    @Operation(summary = "Export questions to CSV, Excel, or JSON format")
    public ResponseEntity<byte[]> exportQuestions(
            @RequestParam(defaultValue = "csv") String format,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String type) {

        byte[] content = questionService.exportQuestions(format, category, difficulty, type);
        String filename = "question_bank_export." + ("json".equalsIgnoreCase(format) ? "json" : "csv");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType("json".equalsIgnoreCase(format) ? MediaType.APPLICATION_JSON : MediaType.TEXT_PLAIN)
                .body(content);
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all question categories")
    public ResponseEntity<List<QuestionCategory>> getCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Create custom category")
    public ResponseEntity<QuestionCategory> createCategory(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(categoryService.createCategory(payload.get("name"), payload.get("description")));
    }

    @GetMapping("/random")
    @Operation(summary = "Generate random questions based on parameters")
    public ResponseEntity<List<Question>> getRandomQuestions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(questionService.getRandomQuestions(category, difficulty, type, limit));
    }
}
