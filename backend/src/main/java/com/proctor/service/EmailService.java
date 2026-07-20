package com.proctor.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String htmlContent) {
        logger.info("Preparing to send email to: {}, Subject: {}", to, subject);
        
        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured. Logging email content instead:\nTo: {}\nSubject: {}\nBody: {}", 
                       to, subject, htmlContent);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}. Logging email instead. (This is expected if your SMTP credentials are not configured)", to, e.getMessage());
        }
    }

    public void sendOtpEmail(String email, String otp) {
        logger.info("\n============================================\n  GENERATED OTP FOR {}: {}\n============================================", email, otp);
        String subject = "AI Proctor System - Verification OTP";
        String htmlContent = "<h2>AI Proctor System Verification</h2>" +
                "<p>Use the following One Time Password (OTP) to complete registration or password reset. " +
                "This OTP is valid for 10 minutes.</p>" +
                "<h3 style='color: #4F46E5; font-size: 24px; letter-spacing: 2px;'>" + otp + "</h3>" +
                "<p>If you did not request this, please ignore this email.</p>";
        sendEmail(email, subject, htmlContent);
    }

    public void sendInterviewInvite(String email, String title, String code, String start, String duration) {
        String subject = "Invitation to Take Proctored Interview: " + title;
        String htmlContent = "<h2>You have been scheduled for an interview</h2>" +
                "<p><strong>Interview Title:</strong> " + title + "</p>" +
                "<p><strong>Scheduled Time:</strong> " + start + "</p>" +
                "<p><strong>Duration:</strong> " + duration + " minutes</p>" +
                "<p><strong>Access Code:</strong> <span style='font-size: 18px; font-weight: bold; color: #4F46E5;'>" + code + "</span></p>" +
                "<p>Please log in to your dashboard and join the session at the scheduled time.</p>";
        sendEmail(email, subject, htmlContent);
    }
}
