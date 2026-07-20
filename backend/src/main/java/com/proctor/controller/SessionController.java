package com.proctor.controller;

import com.proctor.dto.AiEventDto;
import com.proctor.dto.CandidateSessionDto;
import com.proctor.dto.CheatingLogDto;
import com.proctor.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/sessions")
@Tag(name = "Session Telemetry & Events", description = "Endpoints to start/submit sessions, log browser violations and register AI events")
@SecurityRequirement(name = "Bearer Authentication")
public class SessionController {

    @Autowired
    private SessionService sessionService;

    @PostMapping("/start/{interviewId}")
    @Operation(summary = "Initialize a live proctored session (Candidate access point)")
    public ResponseEntity<CandidateSessionDto> startSession(
            @PathVariable Long interviewId,
            Principal principal,
            HttpServletRequest request) {
        
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        String userAgent = request.getHeader("User-Agent");

        CandidateSessionDto session = sessionService.startSession(interviewId, principal.getName(), ip, userAgent);
        return ResponseEntity.ok(session);
    }

    @PostMapping("/{sessionId}/violation")
    @Operation(summary = "Log browser-side client behavior violation (e.g. TAB_SWITCH, FULLSCREEN_EXIT)")
    public ResponseEntity<CheatingLogDto> logViolation(
            @PathVariable Long sessionId,
            @RequestParam String violationType,
            @RequestParam String details) {
        
        CheatingLogDto log = sessionService.logBrowserViolation(sessionId, violationType, details);
        return ResponseEntity.ok(log);
    }

    @PostMapping("/{sessionId}/ai-event")
    @Operation(summary = "Register AI vision/audio classification telemetry anomaly")
    public ResponseEntity<AiEventDto> logAiEvent(
            @PathVariable Long sessionId,
            @RequestParam String eventType,
            @RequestParam Double confidence,
            @RequestParam(required = false) String screenshotPath) {
        
        AiEventDto event = sessionService.logAiEvent(sessionId, eventType, confidence, screenshotPath);
        return ResponseEntity.ok(event);
    }

    @PostMapping("/{sessionId}/submit")
    @Operation(summary = "Explicitly submit session answers and stop proctoring feeds")
    public ResponseEntity<CandidateSessionDto> submitSession(@PathVariable Long sessionId) {
        CandidateSessionDto session = sessionService.submitSession(sessionId);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/{sessionId}")
    @Operation(summary = "Get candidate session configuration and warning tallies")
    public ResponseEntity<CandidateSessionDto> getSession(@PathVariable Long sessionId) {
        CandidateSessionDto session = sessionService.getSessionById(sessionId);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/{sessionId}/cheating-logs")
    @Operation(summary = "Get list of logged browser client behavior logs")
    public ResponseEntity<List<CheatingLogDto>> getCheatingLogs(@PathVariable Long sessionId) {
        List<CheatingLogDto> logs = sessionService.getSessionCheatingLogs(sessionId);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{sessionId}/ai-events")
    @Operation(summary = "Get list of logged machine learning sensor anomalies")
    public ResponseEntity<List<AiEventDto>> getAiEvents(@PathVariable Long sessionId) {
        List<AiEventDto> events = sessionService.getSessionAiEvents(sessionId);
        return ResponseEntity.ok(events);
    }

    @PostMapping("/run-code")
    @Operation(summary = "Run and evaluate candidate code snippet against test cases")
    public ResponseEntity<java.util.Map<String, Object>> runCode(@RequestBody java.util.Map<String, String> request) {
        String language = request.get("language");
        String code = request.get("code");
        java.util.Map<String, Object> result = sessionService.executeCode(language, code);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{sessionId}/feedback")
    @Operation(summary = "Submit candidate evaluation rating, feedback notes, and hiring decision")
    public ResponseEntity<java.util.Map<String, Object>> submitFeedback(
            @PathVariable Long sessionId,
            @RequestBody java.util.Map<String, Object> feedback) {
        return ResponseEntity.ok(sessionService.submitFeedback(sessionId, feedback));
    }

    @GetMapping("/{sessionId}/feedback")
    @Operation(summary = "Get candidate evaluation rating and hiring feedback for a session")
    public ResponseEntity<java.util.Map<String, Object>> getFeedback(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getFeedback(sessionId));
    }

    @GetMapping("/interview/{interviewId}")
    @Operation(summary = "Get list of candidate sessions for a specific interview ID")
    public ResponseEntity<List<CandidateSessionDto>> getSessionsByInterview(@PathVariable Long interviewId) {
        List<CandidateSessionDto> sessions = sessionService.getSessionsByInterviewId(interviewId);
        return ResponseEntity.ok(sessions);
    }
}
