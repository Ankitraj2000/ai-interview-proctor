package com.proctor.controller;

import com.proctor.entity.CandidateResponse;
import com.proctor.entity.EvaluationResult;
import com.proctor.service.EvaluationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/evaluations")
@Tag(name = "Assessment Evaluation", description = "Endpoints for candidate response submission and evaluation")
@SecurityRequirement(name = "Bearer Authentication")
public class EvaluationController {

    @Autowired
    private EvaluationService evaluationService;

    @PostMapping("/responses")
    @Operation(summary = "Submit answer for a question")
    public ResponseEntity<CandidateResponse> submitResponse(@RequestBody Map<String, Object> payload) {
        Long sessionId = Long.parseLong(payload.get("sessionId").toString());
        Long interviewId = Long.parseLong(payload.get("interviewId").toString());
        Long questionId = Long.parseLong(payload.get("questionId").toString());
        Long candidateId = Long.parseLong(payload.get("candidateId").toString());

        String responseText = (String) payload.get("responseText");
        String selectedOptions = (String) payload.get("selectedOptions");
        String submittedCode = (String) payload.get("submittedCode");
        String language = (String) payload.get("programmingLanguage");

        return ResponseEntity.ok(evaluationService.submitResponse(sessionId, interviewId, questionId, candidateId,
                responseText, selectedOptions, submittedCode, language));
    }

    @GetMapping("/responses/session/{sessionId}")
    @Operation(summary = "Get responses for session")
    public ResponseEntity<List<CandidateResponse>> getSessionResponses(@PathVariable Long sessionId) {
        return ResponseEntity.ok(evaluationService.getSessionResponses(sessionId));
    }

    @PostMapping("/calculate/session/{sessionId}")
    @Operation(summary = "Calculate final evaluation score")
    public ResponseEntity<EvaluationResult> calculateEvaluation(@PathVariable Long sessionId, @RequestParam Long candidateId) {
        return ResponseEntity.ok(evaluationService.evaluateSession(sessionId, candidateId));
    }

    @GetMapping("/results/session/{sessionId}")
    @Operation(summary = "Get evaluation results")
    public ResponseEntity<EvaluationResult> getSessionResult(@PathVariable Long sessionId) {
        return ResponseEntity.ok(evaluationService.getSessionResult(sessionId));
    }
}
