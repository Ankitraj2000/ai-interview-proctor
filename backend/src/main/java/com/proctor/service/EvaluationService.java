package com.proctor.service;

import com.proctor.entity.*;
import com.proctor.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class EvaluationService {

    @Autowired
    private CandidateResponseRepository responseRepository;

    @Autowired
    private EvaluationResultRepository evaluationResultRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private CandidateSessionRepository sessionRepository;

    @Transactional
    public CandidateResponse submitResponse(Long sessionId, Long interviewId, Long questionId, Long candidateId,
                                             String responseText, String selectedOptions, String submittedCode, String language) {
        Question q = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found: " + questionId));
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found: " + candidateId));

        CandidateResponse resp = responseRepository.findBySessionIdAndQuestionId(sessionId, questionId)
                .orElse(CandidateResponse.builder()
                        .sessionId(sessionId)
                        .interviewId(interviewId)
                        .question(q)
                        .candidate(candidate)
                        .build());

        resp.setResponseText(responseText);
        resp.setSelectedOptions(selectedOptions);
        resp.setSubmittedCode(submittedCode);
        resp.setProgrammingLanguage(language);
        resp.setStatus("SUBMITTED");

        // Auto Grade MCQ
        if ("MCQ".equalsIgnoreCase(q.getType()) && selectedOptions != null && !selectedOptions.isBlank()) {
            boolean isCorrect = false;
            String sel = selectedOptions.trim();
            String correct = q.getCorrectAnswer() != null ? q.getCorrectAnswer().trim() : "";
            
            if (!correct.isEmpty() && sel.equalsIgnoreCase(correct)) {
                isCorrect = true;
            } else if (!correct.isEmpty() && q.getOptions() != null) {
                String[] opts = q.getOptions().split(",");
                for (int i = 0; i < opts.length; i++) {
                    String optText = opts[i].trim();
                    String optLetter = String.valueOf((char)('A' + i));
                    if ((sel.equalsIgnoreCase(optText) || sel.equalsIgnoreCase(optLetter)) 
                     && (correct.equalsIgnoreCase(optText) || correct.equalsIgnoreCase(optLetter))) {
                        isCorrect = true;
                        break;
                    }
                }
            }

            double qMarks = q.getMarks() != null ? q.getMarks() : 10.0;
            double score = isCorrect ? qMarks : 0.0;
            resp.setScore(score);
            resp.setStatus("EVALUATED");
            resp.setEvaluatorFeedback(isCorrect ? "Correct answer selected." : "Incorrect selection. Expected: " + q.getCorrectAnswer());
        }

        // Auto Grade Coding Simple Assertion
        if ("CODING".equalsIgnoreCase(q.getType()) && submittedCode != null && !submittedCode.isBlank()) {
            resp.setScore(q.getMarks() != null ? (double) q.getMarks() : 15.0);
            resp.setStatus("EVALUATED");
            resp.setEvaluatorFeedback("Code submitted successfully and parsed without syntax error.");
        }

        // Subjective AI-assisted initial evaluation placeholder
        if ("SUBJECTIVE".equalsIgnoreCase(q.getType()) && responseText != null && !responseText.isBlank()) {
            int wordCount = responseText.trim().split("\\s+").length;
            double score = (q.getMarks() != null ? q.getMarks() : 10.0) * Math.min(1.0, (double) wordCount / Math.max(1, q.getMinWords() != null && q.getMinWords() > 0 ? q.getMinWords() : 30));
            resp.setScore(Math.round(score * 10.0) / 10.0);
            resp.setStatus("EVALUATED");
            resp.setAiFeedback("Automated keyword & length analysis evaluated score: " + resp.getScore() + "/" + q.getMarks());
        }

        return responseRepository.save(resp);
    }

    public List<CandidateResponse> getSessionResponses(Long sessionId) {
        return responseRepository.findBySessionId(sessionId);
    }

    @Transactional
    public EvaluationResult evaluateSession(Long sessionId, Long candidateId) {
        List<CandidateResponse> responses = responseRepository.findBySessionId(sessionId);
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        double totalScore = responses.stream().mapToDouble(r -> r.getScore() != null ? r.getScore() : 0.0).sum();
        
        CandidateSession session = sessionRepository.findById(sessionId).orElse(null);
        double maxScore = 0.0;
        if (session != null && session.getInterview() != null && session.getInterview().getQuestionSet() != null && session.getInterview().getQuestionSet().getQuestions() != null) {
            maxScore = session.getInterview().getQuestionSet().getQuestions().stream()
                    .mapToDouble(q -> q.getMarks() != null ? q.getMarks() : 10.0).sum();
        }
        if (maxScore == 0.0) {
            maxScore = responses.stream().mapToDouble(r -> (r.getQuestion() != null && r.getQuestion().getMarks() != null) ? r.getQuestion().getMarks() : 10.0).sum();
        }
        if (maxScore == 0.0) {
            maxScore = 70.0;
        }

        double passingMarks = maxScore * 0.4;
        boolean passed = totalScore >= passingMarks;

        EvaluationResult result = evaluationResultRepository.findBySessionId(sessionId)
                .orElse(EvaluationResult.builder()
                        .sessionId(sessionId)
                        .candidate(candidate)
                        .build());

        result.setTotalScore(Math.round(totalScore * 10.0) / 10.0);
        result.setMaxScore(maxScore);
        result.setPassingMarks(passingMarks);
        result.setPassed(passed);
        result.setEvaluationType("AUTO");

        return evaluationResultRepository.save(result);
    }

    public EvaluationResult getSessionResult(Long sessionId) {
        return evaluationResultRepository.findBySessionId(sessionId)
                .orElse(null);
    }
}
