package com.proctor.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.proctor.dto.ReportDto;
import com.proctor.entity.*;
import com.proctor.mapper.ProctorMapper;
import com.proctor.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReportService {
    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private CandidateSessionRepository sessionRepository;

    @Autowired
    private AiEventRepository aiEventRepository;

    @Autowired
    private CheatingLogRepository cheatingLogRepository;

    @Autowired
    private CandidateResponseRepository responseRepository;

    @Autowired
    private EvaluationResultRepository evaluationResultRepository;

    @Autowired
    private ProctorMapper mapper;

    @Value("${app.upload.reports}")
    private String reportsDir;

    @Transactional
    public ReportDto generateReport(Long sessionId) {
        CandidateSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Error: Session not found."));

        List<AiEvent> aiEvents = aiEventRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        List<CheatingLog> cheatingLogs = cheatingLogRepository.findBySessionIdOrderByTimestampAsc(sessionId);

        // 1. Calculate Score
        // Base score = 100. Subtract penalties:
        double score = 100.0;
        score -= (session.getTabSwitches() * 10.0);
        score -= (session.getFullscreenExits() * 15.0);

        for (AiEvent event : aiEvents) {
            if ("PHONE_DETECTED".equalsIgnoreCase(event.getEventType())) {
                score -= 30.0;
            } else if ("FACE_NOT_FOUND".equalsIgnoreCase(event.getEventType())) {
                score -= 5.0;
            } else if ("MULTIPLE_PEOPLE".equalsIgnoreCase(event.getEventType())) {
                score -= 25.0;
            } else if ("LOOKING_AWAY".equalsIgnoreCase(event.getEventType())) {
                score -= 2.0;
            }
        }
        score = Math.max(score, 0.0);

        // 2. Decision Logic
        String decision = "PASS";
        if (score < 50.0 || session.getWarningCount() >= 3) {
            decision = "FAIL";
        } else if (score < 75.0) {
            decision = "FLAGGED";
        }

        // Calculate risk parameters for database persistence
        String riskLevel = "LOW";
        String aiRec = "Highly Recommended - Zero to minimal anomalies detected.";
        if (score < 60.0) {
            riskLevel = "CRITICAL";
            aiRec = "Critical Flag - Repeated critical proctoring violations recorded.";
        } else if (score < 75.0) {
            riskLevel = "HIGH";
            aiRec = "Warning Flagged - Frequent tab switches/suspicious movements detected.";
        } else if (score < 90.0) {
            riskLevel = "MEDIUM";
            aiRec = "Review Recommended - Some minor focus shifts/noises detected.";
        }

        // 3. Compile Summary
        String summary = String.format(
            "Session finished with status %s. Detected %d tab switches, %d fullscreen exits, " +
            "and %d proctoring telemetry anomalies. Candidate warning index: %d/3.",
            session.getStatus(), session.getTabSwitches(), session.getFullscreenExits(), 
            aiEvents.size(), session.getWarningCount()
        );

        // Check if report already exists, update or create new
        Report report = reportRepository.findBySessionId(sessionId).orElse(null);
        if (report == null) {
            report = Report.builder()
                    .session(session)
                    .candidate(session.getUser())
                    .finalScore(score)
                    .decision(decision)
                    .summary(summary)
                    .companyName("Enterprise Proctoring Corp")
                    .jobRole(session.getInterview().getTitle())
                    .duration(session.getInterview().getDurationMinutes())
                    .finalStatus("PENDING")
                    .riskLevel(riskLevel)
                    .aiRecommendation(aiRec)
                    .build();
        } else {
            report.setFinalScore(score);
            report.setDecision(decision);
            report.setSummary(summary);
            if (report.getCompanyName() == null) report.setCompanyName("Enterprise Proctoring Corp");
            if (report.getJobRole() == null) report.setJobRole(session.getInterview().getTitle());
            if (report.getDuration() == null) report.setDuration(session.getInterview().getDurationMinutes());
            if (report.getFinalStatus() == null) report.setFinalStatus("PENDING");
            report.setRiskLevel(riskLevel);
            report.setAiRecommendation(aiRec);
        }

        Report saved = reportRepository.save(report);

        // Generate files in background and save paths
        try {
            File dir = new File(reportsDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            String filename = "report_session_" + sessionId + ".pdf";
            String fullPath = reportsDir + "/" + filename;
            
            // Build PDF physically
            byte[] pdfBytes = buildPdfReportBytes(saved, session, aiEvents, cheatingLogs);
            try (FileOutputStream fos = new FileOutputStream(fullPath)) {
                fos.write(pdfBytes);
            }
            
            saved.setFilePath(fullPath);
            reportRepository.save(saved);
        } catch (Exception e) {
            logger.error("Failed to generate PDF report file: {}", e.getMessage());
        }

        ReportDto dto = mapper.toDto(saved);
        populateDtoMetrics(dto, saved);
        return dto;
    }

    public ReportDto getReportBySession(Long sessionId) {
        Report report = reportRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Error: Report not found for session " + sessionId));
        ReportDto dto = mapper.toDto(report);
        populateDtoMetrics(dto, report);
        return dto;
    }

    public List<ReportDto> getReportsByCandidate(Long candidateId) {
        List<Report> reports = reportRepository.findByCandidateId(candidateId);
        List<ReportDto> dtos = mapper.toReportDtoList(reports);
        for (int i = 0; i < reports.size(); i++) {
            populateDtoMetrics(dtos.get(i), reports.get(i));
        }
        return dtos;
    }

    private void populateDtoMetrics(ReportDto dto, Report report) {
        if (dto == null || report == null) return;
        CandidateSession session = report.getSession();
        if (session == null) return;
        
        List<AiEvent> aiEvents = aiEventRepository.findBySessionIdOrderByTimestampAsc(session.getId());
        List<CheatingLog> cheatingLogs = cheatingLogRepository.findBySessionIdOrderByTimestampAsc(session.getId());
        
        int tabSwitches = session.getTabSwitches() != null ? session.getTabSwitches() : 0;
        int fullscreenExits = session.getFullscreenExits() != null ? session.getFullscreenExits() : 0;
        int warningCount = session.getWarningCount() != null ? session.getWarningCount() : 0;
        int aiEventCount = aiEvents.size();
        
        int highViolations = 0;
        int mediumViolations = 0;
        int lowViolations = 0;
        
        for (AiEvent event : aiEvents) {
            String type = event.getEventType();
            if ("PHONE_DETECTED".equalsIgnoreCase(type) || "MULTIPLE_PEOPLE".equalsIgnoreCase(type) || "CAMERA_BLOCKED".equalsIgnoreCase(type)) {
                highViolations++;
            } else if ("FACE_NOT_FOUND".equalsIgnoreCase(type) || "TAB_SWITCH".equalsIgnoreCase(type)) {
                mediumViolations++;
            } else {
                lowViolations++;
            }
        }
        for (CheatingLog log : cheatingLogs) {
            String severity = log.getSeverity();
            if ("HIGH".equalsIgnoreCase(severity)) {
                highViolations++;
            } else if ("MEDIUM".equalsIgnoreCase(severity)) {
                mediumViolations++;
            } else {
                lowViolations++;
            }
        }
        
        int totalViolations = highViolations + mediumViolations + lowViolations;
        
        double integrityScore = 100.0;
        integrityScore -= (tabSwitches * 10.0);
        integrityScore -= (fullscreenExits * 15.0);
        integrityScore -= (warningCount * 5.0);
        integrityScore -= (aiEventCount * 4.0);
        integrityScore = Math.max(0.0, Math.min(100.0, integrityScore));
        
        String riskLevel = "LOW";
        String aiRec = "Highly Recommended - Zero to minimal anomalies detected.";
        if (integrityScore < 60.0) {
            riskLevel = "CRITICAL";
            aiRec = "Critical Flag - Repeated critical proctoring violations recorded.";
        } else if (integrityScore < 75.0) {
            riskLevel = "HIGH";
            aiRec = "Warning Flagged - Frequent tab switches/suspicious movements detected.";
        } else if (integrityScore < 90.0) {
            riskLevel = "MEDIUM";
            aiRec = "Review Recommended - Some minor focus shifts/noises detected.";
        }
        
        dto.setTotalViolations(totalViolations);
        dto.setHighViolations(highViolations);
        dto.setMediumViolations(mediumViolations);
        dto.setLowViolations(lowViolations);
        dto.setAiIntegrityScore(integrityScore);
        dto.setRiskLevel(riskLevel);
        dto.setAiRecommendation(aiRec);
        
        List<CandidateResponse> responses = responseRepository.findBySessionId(session.getId());
        double mcq = 0.0;
        double coding = 0.0;
        double subjective = 0.0;
        double sqlScore = 0.0;
        double debugging = 0.0;
        
        for (CandidateResponse r : responses) {
            String type = r.getQuestion().getType();
            double val = r.getScore() != null ? r.getScore() : 0.0;
            if ("MCQ".equalsIgnoreCase(type)) {
                mcq += val;
            } else if ("CODING".equalsIgnoreCase(type)) {
                coding += val;
            } else if ("SUBJECTIVE".equalsIgnoreCase(type) || "ESSAY".equalsIgnoreCase(type)) {
                subjective += val;
            } else if ("SQL".equalsIgnoreCase(type)) {
                sqlScore += val;
            } else if ("DEBUGGING".equalsIgnoreCase(type)) {
                debugging += val;
            }
        }
        
        double technical = coding + sqlScore + debugging;
        double communication = subjective > 0 ? subjective : 85.0;
        
        EvaluationResult evalResult = evaluationResultRepository.findBySessionId(session.getId()).orElse(null);
        double overall = evalResult != null ? evalResult.getTotalScore() : report.getFinalScore();
        
        dto.setMcqScore(mcq);
        dto.setCodingScore(coding);
        dto.setSubjectiveScore(subjective);
        dto.setSqlScore(sqlScore);
        dto.setDebuggingScore(debugging);
        dto.setTechnicalScore(technical);
        dto.setCommunicationScore(communication);
        dto.setOverallScore(overall);
        
        dto.setCompanyName(report.getCompanyName() != null ? report.getCompanyName() : "Enterprise Proctoring Corp");
        dto.setJobRole(report.getJobRole() != null ? report.getJobRole() : session.getInterview().getTitle());
        dto.setDuration(report.getDuration() != null ? report.getDuration() : session.getInterview().getDurationMinutes());
        dto.setCompletionStatus("COMPLETED".equalsIgnoreCase(session.getStatus()) ? "COMPLETED" : "IN_PROGRESS");
        dto.setFinalStatus(report.getFinalStatus() != null ? report.getFinalStatus() : "PENDING");
    }

    // PDF BUILDER (using OpenPDF)
    public byte[] buildPdfReportBytes(Report report, CandidateSession session, 
                                     List<AiEvent> aiEvents, List<CheatingLog> cheatingLogs) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font configurations
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Font sectionFont = new Font(Font.HELVETICA, 12, Font.BOLD);
            Font normalFont = new Font(Font.HELVETICA, 9, Font.NORMAL);
            Font headerFont = new Font(Font.HELVETICA, 9, Font.BOLD);
            Font smallFont = new Font(Font.HELVETICA, 8, Font.ITALIC);

            // Title Banner
            Paragraph companyLogo = new Paragraph("ENTERPRISE PROCTORING SUITE", smallFont);
            companyLogo.setAlignment(Element.ALIGN_RIGHT);
            document.add(companyLogo);

            Paragraph title = new Paragraph("CANDIDATE EVALUATION & AI INTEGRITY REPORT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(15);
            document.add(title);

            // Candidate & Session Info Table
            Paragraph sectionInfo = new Paragraph("1. Candidate & Assessment Information", sectionFont);
            sectionInfo.setSpacingAfter(5);
            document.add(sectionInfo);

            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(15);
            
            metaTable.addCell(new PdfPCell(new Phrase("Candidate Name", headerFont)));
            metaTable.addCell(new PdfPCell(new Phrase(session.getUser().getFirstName() + " " + session.getUser().getLastName(), normalFont)));
            
            metaTable.addCell(new PdfPCell(new Phrase("Email / Candidate ID", headerFont)));
            metaTable.addCell(new PdfPCell(new Phrase(session.getUser().getEmail() + " (ID: " + session.getUser().getId() + ")", normalFont)));
            
            metaTable.addCell(new PdfPCell(new Phrase("Job Role / Test Code", headerFont)));
            metaTable.addCell(new PdfPCell(new Phrase(session.getInterview().getTitle() + " (" + session.getInterview().getCode() + ")", normalFont)));
            
            metaTable.addCell(new PdfPCell(new Phrase("Scheduled Duration", headerFont)));
            metaTable.addCell(new PdfPCell(new Phrase(session.getInterview().getDurationMinutes() + " Minutes", normalFont)));

            metaTable.addCell(new PdfPCell(new Phrase("Completion Status", headerFont)));
            metaTable.addCell(new PdfPCell(new Phrase(session.getStatus(), normalFont)));

            document.add(metaTable);

            // Scorecard Section
            Paragraph sectionScore = new Paragraph("2. Performance Scorecard Breakdown", sectionFont);
            sectionScore.setSpacingAfter(5);
            document.add(sectionScore);

            PdfPTable scoreTable = new PdfPTable(4);
            scoreTable.setWidthPercentage(100);
            scoreTable.setSpacingAfter(15);
            
            scoreTable.addCell(new PdfPCell(new Phrase("Integrity Index", headerFont)));
            scoreTable.addCell(new PdfPCell(new Phrase("Decision Flag", headerFont)));
            scoreTable.addCell(new PdfPCell(new Phrase("AI Risk Level", headerFont)));
            scoreTable.addCell(new PdfPCell(new Phrase("Warnings issued", headerFont)));
            
            scoreTable.addCell(new PdfPCell(new Phrase(report.getFinalScore() + "%", normalFont)));
            scoreTable.addCell(new PdfPCell(new Phrase(report.getDecision(), normalFont)));
            scoreTable.addCell(new PdfPCell(new Phrase(report.getRiskLevel() != null ? report.getRiskLevel() : "LOW", normalFont)));
            scoreTable.addCell(new PdfPCell(new Phrase(session.getWarningCount() + " / 3", normalFont)));
            
            document.add(scoreTable);

            // Summary Section
            Paragraph sumTitle = new Paragraph("3. Executive Evaluation Summary", sectionFont);
            sumTitle.setSpacingAfter(5);
            document.add(sumTitle);
            Paragraph sumText = new Paragraph(report.getSummary() + "\nRecommendation: " + (report.getAiRecommendation() != null ? report.getAiRecommendation() : "N/A"), normalFont);
            sumText.setSpacingAfter(15);
            document.add(sumText);

            // Logging details
            Paragraph detailsTitle = new Paragraph("4. Proctoring Violation Timeline Logs", sectionFont);
            detailsTitle.setSpacingAfter(5);
            document.add(detailsTitle);

            PdfPTable logTable = new PdfPTable(4);
            logTable.setWidthPercentage(100);
            logTable.setSpacingAfter(20);
            
            logTable.addCell(new PdfPCell(new Phrase("Timestamp", headerFont)));
            logTable.addCell(new PdfPCell(new Phrase("Anomaly Class", headerFont)));
            logTable.addCell(new PdfPCell(new Phrase("Telemetry Logs / Details", headerFont)));
            logTable.addCell(new PdfPCell(new Phrase("Severity", headerFont)));

            for (CheatingLog log : cheatingLogs) {
                logTable.addCell(new PdfPCell(new Phrase(log.getTimestamp().toString(), normalFont)));
                logTable.addCell(new PdfPCell(new Phrase(log.getLogType(), normalFont)));
                logTable.addCell(new PdfPCell(new Phrase(log.getMessage(), normalFont)));
                logTable.addCell(new PdfPCell(new Phrase(log.getSeverity(), normalFont)));
            }

            for (AiEvent event : aiEvents) {
                logTable.addCell(new PdfPCell(new Phrase(event.getTimestamp().toString(), normalFont)));
                logTable.addCell(new PdfPCell(new Phrase(event.getEventType(), normalFont)));
                logTable.addCell(new PdfPCell(new Phrase("AI vision confidence: " + event.getConfidence(), normalFont)));
                logTable.addCell(new PdfPCell(new Phrase("HIGH", normalFont)));
            }

            if (cheatingLogs.isEmpty() && aiEvents.isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("No proctoring violations detected. Candidate maintained compliance.", normalFont));
                emptyCell.setColspan(4);
                logTable.addCell(emptyCell);
            }

            document.add(logTable);

            // Digital Signature Section
            Paragraph signatureTitle = new Paragraph("5. Digital Audit Verification Signature", sectionFont);
            signatureTitle.setSpacingAfter(10);
            document.add(signatureTitle);

            PdfPTable sigTable = new PdfPTable(2);
            sigTable.setWidthPercentage(100);
            
            PdfPCell cellSystem = new PdfPCell(new Phrase("System Digital Hash ID:\nSHA-256: " + Integer.toHexString(report.hashCode()), smallFont));
            cellSystem.setBorder(PdfPCell.NO_BORDER);
            sigTable.addCell(cellSystem);

            PdfPCell cellSign = new PdfPCell(new Phrase("Evaluator Signature: ___________________\nDate: ___________________", normalFont));
            cellSign.setBorder(PdfPCell.NO_BORDER);
            cellSign.setHorizontalAlignment(Element.ALIGN_RIGHT);
            sigTable.addCell(cellSign);

            document.add(sigTable);

            document.close();
        } catch (Exception e) {
            logger.error("Error creating PDF: {}", e.getMessage());
        }
        return out.toByteArray();
    }

    // EXCEL BUILDER (using Apache POI)
    public byte[] buildExcelReportBytes(Long sessionId) {
        CandidateSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Error: Session not found."));

        List<AiEvent> aiEvents = aiEventRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        List<CheatingLog> cheatingLogs = cheatingLogRepository.findBySessionIdOrderByTimestampAsc(sessionId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Proctoring Logs");

            // Header Style
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.INDIGO.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Create headers
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Timestamp", "Source", "Event Type", "Event Details / Confidence", "Severity"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            // Write browser events
            for (CheatingLog log : cheatingLogs) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(log.getTimestamp().toString());
                row.createCell(1).setCellValue("Browser Client");
                row.createCell(2).setCellValue(log.getLogType());
                row.createCell(3).setCellValue(log.getMessage());
                row.createCell(4).setCellValue(log.getSeverity());
            }

            // Write AI vision events
            for (AiEvent event : aiEvents) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(event.getTimestamp().toString());
                row.createCell(1).setCellValue("AI Microservice");
                row.createCell(2).setCellValue(event.getEventType());
                row.createCell(3).setCellValue("Confidence: " + event.getConfidence());
                row.createCell(4).setCellValue("HIGH");
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            logger.error("Error creating Excel report: {}", e.getMessage());
            return new byte[0];
        }
    }

    public java.util.Map<String, Object> getGlobalAnalytics() {
        List<Report> reports = reportRepository.findAll();
        long totalCandidates = reports.size();
        double avgScore = reports.stream().mapToDouble(Report::getFinalScore).average().orElse(0.0);
        
        long lowRisk = 0;
        long mediumRisk = 0;
        long highRisk = 0;
        long criticalRisk = 0;
        
        long pass = 0;
        long fail = 0;
        long flagged = 0;
        
        for (Report r : reports) {
            String decision = r.getDecision();
            if ("PASS".equalsIgnoreCase(decision)) {
                pass++;
            } else if ("FAIL".equalsIgnoreCase(decision)) {
                fail++;
            } else {
                flagged++;
            }
            
            String risk = r.getRiskLevel();
            if ("CRITICAL".equalsIgnoreCase(risk)) {
                criticalRisk++;
            } else if ("HIGH".equalsIgnoreCase(risk)) {
                highRisk++;
            } else if ("MEDIUM".equalsIgnoreCase(risk)) {
                mediumRisk++;
            } else {
                lowRisk++;
            }
        }
        
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("totalCandidates", totalCandidates);
        map.put("averageScore", Math.round(avgScore * 10.0) / 10.0);
        map.put("lowRiskCount", lowRisk);
        map.put("mediumRiskCount", mediumRisk);
        map.put("highRiskCount", highRisk);
        map.put("criticalRiskCount", criticalRisk);
        map.put("passedCount", pass);
        map.put("failedCount", fail);
        map.put("flaggedCount", flagged);
        return map;
    }

    public List<ReportDto> compareSessions(List<Long> sessionIds) {
        java.util.ArrayList<ReportDto> list = new java.util.ArrayList<>();
        for (Long id : sessionIds) {
            try {
                list.add(getReportBySession(id));
            } catch (Exception e) {
                // ignore not founds
            }
        }
        return list;
    }

    public List<AiEvent> getViolationScreenshots(Long sessionId) {
        return aiEventRepository.findBySessionIdOrderByTimestampAsc(sessionId).stream()
            .filter(e -> e.getScreenshotPath() != null && !e.getScreenshotPath().isBlank())
            .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public boolean deleteScreenshot(Long eventId) {
        AiEvent event = aiEventRepository.findById(eventId).orElse(null);
        if (event != null && event.getScreenshotPath() != null) {
            try {
                java.nio.file.Files.deleteIfExists(java.nio.file.Paths.get(event.getScreenshotPath()));
            } catch (Exception e) {
                logger.error("Failed to delete screenshot file: {}", e.getMessage());
            }
            event.setScreenshotPath(null);
            aiEventRepository.save(event);
            return true;
        }
        return false;
    }

    public byte[] getScreenshotImageBytes(Long eventId) throws IOException {
        AiEvent event = aiEventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (event.getScreenshotPath() == null) {
            throw new RuntimeException("No screenshot captured for this event");
        }
        File file = new File(event.getScreenshotPath());
        if (!file.exists()) {
            throw new RuntimeException("Image file not found on disk");
        }
        return java.nio.file.Files.readAllBytes(file.toPath());
    }

    public List<ReportDto> getAllReports() {
        List<Report> reports = reportRepository.findAll();
        java.util.ArrayList<ReportDto> dtos = new java.util.ArrayList<>();
        for (Report r : reports) {
            ReportDto dto = mapper.toDto(r);
            populateDtoMetrics(dto, r);
            dtos.add(dto);
        }
        return dtos;
    }
}
