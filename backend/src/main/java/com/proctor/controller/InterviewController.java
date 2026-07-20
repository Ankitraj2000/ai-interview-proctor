package com.proctor.controller;

import com.proctor.dto.InterviewDto;
import com.proctor.service.InterviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/interviews")
@Tag(name = "Interview Scheduling", description = "Endpoints to Schedule, Join and Manage Interviews")
@SecurityRequirement(name = "Bearer Authentication")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @PostMapping
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    @Operation(summary = "Schedule a new proctored interview and send candidate invitation (Interviewer/Admin only)")
    public ResponseEntity<InterviewDto> scheduleInterview(@RequestBody InterviewDto dto, Principal principal) {
        InterviewDto scheduled = interviewService.scheduleInterview(dto, principal.getName());
        return ResponseEntity.ok(scheduled);
    }

    @GetMapping("/candidate")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Retrieve scheduled interviews list for the logged-in Candidate")
    public ResponseEntity<Page<InterviewDto>> getCandidateInterviews(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<InterviewDto> interviews = interviewService.getCandidateInterviews(principal.getName(), pageable);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/interviewer")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    @Operation(summary = "Retrieve scheduled interviews created by the logged-in Interviewer")
    public ResponseEntity<Page<InterviewDto>> getInterviewerInterviews(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<InterviewDto> interviews = interviewService.getInterviewerInterviews(principal.getName(), pageable);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INTERVIEWER')")
    @Operation(summary = "Search all interviews in system using keyword filter (Admin/Interviewer only)")
    public ResponseEntity<Page<InterviewDto>> getAllInterviews(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<InterviewDto> interviews = interviewService.getAllInterviews(status, search, pageable);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Verify access code and return interview configuration details")
    public ResponseEntity<InterviewDto> getInterviewByCode(@PathVariable String code) {
        InterviewDto interview = interviewService.getInterviewByCode(code);
        return ResponseEntity.ok(interview);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    @Operation(summary = "Change the lifecycle status of an interview (Interviewer/Admin only)")
    public ResponseEntity<String> updateInterviewStatus(@PathVariable Long id, @RequestParam String status) {
        interviewService.updateInterviewStatus(id, status);
        return ResponseEntity.ok("Interview status updated to: " + status);
    }

    @GetMapping("/{id}/questions")
    @Operation(summary = "Get the dynamic list of questions for an active interview")
    public ResponseEntity<java.util.List<com.proctor.entity.Question>> getInterviewQuestions(@PathVariable Long id) {
        return ResponseEntity.ok(interviewService.getInterviewQuestions(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    @Operation(summary = "Update an existing scheduled interview parameters")
    public ResponseEntity<InterviewDto> updateInterview(@PathVariable Long id, @RequestBody InterviewDto dto) {
        return ResponseEntity.ok(interviewService.updateInterview(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    @Operation(summary = "Delete or cancel a scheduled interview")
    public ResponseEntity<String> deleteInterview(@PathVariable Long id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.ok("Interview deleted successfully.");
    }

    @PostMapping("/{id}/duplicate")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    @Operation(summary = "Duplicate an existing interview template")
    public ResponseEntity<InterviewDto> duplicateInterview(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(interviewService.duplicateInterview(id, principal.getName()));
    }
}
