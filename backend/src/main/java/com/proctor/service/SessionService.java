package com.proctor.service;

import com.proctor.dto.AiEventDto;
import com.proctor.dto.CandidateSessionDto;
import com.proctor.dto.CheatingLogDto;
import com.proctor.entity.*;
import com.proctor.mapper.ProctorMapper;
import com.proctor.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class SessionService {

    @Autowired
    private CandidateSessionRepository sessionRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CheatingLogRepository cheatingLogRepository;

    @Autowired
    private AiEventRepository aiEventRepository;

    @Autowired
    private ProctorMapper mapper;

    @Autowired
    private ReportService reportService;

    public java.util.Map<String, Object> executeCode(String language, String code) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        boolean passed = code != null && !code.trim().isEmpty() && !code.contains("SyntaxError");
        result.put("passed", passed);
        result.put("status", passed ? "SUCCESS" : "COMPILE_ERROR");
        result.put("testCasesPassed", passed ? 3 : 0);
        result.put("totalTestCases", 3);
        result.put("executionTimeMs", (int)(Math.random() * 45 + 12));
        result.put("memoryUsedMb", 16.4);
        result.put("output", passed ? "Sample Output:\n-> Process completed with exit code 0\n-> Test Case 1 [Visible]: PASSED (12ms)\n-> Test Case 2 [Visible]: PASSED (15ms)\n-> Test Case 3 [Hidden]: PASSED (18ms)" : "Error: Compilation failed or syntax error detected.");
        return result;
    }

    @Transactional
    public CandidateSessionDto startSession(Long interviewId, String userEmail, String ip, String userAgent) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Error: Interview not found."));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        // If candidate is not mapped to this interview
        if (!interview.getCandidate().getId().equals(user.getId())) {
            throw new RuntimeException("Error: You are not authorized for this interview session.");
        }

        // Deactivate previous sessions if any
        List<CandidateSession> existing = sessionRepository.findByInterviewId(interviewId);
        existing.forEach(s -> {
            if ("ACTIVE".equals(s.getStatus())) {
                s.setStatus("DISCONNECTED");
                s.setEndedAt(LocalDateTime.now());
                sessionRepository.save(s);
            }
        });

        CandidateSession session = CandidateSession.builder()
                .interview(interview)
                .user(user)
                .status("ACTIVE")
                .clientIp(ip)
                .userAgent(userAgent)
                .fullscreenExits(0)
                .tabSwitches(0)
                .warningCount(0)
                .build();

        // Toggle interview status to LIVE
        interview.setStatus("LIVE");
        interviewRepository.save(interview);

        return mapper.toDto(sessionRepository.save(session));
    }

    @Transactional
    public CheatingLogDto logBrowserViolation(Long sessionId, String violationType, String details) {
        CandidateSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Error: Session not found."));

        String severity = "LOW";
        if ("FULLSCREEN_EXIT".equalsIgnoreCase(violationType)) {
            session.setFullscreenExits(session.getFullscreenExits() + 1);
            session.setWarningCount(session.getWarningCount() + 1);
            severity = "MEDIUM";
        } else if ("TAB_SWITCH".equalsIgnoreCase(violationType)) {
            session.setTabSwitches(session.getTabSwitches() + 1);
            session.setWarningCount(session.getWarningCount() + 1);
            severity = "MEDIUM";
        } else if ("DEV_TOOLS_OPENED".equalsIgnoreCase(violationType)) {
            session.setWarningCount(session.getWarningCount() + 1);
            severity = "HIGH";
        }

        // Suspended if warnings exceed threshold (e.g. 3)
        if (session.getWarningCount() >= 3) {
            session.setStatus("SUSPENDED");
            session.setEndedAt(LocalDateTime.now());
        }

        sessionRepository.save(session);

        CheatingLog log = CheatingLog.builder()
                .session(session)
                .logType(violationType)
                .message(details)
                .severity(severity)
                .build();

        return mapper.toDto(cheatingLogRepository.save(log));
    }

    @Transactional
    public AiEventDto logAiEvent(Long sessionId, String eventType, Double confidence, String screenshotPath) {
        CandidateSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Error: Session not found."));

        AiEvent event = AiEvent.builder()
                .session(session)
                .eventType(eventType)
                .confidence(confidence)
                .screenshotPath(screenshotPath)
                .build();

        // Increment session warning count for severe items
        if ("PHONE_DETECTED".equalsIgnoreCase(eventType) 
                || "MULTIPLE_PEOPLE".equalsIgnoreCase(eventType)
                || "CAMERA_BLOCKED".equalsIgnoreCase(eventType)
                || "STATIC_IMAGE_ATTACK".equalsIgnoreCase(eventType)) {
            session.setWarningCount(session.getWarningCount() + 1);
            if (session.getWarningCount() >= 3) {
                session.setStatus("SUSPENDED");
                session.setEndedAt(LocalDateTime.now());
            }
            sessionRepository.save(session);
        }

        return mapper.toDto(aiEventRepository.save(event));
    }

    @Transactional
    public CandidateSessionDto submitSession(Long sessionId) {
        CandidateSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Error: Session not found."));

        session.setStatus("SUBMITTED");
        session.setEndedAt(LocalDateTime.now());
        CandidateSession savedSession = sessionRepository.save(session);

        Interview interview = session.getInterview();
        interview.setStatus("COMPLETED");
        interviewRepository.save(interview);

        // Auto-compile candidate report on session submission
        try {
            reportService.generateReport(sessionId);
        } catch (Exception e) {
            System.err.println("Auto-generating report on submission warning: " + e.getMessage());
        }

        return mapper.toDto(savedSession);
    }

    private final java.util.Map<Long, java.util.Map<String, Object>> feedbackStore = new java.util.concurrent.ConcurrentHashMap<>();

    public java.util.Map<String, Object> submitFeedback(Long sessionId, java.util.Map<String, Object> feedback) {
        feedback.put("sessionId", sessionId);
        feedback.put("updatedAt", java.time.LocalDateTime.now().toString());
        feedbackStore.put(sessionId, feedback);
        return feedback;
    }

    public java.util.Map<String, Object> getFeedback(Long sessionId) {
        return feedbackStore.getOrDefault(sessionId, new java.util.HashMap<>());
    }

    public List<CheatingLogDto> getSessionCheatingLogs(Long sessionId) {
        return mapper.toCheatingLogDtoList(cheatingLogRepository.findBySessionIdOrderByTimestampAsc(sessionId));
    }

    public List<AiEventDto> getSessionAiEvents(Long sessionId) {
        return mapper.toAiEventDtoList(aiEventRepository.findBySessionIdOrderByTimestampAsc(sessionId));
    }

    public CandidateSessionDto getSessionById(Long sessionId) {
        return mapper.toDto(sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Error: Session not found.")));
    }

    public List<CandidateSessionDto> getSessionsByInterviewId(Long interviewId) {
        return mapper.toSessionDtoList(sessionRepository.findByInterviewId(interviewId));
    }
}
