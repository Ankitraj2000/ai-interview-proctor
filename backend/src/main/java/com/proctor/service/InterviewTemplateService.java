package com.proctor.service;

import com.proctor.entity.InterviewTemplate;
import com.proctor.repository.InterviewTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class InterviewTemplateService {

    @Autowired
    private InterviewTemplateRepository templateRepository;

    public List<InterviewTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    public InterviewTemplate getTemplateById(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview Template not found with ID: " + id));
    }

    @Transactional
    public InterviewTemplate saveTemplate(InterviewTemplate template) {
        return templateRepository.save(template);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        templateRepository.deleteById(id);
    }
}
