package com.proctor.service;

import com.proctor.dto.InterviewDto;
import com.proctor.entity.Interview;
import com.proctor.entity.InterviewSchedule;
import com.proctor.entity.User;
import com.proctor.mapper.ProctorMapper;
import com.proctor.repository.InterviewRepository;
import com.proctor.repository.InterviewScheduleRepository;
import com.proctor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InterviewServiceTest {

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private InterviewScheduleRepository scheduleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private ProctorMapper mapper;

    @InjectMocks
    private InterviewService interviewService;

    private User creator;
    private User candidate;
    private Interview interview;
    private InterviewSchedule schedule;
    private InterviewDto interviewDto;

    @BeforeEach
    public void setUp() {
        creator = User.builder()
                .id(1L)
                .email("interviewer@email.com")
                .firstName("John")
                .lastName("Doe")
                .build();

        candidate = User.builder()
                .id(2L)
                .email("candidate@email.com")
                .firstName("Jane")
                .lastName("Smith")
                .build();

        interview = Interview.builder()
                .id(10L)
                .title("Java Developer Interview")
                .description("Test Description")
                .code("CODE1234")
                .durationMinutes(60)
                .status("SCHEDULED")
                .creator(creator)
                .candidate(candidate)
                .build();

        schedule = InterviewSchedule.builder()
                .id(100L)
                .interview(interview)
                .scheduledStart(LocalDateTime.now().plusDays(1))
                .scheduledEnd(LocalDateTime.now().plusDays(1).plusHours(1))
                .timezone("UTC")
                .build();

        interviewDto = new InterviewDto();
        interviewDto.setId(10L);
        interviewDto.setTitle("Java Developer Interview");
        interviewDto.setCandidateEmail("candidate@email.com");
        interviewDto.setDurationMinutes(60);
        interviewDto.setScheduledStart(LocalDateTime.now().plusDays(1));
        interviewDto.setScheduledEnd(LocalDateTime.now().plusDays(1).plusHours(1));
    }

    @Test
    public void testScheduleInterview_Success() {
        when(userRepository.findByEmail("interviewer@email.com")).thenReturn(Optional.of(creator));
        when(userRepository.findByEmail("candidate@email.com")).thenReturn(Optional.of(candidate));
        when(interviewRepository.save(any(Interview.class))).thenReturn(interview);
        when(scheduleRepository.save(any(InterviewSchedule.class))).thenReturn(schedule);
        when(mapper.toDto(any(Interview.class))).thenReturn(interviewDto);

        InterviewDto result = interviewService.scheduleInterview(interviewDto, "interviewer@email.com");

        assertNotNull(result);
        assertEquals("Java Developer Interview", result.getTitle());
        verify(emailService, times(1)).sendInterviewInvite(anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    public void testGetCandidateInterviews_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Interview> page = new PageImpl<>(Collections.singletonList(interview));
        when(userRepository.findByEmail("candidate@email.com")).thenReturn(Optional.of(candidate));
        when(interviewRepository.findByCandidateId(candidate.getId(), pageable)).thenReturn(page);
        when(mapper.toDto(interview)).thenReturn(interviewDto);
        when(scheduleRepository.findByInterviewId(interview.getId())).thenReturn(Optional.of(schedule));

        Page<InterviewDto> resultPage = interviewService.getCandidateInterviews("candidate@email.com", pageable);

        assertNotNull(resultPage);
        assertEquals(1, resultPage.getTotalElements());
        assertEquals("Java Developer Interview", resultPage.getContent().get(0).getTitle());
    }

    @Test
    public void testGetInterviewByCode_Success() {
        when(interviewRepository.findByCode("CODE1234")).thenReturn(Optional.of(interview));
        when(mapper.toDto(interview)).thenReturn(interviewDto);
        when(scheduleRepository.findByInterviewId(interview.getId())).thenReturn(Optional.of(schedule));

        InterviewDto result = interviewService.getInterviewByCode("CODE1234");

        assertNotNull(result);
        assertEquals("Java Developer Interview", result.getTitle());
    }

    @Test
    public void testUpdateInterviewStatus_Success() {
        when(interviewRepository.findById(10L)).thenReturn(Optional.of(interview));
        when(interviewRepository.save(interview)).thenReturn(interview);

        interviewService.updateInterviewStatus(10L, "COMPLETED");

        assertEquals("COMPLETED", interview.getStatus());
        verify(interviewRepository, times(1)).save(interview);
    }
}
