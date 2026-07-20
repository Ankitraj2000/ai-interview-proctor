package com.proctor.service;

import com.proctor.dto.ReportDto;
import com.proctor.entity.*;
import com.proctor.mapper.ProctorMapper;
import com.proctor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private CandidateSessionRepository sessionRepository;

    @Mock
    private AiEventRepository aiEventRepository;

    @Mock
    private CheatingLogRepository cheatingLogRepository;

    @Mock
    private ProctorMapper mapper;

    @InjectMocks
    private ReportService reportService;

    private User candidate;
    private Interview interview;
    private CandidateSession session;
    private List<AiEvent> aiEvents;
    private List<CheatingLog> cheatingLogs;
    private Report report;
    private ReportDto reportDto;

    @BeforeEach
    public void setUp() {
        ReflectionTestUtils.setField(reportService, "reportsDir", "./target/test-reports");

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
                .code("CODE12")
                .status("SCHEDULED")
                .build();

        session = CandidateSession.builder()
                .id(100L)
                .interview(interview)
                .user(candidate)
                .status("COMPLETED")
                .warningCount(1)
                .fullscreenExits(1) // -15
                .tabSwitches(1)     // -10
                .build();

        aiEvents = new ArrayList<>();
        // Add one cell phone event (-30)
        aiEvents.add(AiEvent.builder()
                .id(200L)
                .session(session)
                .eventType("PHONE_DETECTED")
                .confidence(0.9)
                .timestamp(LocalDateTime.now())
                .build());

        cheatingLogs = new ArrayList<>();
        cheatingLogs.add(CheatingLog.builder()
                .id(300L)
                .session(session)
                .logType("TAB_SWITCH")
                .message("Tab blurred")
                .severity("MEDIUM")
                .timestamp(LocalDateTime.now())
                .build());

        report = Report.builder()
                .id(400L)
                .session(session)
                .candidate(candidate)
                .finalScore(45.0)
                .decision("FAIL")
                .summary("Test Summary")
                .build();

        reportDto = new ReportDto();
        reportDto.setId(400L);
        reportDto.setFinalScore(45.0);
        reportDto.setDecision("FAIL");
        reportDto.setSummary("Test Summary");
    }

    @Test
    public void testGenerateReport_Success() {
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(aiEventRepository.findBySessionIdOrderByTimestampAsc(100L)).thenReturn(aiEvents);
        when(cheatingLogRepository.findBySessionIdOrderByTimestampAsc(100L)).thenReturn(cheatingLogs);
        when(reportRepository.findBySessionId(100L)).thenReturn(Optional.empty());
        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(mapper.toDto(any(Report.class))).thenReturn(reportDto);

        ReportDto result = reportService.generateReport(100L);

        assertNotNull(result);
        assertEquals(45.0, result.getFinalScore());
        assertEquals("FAIL", result.getDecision());
        verify(reportRepository, atLeastOnce()).save(any(Report.class));
    }

    @Test
    public void testGetReportBySession_Success() {
        when(reportRepository.findBySessionId(100L)).thenReturn(Optional.of(report));
        when(mapper.toDto(report)).thenReturn(reportDto);

        ReportDto result = reportService.getReportBySession(100L);

        assertNotNull(result);
        assertEquals("FAIL", result.getDecision());
    }

    @Test
    public void testGetReportsByCandidate_Success() {
        when(reportRepository.findByCandidateId(1L)).thenReturn(Collections.singletonList(report));
        when(mapper.toReportDtoList(anyList())).thenReturn(Collections.singletonList(reportDto));

        List<ReportDto> results = reportService.getReportsByCandidate(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("FAIL", results.get(0).getDecision());
    }

    @Test
    public void testBuildExcelReportBytes_Success() {
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(aiEventRepository.findBySessionIdOrderByTimestampAsc(100L)).thenReturn(aiEvents);
        when(cheatingLogRepository.findBySessionIdOrderByTimestampAsc(100L)).thenReturn(cheatingLogs);

        byte[] bytes = reportService.buildExcelReportBytes(100L);

        assertNotNull(bytes);
        assertTrue(bytes.length > 0);
    }
}
