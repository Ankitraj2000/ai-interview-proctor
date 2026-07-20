package com.proctor.mapper;

import com.proctor.dto.*;
import com.proctor.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProctorMapper {

    @Mapping(target = "roles", expression = "java(user.getRoles().stream().map(role -> role.getName()).collect(java.util.stream.Collectors.toList()))")
    @Mapping(target = "createdAt", expression = "java(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)")
    UserDto toDto(User user);

    @Mapping(target = "creatorId", source = "creator.id")
    @Mapping(target = "creatorEmail", source = "creator.email")
    @Mapping(target = "candidateId", source = "candidate.id")
    @Mapping(target = "candidateEmail", source = "candidate.email")
    @Mapping(target = "candidateName", expression = "java(interview.getCandidate().getFirstName() + \" \" + interview.getCandidate().getLastName())")
    @Mapping(target = "questionSetId", source = "interview.questionSet.id")
    @Mapping(target = "questionSetName", source = "interview.questionSet.name")
    @Mapping(target = "timezone", ignore = true)
    InterviewDto toDto(Interview interview);

    @Mapping(target = "interviewId", source = "interview.id")
    @Mapping(target = "interviewTitle", source = "interview.title")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "userName", expression = "java(session.getUser().getFirstName() + \" \" + session.getUser().getLastName())")
    CandidateSessionDto toDto(CandidateSession session);

    @Mapping(target = "sessionId", source = "session.id")
    @Mapping(target = "candidateId", source = "candidate.id")
    @Mapping(target = "candidateEmail", source = "candidate.email")
    @Mapping(target = "candidateName", expression = "java(report.getCandidate().getFirstName() + \" \" + report.getCandidate().getLastName())")
    ReportDto toDto(Report report);

    @Mapping(target = "sessionId", source = "session.id")
    AiEventDto toDto(AiEvent aiEvent);

    @Mapping(target = "sessionId", source = "session.id")
    CheatingLogDto toDto(CheatingLog log);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userEmail", source = "user.email")
    AuditLogDto toDto(AuditLog log);

    List<InterviewDto> toInterviewDtoList(List<Interview> interviews);
    List<CandidateSessionDto> toSessionDtoList(List<CandidateSession> sessions);
    List<ReportDto> toReportDtoList(List<Report> reports);
    List<AiEventDto> toAiEventDtoList(List<AiEvent> events);
    List<CheatingLogDto> toCheatingLogDtoList(List<CheatingLog> logs);
    List<AuditLogDto> toAuditLogDtoList(List<AuditLog> logs);
}
