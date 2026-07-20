package com.proctor.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.proctor.entity.CodingTestCase;
import com.proctor.entity.Question;
import com.proctor.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.io.StringReader;
import java.util.*;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Question> getAllQuestions(String category, String difficulty, String type, String search, Boolean archived) {
        return questionRepository.findFilteredQuestions(
            (category != null && !category.isBlank()) ? category : null,
            (difficulty != null && !difficulty.isBlank()) ? difficulty : null,
            (type != null && !type.isBlank()) ? type : null,
            (search != null && !search.isBlank()) ? search : null,
            archived != null ? archived : false
        );
    }

    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with ID: " + id));
    }

    @Transactional
    public Question saveQuestion(Question question) {
        if (question.getTestCases() != null) {
            for (CodingTestCase tc : question.getTestCases()) {
                tc.setQuestion(question);
            }
        }
        return questionRepository.save(question);
    }

    @Transactional
    public Question duplicateQuestion(Long id) {
        Question orig = getQuestionById(id);
        Question copy = Question.builder()
                .title("Copy of " + orig.getTitle())
                .text(orig.getText())
                .type(orig.getType())
                .category(orig.getCategory())
                .difficulty(orig.getDifficulty())
                .topic(orig.getTopic())
                .estimatedTimeMinutes(orig.getEstimatedTimeMinutes())
                .marks(orig.getMarks())
                .negativeMarks(orig.getNegativeMarks())
                .options(orig.getOptions())
                .correctAnswer(orig.getCorrectAnswer())
                .mcqType(orig.getMcqType())
                .starterCode(orig.getStarterCode())
                .constraints(orig.getConstraints())
                .explanation(orig.getExplanation())
                .imageUrl(orig.getImageUrl())
                .codeSnippet(orig.getCodeSnippet())
                .minWords(orig.getMinWords())
                .maxWords(orig.getMaxWords())
                .evaluationType(orig.getEvaluationType())
                .version(1)
                .isArchived(false)
                .build();

        if (orig.getTestCases() != null) {
            List<CodingTestCase> copiedTestCases = new ArrayList<>();
            for (CodingTestCase tc : orig.getTestCases()) {
                copiedTestCases.add(CodingTestCase.builder()
                        .question(copy)
                        .sampleInput(tc.getSampleInput())
                        .sampleOutput(tc.getSampleOutput())
                        .isHidden(tc.getIsHidden())
                        .explanation(tc.getExplanation())
                        .orderIndex(tc.getOrderIndex())
                        .build());
            }
            copy.setTestCases(copiedTestCases);
        }

        return questionRepository.save(copy);
    }

    @Transactional
    public Question archiveQuestion(Long id) {
        Question q = getQuestionById(id);
        q.setIsArchived(true);
        return questionRepository.save(q);
    }

    @Transactional
    public Question restoreQuestion(Long id) {
        Question q = getQuestionById(id);
        q.setIsArchived(false);
        return questionRepository.save(q);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }

    @Transactional
    public void bulkDelete(List<Long> ids) {
        questionRepository.deleteAllById(ids);
    }

    @Transactional
    public void importQuestionsFromCsv(String csvContent) {
        try (BufferedReader reader = new BufferedReader(new StringReader(csvContent))) {
            String line;
            boolean isHeader = true;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                if (isHeader && (line.toLowerCase().contains("text") || line.toLowerCase().contains("title"))) {
                    isHeader = false;
                    continue;
                }
                isHeader = false;

                String[] tokens = line.split(",(?=([^\"]*\"[^\"]*\")*[^\"]*$)");
                if (tokens.length >= 4) {
                    String title = cleanToken(tokens[0]);
                    String text = tokens.length >= 2 ? cleanToken(tokens[1]) : title;
                    String type = cleanToken(tokens[2]).toUpperCase();
                    String category = cleanToken(tokens[3]);
                    String difficulty = tokens.length >= 5 ? cleanToken(tokens[4]).toUpperCase() : "MEDIUM";
                    String options = tokens.length >= 6 ? cleanToken(tokens[5]) : null;
                    String correctAnswer = tokens.length >= 7 ? cleanToken(tokens[6]) : null;

                    Question q = Question.builder()
                            .title(title)
                            .text(text)
                            .type(type)
                            .category(category)
                            .difficulty(difficulty)
                            .options(options)
                            .correctAnswer(correctAnswer)
                            .build();
                    questionRepository.save(q);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV content: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void importQuestionsFromJson(String jsonContent) {
        try {
            List<Question> questions = objectMapper.readValue(jsonContent, new TypeReference<List<Question>>() {});
            for (Question q : questions) {
                q.setId(null);
                questionRepository.save(q);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse JSON content: " + e.getMessage(), e);
        }
    }

    public byte[] exportQuestions(String format, String category, String difficulty, String type) {
        List<Question> questions = getAllQuestions(category, difficulty, type, null, false);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        if ("json".equalsIgnoreCase(format)) {
            try {
                return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(questions);
            } catch (Exception e) {
                throw new RuntimeException("JSON export failed", e);
            }
        } else {
            // Default CSV / Plain Text report
            try (PrintWriter writer = new PrintWriter(out)) {
                writer.println("ID,Title,Text,Type,Category,Difficulty,Marks,Options,CorrectAnswer");
                for (Question q : questions) {
                    writer.printf("%d,\"%s\",\"%s\",%s,\"%s\",%s,%d,\"%s\",\"%s\"%n",
                            q.getId(),
                            escapeCsv(q.getTitle()),
                            escapeCsv(q.getText()),
                            q.getType(),
                            escapeCsv(q.getCategory()),
                            q.getDifficulty(),
                            q.getMarks() != null ? q.getMarks() : 10,
                            escapeCsv(q.getOptions()),
                            escapeCsv(q.getCorrectAnswer()));
                }
                writer.flush();
                return out.toByteArray();
            }
        }
    }

    private String cleanToken(String token) {
        if (token == null) return "";
        String trimmed = token.trim();
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed.replace("\"\"", "\"");
    }

    private String escapeCsv(String str) {
        if (str == null) return "";
        return str.replace("\"", "\"\"");
    }

    public List<Question> getRandomQuestions(String category, String difficulty, String type, int limit) {
        return questionRepository.findRandomQuestions(
            (category != null && !category.isBlank()) ? category : null,
            (difficulty != null && !difficulty.isBlank()) ? difficulty : null,
            (type != null && !type.isBlank()) ? type : null,
            limit
        );
    }
}
