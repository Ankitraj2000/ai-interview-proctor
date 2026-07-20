package com.proctor.controller;

import com.proctor.entity.InterviewTemplate;
import com.proctor.service.InterviewTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/interview-templates")
@Tag(name = "Interview Templates", description = "Endpoints for managing interview assessment templates")
@SecurityRequirement(name = "Bearer Authentication")
public class InterviewTemplateController {

    @Autowired
    private InterviewTemplateService templateService;

    @GetMapping
    @Operation(summary = "Get all interview templates")
    public ResponseEntity<List<InterviewTemplate>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get template by ID")
    public ResponseEntity<InterviewTemplate> getTemplateById(@PathVariable Long id) {
        return ResponseEntity.ok(templateService.getTemplateById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Create or update interview template")
    public ResponseEntity<InterviewTemplate> createTemplate(@RequestBody InterviewTemplate template) {
        return ResponseEntity.ok(templateService.saveTemplate(template));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    @Operation(summary = "Delete interview template")
    public ResponseEntity<String> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok("Interview template deleted successfully.");
    }
}
