package com.proctor.service;

import com.proctor.entity.QuestionCategory;
import com.proctor.repository.QuestionCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class QuestionCategoryService {

    @Autowired
    private QuestionCategoryRepository categoryRepository;

    public List<QuestionCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional
    public QuestionCategory createCategory(String name, String description) {
        if (categoryRepository.findByNameIgnoreCase(name).isPresent()) {
            return categoryRepository.findByNameIgnoreCase(name).get();
        }
        QuestionCategory cat = QuestionCategory.builder()
                .name(name)
                .description(description)
                .isCustom(true)
                .build();
        return categoryRepository.save(cat);
    }
}
