package com.proctor.service;

import com.proctor.entity.Question;
import com.proctor.entity.QuestionSet;
import com.proctor.repository.QuestionRepository;
import com.proctor.repository.QuestionSetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionSetService {

    @Autowired
    private QuestionSetRepository questionSetRepository;

    @Autowired
    private QuestionRepository questionRepository;

    public List<QuestionSet> getAllQuestionSets() {
        return questionSetRepository.findAll();
    }

    public QuestionSet getQuestionSetById(Long id) {
        return questionSetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question Set not found with ID: " + id));
    }

    @Transactional
    public QuestionSet saveQuestionSet(QuestionSet questionSet) {
        if (questionSet.getQuestions() != null) {
            questionSet.setTotalQuestions(questionSet.getQuestions().size());
            int totalMarks = questionSet.getQuestions().stream()
                    .mapToInt(q -> q.getMarks() != null ? q.getMarks() : 10)
                    .sum();
            questionSet.setTotalMarks(totalMarks > 0 ? totalMarks : 100);
            if (questionSet.getPassingMarks() == null || questionSet.getPassingMarks() == 0) {
                questionSet.setPassingMarks((int) (questionSet.getTotalMarks() * 0.4));
            }
        }
        return questionSetRepository.save(questionSet);
    }

    @Transactional
    public QuestionSet cloneQuestionSet(Long id) {
        QuestionSet orig = getQuestionSetById(id);
        QuestionSet copy = QuestionSet.builder()
                .name("Clone of " + orig.getName())
                .description(orig.getDescription())
                .category(orig.getCategory())
                .difficulty(orig.getDifficulty())
                .totalQuestions(orig.getTotalQuestions())
                .totalMarks(orig.getTotalMarks())
                .passingMarks(orig.getPassingMarks())
                .durationMinutes(orig.getDurationMinutes())
                .randomizeOrder(orig.getRandomizeOrder())
                .questions(new ArrayList<>(orig.getQuestions()))
                .build();
        return questionSetRepository.save(copy);
    }

    @Transactional
    public QuestionSet generateRandomQuestionSet(String name, String category, String difficulty, String type, int count, int durationMinutes) {
        List<Question> randomQuestions = questionRepository.findRandomQuestions(
            (category != null && !category.isBlank()) ? category : null,
            (difficulty != null && !difficulty.isBlank()) ? difficulty : null,
            (type != null && !type.isBlank()) ? type : null,
            count > 0 ? count : 5
        );

        int totalMarks = randomQuestions.stream()
                .mapToInt(q -> q.getMarks() != null ? q.getMarks() : 10)
                .sum();

        QuestionSet set = QuestionSet.builder()
                .name(name != null && !name.isBlank() ? name : "Random Assessment Set (" + (category != null ? category : "Mixed") + ")")
                .description("Auto-generated random question paper set.")
                .category(category != null && !category.isBlank() ? category : "General")
                .difficulty(difficulty != null && !difficulty.isBlank() ? difficulty : "MEDIUM")
                .totalQuestions(randomQuestions.size())
                .totalMarks(totalMarks > 0 ? totalMarks : 50)
                .passingMarks((int) ((totalMarks > 0 ? totalMarks : 50) * 0.4))
                .durationMinutes(durationMinutes > 0 ? durationMinutes : 60)
                .randomizeOrder(true)
                .questions(randomQuestions)
                .build();

        return questionSetRepository.save(set);
    }

    @Transactional
    public void deleteQuestionSet(Long id) {
        questionSetRepository.deleteById(id);
    }

    @Transactional
    public QuestionSet addQuestionToSet(Long setId, Long questionId) {
        QuestionSet set = getQuestionSetById(setId);
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found with ID: " + questionId));
        if (!set.getQuestions().contains(question)) {
            set.getQuestions().add(question);
            set.setTotalQuestions(set.getQuestions().size());
        }
        return questionSetRepository.save(set);
    }

    @Transactional
    public QuestionSet removeQuestionFromSet(Long setId, Long questionId) {
        QuestionSet set = getQuestionSetById(setId);
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found with ID: " + questionId));
        set.getQuestions().remove(question);
        set.setTotalQuestions(set.getQuestions().size());
        return questionSetRepository.save(set);
    }
}
