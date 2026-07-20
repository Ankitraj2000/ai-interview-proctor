package com.proctor.controller;

import com.proctor.dto.AiEventDto;
import com.proctor.dto.CandidateSessionDto;
import com.proctor.dto.CheatingLogDto;
import com.proctor.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.security.Principal;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SessionControllerTest {

    @Mock
    private SessionService sessionService;

    @InjectMocks
    private SessionController sessionController;

    private CandidateSessionDto sessionDto;
    private CheatingLogDto cheatingLogDto;
    private AiEventDto aiEventDto;

    @BeforeEach
    public void setUp() {
        sessionDto = new CandidateSessionDto();
        sessionDto.setId(100L);
        sessionDto.setInterviewId(10L);
        sessionDto.setStatus("ACTIVE");
        sessionDto.setWarningCount(1);

        cheatingLogDto = new CheatingLogDto();
        cheatingLogDto.setId(200L);
        cheatingLogDto.setLogType("TAB_SWITCH");
        cheatingLogDto.setMessage("Tab switched");

        aiEventDto = new AiEventDto();
        aiEventDto.setId(300L);
        aiEventDto.setEventType("PHONE_DETECTED");
        aiEventDto.setConfidence(0.95);
    }

    @Test
    public void testStartSession_Success() {
        Principal principal = mock(Principal.class);
        HttpServletRequest request = mock(HttpServletRequest.class);

        when(principal.getName()).thenReturn("candidate@email.com");
        when(request.getHeader("X-Forwarded-For")).thenReturn("1.2.3.4");
        when(request.getHeader("User-Agent")).thenReturn("Mozilla");
        when(sessionService.startSession(10L, "candidate@email.com", "1.2.3.4", "Mozilla")).thenReturn(sessionDto);

        ResponseEntity<CandidateSessionDto> response = sessionController.startSession(10L, principal, request);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(sessionDto, response.getBody());
    }

    @Test
    public void testLogViolation_Success() {
        when(sessionService.logBrowserViolation(100L, "TAB_SWITCH", "Tab switched")).thenReturn(cheatingLogDto);

        ResponseEntity<CheatingLogDto> response = sessionController.logViolation(100L, "TAB_SWITCH", "Tab switched");

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(cheatingLogDto, response.getBody());
    }

    @Test
    public void testLogAiEvent_Success() {
        when(sessionService.logAiEvent(100L, "PHONE_DETECTED", 0.95, "path/to/screenshot")).thenReturn(aiEventDto);

        ResponseEntity<AiEventDto> response = sessionController.logAiEvent(100L, "PHONE_DETECTED", 0.95, "path/to/screenshot");

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(aiEventDto, response.getBody());
    }

    @Test
    public void testSubmitSession_Success() {
        sessionDto.setStatus("SUBMITTED");
        when(sessionService.submitSession(100L)).thenReturn(sessionDto);

        ResponseEntity<CandidateSessionDto> response = sessionController.submitSession(100L);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("SUBMITTED", response.getBody().getStatus());
    }

    @Test
    public void testGetSession_Success() {
        when(sessionService.getSessionById(100L)).thenReturn(sessionDto);

        ResponseEntity<CandidateSessionDto> response = sessionController.getSession(100L);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(sessionDto, response.getBody());
    }

    @Test
    public void testGetCheatingLogs_Success() {
        when(sessionService.getSessionCheatingLogs(100L)).thenReturn(Collections.singletonList(cheatingLogDto));

        ResponseEntity<List<CheatingLogDto>> response = sessionController.getCheatingLogs(100L);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
        assertEquals("TAB_SWITCH", response.getBody().get(0).getLogType());
    }

    @Test
    public void testGetAiEvents_Success() {
        when(sessionService.getSessionAiEvents(100L)).thenReturn(Collections.singletonList(aiEventDto));

        ResponseEntity<List<AiEventDto>> response = sessionController.getAiEvents(100L);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
        assertEquals("PHONE_DETECTED", response.getBody().get(0).getEventType());
    }

    @Test
    public void testGetSessionsByInterview_Success() {
        when(sessionService.getSessionsByInterviewId(10L)).thenReturn(Collections.singletonList(sessionDto));

        ResponseEntity<List<CandidateSessionDto>> response = sessionController.getSessionsByInterview(10L);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
    }
}
