package com.proctor.service;

import com.proctor.dto.CandidateSessionDto;
import com.proctor.dto.CheatingLogDto;
import com.proctor.entity.CandidateSession;
import com.proctor.entity.Interview;
import com.proctor.entity.User;
import com.proctor.mapper.ProctorMapper;
import com.proctor.repository.CandidateSessionRepository;
import com.proctor.repository.CheatingLogRepository;
import com.proctor.repository.InterviewRepository;
import com.proctor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SessionServiceTest {

    @Mock
    private CandidateSessionRepository sessionRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CheatingLogRepository cheatingLogRepository;

    @Mock
    private ProctorMapper mapper;

    @InjectMocks
    private SessionService sessionService;

    private User candidate;
    private Interview interview;
    private CandidateSession session;
    private CandidateSessionDto sessionDto;

    @BeforeEach
    public void setUp() {
        candidate = User.builder()
                .id(1L)
                .email("candidate@email.com")
                .firstName("Jane")
                .lastName("Doe")
                .build();

        interview = Interview.builder()
                .id(10L)
                .title("Software Engineer Test")
                .candidate(candidate)
                .status("SCHEDULED")
                .build();

        session = CandidateSession.builder()
                .id(100L)
                .interview(interview)
                .user(candidate)
                .status("ACTIVE")
                .warningCount(0)
                .fullscreenExits(0)
                .tabSwitches(0)
                .build();

        sessionDto = new CandidateSessionDto();
        sessionDto.setId(100L);
        sessionDto.setInterviewId(10L);
        sessionDto.setStatus("ACTIVE");
        sessionDto.setWarningCount(0);
    }

    @Test
    public void testStartSession_Success() {
        when(interviewRepository.findById(10L)).thenReturn(Optional.of(interview));
        when(userRepository.findByEmail("candidate@email.com")).thenReturn(Optional.of(candidate));
        when(sessionRepository.save(any(CandidateSession.class))).thenReturn(session);
        when(mapper.toDto(any(CandidateSession.class))).thenReturn(sessionDto);

        CandidateSessionDto result = sessionService.startSession(10L, "candidate@email.com", "127.0.0.1", "Mozilla/5.0");

        assertNotNull(result);
        assertEquals("ACTIVE", result.getStatus());
        verify(sessionRepository, times(1)).save(any(CandidateSession.class));
        verify(interviewRepository, times(1)).save(any(Interview.class));
    }

    @Test
    public void testLogBrowserViolation_IncrementsWarnings() {
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(CandidateSession.class))).thenReturn(session);
        when(cheatingLogRepository.save(any(com.proctor.entity.CheatingLog.class))).thenAnswer(i -> i.getArgument(0));
        when(mapper.toDto(any(com.proctor.entity.CheatingLog.class))).thenReturn(new CheatingLogDto());

        sessionService.logBrowserViolation(100L, "TAB_SWITCH", "Tab blurred");

        assertEquals(1, session.getWarningCount());
        assertEquals(1, session.getTabSwitches());
        assertEquals("ACTIVE", session.getStatus());
    }

    @Test
    public void testLogBrowserViolation_SuspendsAfterThreeWarnings() {
        session.setWarningCount(2); // Two warnings already exist
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(CandidateSession.class))).thenReturn(session);
        when(cheatingLogRepository.save(any(com.proctor.entity.CheatingLog.class))).thenAnswer(i -> i.getArgument(0));
        when(mapper.toDto(any(com.proctor.entity.CheatingLog.class))).thenReturn(new CheatingLogDto());

        sessionService.logBrowserViolation(100L, "FULLSCREEN_EXIT", "Exited fullscreen");

        assertEquals(3, session.getWarningCount());
        assertEquals("SUSPENDED", session.getStatus());
        assertNotNull(session.getEndedAt());
    }
}
