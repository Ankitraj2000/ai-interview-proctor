package com.proctor.controller;

import com.proctor.dto.ReportDto;
import com.proctor.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/reports")
@Tag(name = "Report Generation", description = "Endpoints to generate, query, and download evaluation PDF/Excel reports")
@SecurityRequirement(name = "Bearer Authentication")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping("/generate/{sessionId}")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('INTERVIEWER') or hasRole('ADMIN')")
    @Operation(summary = "Generate/Compile candidate score evaluation summary report")
    public ResponseEntity<ReportDto> generateReport(@PathVariable Long sessionId) {
        ReportDto report = reportService.generateReport(sessionId);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "Get report details by candidate session ID")
    public ResponseEntity<ReportDto> getReportBySession(@PathVariable Long sessionId) {
        ReportDto report = reportService.getReportBySession(sessionId);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    @Operation(summary = "Get list of reports mapped to candidate ID (Interviewer/Admin only)")
    public ResponseEntity<List<ReportDto>> getReportsByCandidate(@PathVariable Long candidateId) {
        List<ReportDto> reports = reportService.getReportsByCandidate(candidateId);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/download/pdf/{sessionId}")
    @Operation(summary = "Download evaluation summary report PDF")
    public ResponseEntity<byte[]> downloadPdfReport(@PathVariable Long sessionId) throws IOException {
        ReportDto report = reportService.getReportBySession(sessionId);
        byte[] pdfBytes;
        
        if (report.getFilePath() != null) {
            File file = new File(report.getFilePath());
            if (file.exists()) {
                pdfBytes = Files.readAllBytes(file.toPath());
            } else {
                throw new RuntimeException("Report file not found on server disk.");
            }
        } else {
            throw new RuntimeException("Report has not been generated for this session.");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"proctor_report_" + sessionId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/download/excel/{sessionId}")
    @Operation(summary = "Download evaluation spreadsheet excel workbook")
    public ResponseEntity<byte[]> downloadExcelReport(@PathVariable Long sessionId) {
        byte[] excelBytes = reportService.buildExcelReportBytes(sessionId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"proctor_logs_" + sessionId + ".xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    @Operation(summary = "Get global organization report metrics and analytics summary")
    public ResponseEntity<java.util.Map<String, Object>> getGlobalAnalytics() {
        return ResponseEntity.ok(reportService.getGlobalAnalytics());
    }

    @GetMapping("/compare")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    @Operation(summary = "Compare candidate results side by side")
    public ResponseEntity<List<ReportDto>> compareSessions(@RequestParam List<Long> sessionIds) {
        return ResponseEntity.ok(reportService.compareSessions(sessionIds));
    }

    @GetMapping("/screenshots/{sessionId}")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    @Operation(summary = "Get webcam violation screenshots list for session")
    public ResponseEntity<List<com.proctor.entity.AiEvent>> getSessionScreenshots(@PathVariable Long sessionId) {
        return ResponseEntity.ok(reportService.getViolationScreenshots(sessionId));
    }

    @DeleteMapping("/screenshots/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete screenshot file (Admin only)")
    public ResponseEntity<Void> deleteScreenshot(@PathVariable Long eventId) {
        boolean deleted = reportService.deleteScreenshot(eventId);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/screenshots/view/{eventId}")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    @Operation(summary = "View raw screenshot image file for violation event")
    public ResponseEntity<byte[]> viewViolationScreenshot(@PathVariable Long eventId) throws IOException {
        byte[] imageBytes = reportService.getScreenshotImageBytes(eventId);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(imageBytes);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('INTERVIEWER') or hasRole('ADMIN')")
    @Operation(summary = "Get list of all compiled reports in the system")
    public ResponseEntity<List<ReportDto>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }
}
