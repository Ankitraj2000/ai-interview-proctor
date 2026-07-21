package com.proctor.service;

import com.proctor.dto.InterviewDto;
import com.proctor.entity.Interview;
import com.proctor.entity.InterviewSchedule;
import com.proctor.entity.User;
import com.proctor.mapper.ProctorMapper;
import com.proctor.repository.InterviewRepository;
import com.proctor.repository.InterviewScheduleRepository;
import com.proctor.repository.UserRepository;
import com.proctor.repository.QuestionRepository;
import com.proctor.repository.QuestionSetRepository;
import com.proctor.entity.QuestionSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class InterviewService {

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private InterviewScheduleRepository scheduleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuestionSetRepository questionSetRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ProctorMapper mapper;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public InterviewDto scheduleInterview(InterviewDto dto, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("Error: Creator user not found."));

        User candidate = userRepository.findByEmail(dto.getCandidateEmail())
                .orElseThrow(() -> new RuntimeException("Error: Candidate user not found with email: " + dto.getCandidateEmail()));

        // Generate unique access code
        String accessCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        QuestionSet questionSet = null;
        if (dto.getQuestionSetId() != null) {
            questionSet = questionSetRepository.findById(dto.getQuestionSetId()).orElse(null);
        }

        Interview interview = Interview.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .code(accessCode)
                .durationMinutes(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 60)
                .status("SCHEDULED")
                .creator(creator)
                .candidate(candidate)
                .questionSet(questionSet)
                .difficulty(dto.getDifficulty() != null ? dto.getDifficulty() : "MEDIUM")
                .questionCount(dto.getQuestionCount() != null ? dto.getQuestionCount() : 5)
                .interviewType(dto.getInterviewType() != null ? dto.getInterviewType() : "FULL_STACK")
                .enableAiProctoring(dto.getEnableAiProctoring() != null ? dto.getEnableAiProctoring() : true)
                .enableBrowserLock(dto.getEnableBrowserLock() != null ? dto.getEnableBrowserLock() : true)
                .enableWebcam(dto.getEnableWebcam() != null ? dto.getEnableWebcam() : true)
                .enableMicrophone(dto.getEnableMicrophone() != null ? dto.getEnableMicrophone() : true)
                .scheduledStart(dto.getScheduledStart() != null ? dto.getScheduledStart() : LocalDateTime.now())
                .scheduledEnd(dto.getScheduledEnd() != null ? dto.getScheduledEnd() : LocalDateTime.now().plusHours(2))
                .build();

        Interview savedInterview = interviewRepository.save(interview);

        InterviewSchedule schedule = InterviewSchedule.builder()
                .interview(savedInterview)
                .scheduledStart(dto.getScheduledStart())
                .scheduledEnd(dto.getScheduledEnd())
                .timezone(dto.getTimezone() != null ? dto.getTimezone() : "UTC")
                .build();

        scheduleRepository.save(schedule);
        notificationService.createNotification(candidate, "Interview Assigned", "A new interview '" + savedInterview.getTitle() + "' has been scheduled for you. Code: " + accessCode, "INTERVIEW_INVITE");

        // Send email invite
        emailService.sendInterviewInvite(
                candidate.getEmail(),
                interview.getTitle(),
                interview.getCode(),
                dto.getScheduledStart().toString(),
                interview.getDurationMinutes().toString()
        );

        InterviewDto resultDto = mapper.toDto(savedInterview);
        resultDto.setScheduledStart(schedule.getScheduledStart());
        resultDto.setScheduledEnd(schedule.getScheduledEnd());
        resultDto.setTimezone(schedule.getTimezone());
        resultDto.setDifficulty(savedInterview.getDifficulty());
        resultDto.setQuestionCount(savedInterview.getQuestionCount());
        resultDto.setInterviewType(savedInterview.getInterviewType());
        if (savedInterview.getQuestionSet() != null) {
            resultDto.setQuestionSetId(savedInterview.getQuestionSet().getId());
            resultDto.setQuestionSetName(savedInterview.getQuestionSet().getName());
        }
        return resultDto;
    }

    public Page<InterviewDto> getCandidateInterviews(String email, Pageable pageable) {
        User candidate = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        Page<Interview> page = interviewRepository.findByCandidateId(candidate.getId(), pageable);
        return page.map(interview -> {
            InterviewDto dto = mapper.toDto(interview);
            scheduleRepository.findByInterviewId(interview.getId()).ifPresent(schedule -> {
                dto.setScheduledStart(schedule.getScheduledStart());
                dto.setScheduledEnd(schedule.getScheduledEnd());
                dto.setTimezone(schedule.getTimezone());
            });
            return dto;
        });
    }

    public Page<InterviewDto> getInterviewerInterviews(String email, Pageable pageable) {
        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        Page<Interview> page = interviewRepository.findByCreatorId(creator.getId(), pageable);
        return page.map(interview -> {
            InterviewDto dto = mapper.toDto(interview);
            scheduleRepository.findByInterviewId(interview.getId()).ifPresent(schedule -> {
                dto.setScheduledStart(schedule.getScheduledStart());
                dto.setScheduledEnd(schedule.getScheduledEnd());
                dto.setTimezone(schedule.getTimezone());
            });
            return dto;
        });
    }

    public Page<InterviewDto> getAllInterviews(String status, String search, Pageable pageable) {
        Page<Interview> page = interviewRepository.searchInterviews(status, search, pageable);
        return page.map(interview -> {
            InterviewDto dto = mapper.toDto(interview);
            scheduleRepository.findByInterviewId(interview.getId()).ifPresent(schedule -> {
                dto.setScheduledStart(schedule.getScheduledStart());
                dto.setScheduledEnd(schedule.getScheduledEnd());
                dto.setTimezone(schedule.getTimezone());
            });
            return dto;
        });
    }

    public InterviewDto getInterviewByCode(String code) {
        Interview interview = interviewRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Error: Interview not found with code: " + code));

        InterviewDto dto = mapper.toDto(interview);
        scheduleRepository.findByInterviewId(interview.getId()).ifPresent(schedule -> {
            dto.setScheduledStart(schedule.getScheduledStart());
            dto.setScheduledEnd(schedule.getScheduledEnd());
            dto.setTimezone(schedule.getTimezone());
        });
        dto.setQuestions(getInterviewQuestions(interview.getId()));
        return dto;
    }

    @Transactional
    public void updateInterviewStatus(Long interviewId, String status) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Error: Interview not found."));
        interview.setStatus(status);
        interviewRepository.save(interview);
    }

    @Autowired
    private QuestionRepository questionRepository;

    public java.util.List<com.proctor.entity.Question> getInterviewQuestions(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Error: Interview not found."));

        if (interview.getQuestionSet() != null) {
            java.util.List<com.proctor.entity.Question> questions = interview.getQuestionSet().getQuestions();
            int limit = interview.getQuestionCount() != null ? interview.getQuestionCount() : questions.size();
            return questions.stream().limit(limit).collect(java.util.stream.Collectors.toList());
        }

        // Fallback: fetch random questions matching scheduling difficulty
        String difficulty = interview.getDifficulty() != null ? interview.getDifficulty() : "MEDIUM";
        int limit = interview.getQuestionCount() != null ? interview.getQuestionCount() : 3;
        return questionRepository.findRandomQuestions("DSA", difficulty, null, limit);
    }

    @Transactional
    public InterviewDto updateInterview(Long id, InterviewDto dto) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Interview not found."));

        if (dto.getTitle() != null) interview.setTitle(dto.getTitle());
        if (dto.getDescription() != null) interview.setDescription(dto.getDescription());
        if (dto.getDurationMinutes() != null) interview.setDurationMinutes(dto.getDurationMinutes());
        if (dto.getDifficulty() != null) interview.setDifficulty(dto.getDifficulty());
        if (dto.getQuestionCount() != null) interview.setQuestionCount(dto.getQuestionCount());
        if (dto.getInterviewType() != null) interview.setInterviewType(dto.getInterviewType());
        if (dto.getEnableAiProctoring() != null) interview.setEnableAiProctoring(dto.getEnableAiProctoring());
        if (dto.getEnableBrowserLock() != null) interview.setEnableBrowserLock(dto.getEnableBrowserLock());
        if (dto.getEnableWebcam() != null) interview.setEnableWebcam(dto.getEnableWebcam());
        if (dto.getEnableMicrophone() != null) interview.setEnableMicrophone(dto.getEnableMicrophone());
        if (dto.getScheduledStart() != null) interview.setScheduledStart(dto.getScheduledStart());
        if (dto.getScheduledEnd() != null) interview.setScheduledEnd(dto.getScheduledEnd());

        if (dto.getQuestionSetId() != null) {
            QuestionSet questionSet = questionSetRepository.findById(dto.getQuestionSetId()).orElse(null);
            interview.setQuestionSet(questionSet);
        }

        Interview saved = interviewRepository.save(interview);
        
        scheduleRepository.findByInterviewId(id).ifPresent(schedule -> {
            if (dto.getScheduledStart() != null) schedule.setScheduledStart(dto.getScheduledStart());
            if (dto.getScheduledEnd() != null) schedule.setScheduledEnd(dto.getScheduledEnd());
            if (dto.getTimezone() != null) schedule.setTimezone(dto.getTimezone());
            scheduleRepository.save(schedule);
        });

        InterviewDto resultDto = mapper.toDto(saved);
        if (dto.getScheduledStart() != null) resultDto.setScheduledStart(dto.getScheduledStart());
        if (dto.getScheduledEnd() != null) resultDto.setScheduledEnd(dto.getScheduledEnd());
        return resultDto;
    }

    @Transactional
    public void deleteInterview(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Interview not found."));
        scheduleRepository.findByInterviewId(id).ifPresent(s -> scheduleRepository.delete(s));
        interviewRepository.delete(interview);
    }

    @Transactional
    public InterviewDto duplicateInterview(Long id, String creatorEmail) {
        Interview original = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Interview not found."));

        InterviewDto copyDto = mapper.toDto(original);
        copyDto.setTitle("Copy of " + original.getTitle());
        copyDto.setCandidateEmail(original.getCandidate().getEmail());
        copyDto.setScheduledStart(LocalDateTime.now().plusDays(1));
        copyDto.setScheduledEnd(LocalDateTime.now().plusDays(1).plusMinutes(original.getDurationMinutes()));

        return scheduleInterview(copyDto, creatorEmail);
    }
}
