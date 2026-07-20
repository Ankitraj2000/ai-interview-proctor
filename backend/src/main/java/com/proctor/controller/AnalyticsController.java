package com.proctor.controller;

import com.proctor.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@Tag(name = "Recruiter Analytics", description = "Endpoints for Interviewer Dashboard hiring metrics, score averages, and violation trends")
@SecurityRequirement(name = "Bearer Authentication")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/summary")
    @Operation(summary = "Get overall recruiter analytics and hiring statistics")
    public ResponseEntity<Map<String, Object>> getAnalyticsSummary() {
        return ResponseEntity.ok(analyticsService.getRecruiterAnalyticsSummary());
    }
}
