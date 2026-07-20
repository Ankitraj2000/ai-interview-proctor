package com.proctor.service;

import com.proctor.dto.UserDto;
import com.proctor.entity.Resume;
import com.proctor.entity.User;
import com.proctor.mapper.ProctorMapper;
import com.proctor.repository.ResumeRepository;
import com.proctor.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ProctorMapper mapper;

    @Value("${app.upload.resumes}")
    private String resumeUploadDir;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(mapper::toDto)
                .toList();
    }

    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found with email: " + email));
        return mapper.toDto(user);
    }

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Transactional
    public UserDto updateUserProfile(String email, UserDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        user.setSkills(dto.getSkills());
        user.setEducation(dto.getEducation());
        user.setPhoto(dto.getPhoto());
        user.setAddress(dto.getAddress());
        user.setDob(dto.getDob());
        user.setGender(dto.getGender());
        user.setBio(dto.getBio());
        user.setLinkedinUrl(dto.getLinkedinUrl());
        user.setGithubUrl(dto.getGithubUrl());
        user.setPortfolioUrl(dto.getPortfolioUrl());
        user.setCertifications(dto.getCertifications());
        user.setExperience(dto.getExperience());

        return mapper.toDto(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Current password does not match.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        notificationService.createNotification(user, "Password Changed", "Your account password was updated successfully.", "SECURITY_ALERT");
    }

    @Transactional
    public void deleteUserResume(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        Resume resume = resumeRepository.findByUserId(user.getId()).orElse(null);
        if (resume != null) {
            try {
                File file = new File(resume.getFilePath());
                if (file.exists()) {
                    file.delete();
                }
            } catch (Exception e) {
                // Ignore file removal errors
            }
            resumeRepository.delete(resume);
            notificationService.createNotification(user, "Resume Removed", "Your uploaded resume has been removed.", "RESUME_DELETED");
        }
    }

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @Transactional
    public void deleteUser(Long id) {
        // Find the user to delete
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return;
        }

        // Delete audit logs
        entityManager.createNativeQuery("DELETE FROM audit_logs WHERE user_id = :userId")
                .setParameter("userId", id).executeUpdate();

        // Delete notifications
        entityManager.createNativeQuery("DELETE FROM notifications WHERE user_id = :userId")
                .setParameter("userId", id).executeUpdate();

        // Delete resumes (including file cleanup)
        Resume resume = resumeRepository.findByUserId(id).orElse(null);
        if (resume != null) {
            try {
                File resumeFile = new File(resume.getFilePath());
                if (resumeFile.exists()) {
                    resumeFile.delete();
                }
            } catch (Exception e) {
                // Ignore file cleanup issues during user deletion
            }
            resumeRepository.delete(resume);
        }

        // Find candidate sessions for this user
        List<Long> sessionIds = entityManager.createQuery(
                "SELECT s.id FROM CandidateSession s WHERE s.user.id = :userId", Long.class)
                .setParameter("userId", id).getResultList();

        // Find interviews where the user is candidate or creator
        List<Long> interviewIds = entityManager.createQuery(
                "SELECT i.id FROM Interview i WHERE i.candidate.id = :userId OR i.creator.id = :userId", Long.class)
                .setParameter("userId", id).getResultList();

        // For all these interviews, also find their session IDs
        if (!interviewIds.isEmpty()) {
            List<Long> interviewSessionIds = entityManager.createQuery(
                    "SELECT s.id FROM CandidateSession s WHERE s.interview.id IN :interviewIds", Long.class)
                    .setParameter("interviewIds", interviewIds).getResultList();
            for (Long sId : interviewSessionIds) {
                if (!sessionIds.contains(sId)) {
                    sessionIds.add(sId);
                }
            }
        }

        // Delete reports, cheating logs, and ai events for all these sessions
        if (!sessionIds.isEmpty()) {
            // Delete report files from disk first
            List<String> reportFilePaths = entityManager.createQuery(
                    "SELECT r.filePath FROM Report r WHERE r.session.id IN :sessionIds", String.class)
                    .setParameter("sessionIds", sessionIds).getResultList();
            for (String rPath : reportFilePaths) {
                if (rPath != null) {
                    try {
                        File rFile = new File(rPath);
                        if (rFile.exists()) {
                            rFile.delete();
                        }
                    } catch (Exception e) {
                        // Ignore file delete errors
                    }
                }
            }

            entityManager.createNativeQuery("DELETE FROM reports WHERE session_id IN :sessionIds")
                    .setParameter("sessionIds", sessionIds).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM cheating_logs WHERE session_id IN :sessionIds")
                    .setParameter("sessionIds", sessionIds).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM ai_events WHERE session_id IN :sessionIds")
                    .setParameter("sessionIds", sessionIds).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM candidate_sessions WHERE id IN :sessionIds")
                    .setParameter("sessionIds", sessionIds).executeUpdate();
        }

        // Delete interview schedule and interview itself
        if (!interviewIds.isEmpty()) {
            entityManager.createNativeQuery("DELETE FROM interview_schedule WHERE interview_id IN :interviewIds")
                    .setParameter("interviewIds", interviewIds).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM interviews WHERE id IN :interviewIds")
                    .setParameter("interviewIds", interviewIds).executeUpdate();
        }

        // Delete from user_roles join table
        entityManager.createNativeQuery("DELETE FROM user_roles WHERE user_id = :userId")
                .setParameter("userId", id).executeUpdate();

        // Finally delete the user
        entityManager.createNativeQuery("DELETE FROM users WHERE id = :userId")
                .setParameter("userId", id).executeUpdate();
    }

    @Transactional
    public void saveUserResume(String email, MultipartFile file) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        File dir = new File(resumeUploadDir).getAbsoluteFile();
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File destFile = new File(dir, fileName).getAbsoluteFile();
        String filePath = destFile.getAbsolutePath();

        // Transfer file to server storage
        file.transferTo(destFile);

        // Simple resume parsing simulation (text extraction)
        String mockParsedText = "Resume parsed from: " + file.getOriginalFilename() + "\n" +
                "Name: " + user.getFirstName() + " " + user.getLastName() + "\n" +
                "Email: " + user.getEmail() + "\n" +
                "Experience: Mock extracted details from file. Size: " + file.getSize() + " bytes.";

        Resume resume = resumeRepository.findByUserId(user.getId()).orElse(null);
        if (resume == null) {
            resume = Resume.builder()
                    .user(user)
                    .fileName(file.getOriginalFilename())
                    .filePath(filePath)
                    .fileSize(file.getSize())
                    .parsedText(mockParsedText)
                    .build();
        } else {
            // Delete old file
            File oldFile = new File(resume.getFilePath());
            if (oldFile.exists()) {
                oldFile.delete();
            }
            resume.setFileName(file.getOriginalFilename());
            resume.setFilePath(filePath);
            resume.setFileSize(file.getSize());
            resume.setParsedText(mockParsedText);
        }

        resumeRepository.save(resume);
        notificationService.createNotification(user, "Resume Uploaded", "Your resume '" + file.getOriginalFilename() + "' was uploaded and parsed successfully.", "RESUME_UPLOADED");
    }

    public Resume getResumeByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        return resumeRepository.findByUserId(user.getId()).orElse(null);
    }

    @Transactional
    public UserDto adminUpdateUser(Long id, UserDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found with ID: " + id));

        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getSkills() != null) user.setSkills(dto.getSkills());

        return mapper.toDto(userRepository.save(user));
    }

    @Transactional
    public void toggleUserStatus(Long id, boolean isEnabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        user.setIsEnabled(isEnabled);
        userRepository.save(user);
    }

    @Transactional
    public void adminResetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
