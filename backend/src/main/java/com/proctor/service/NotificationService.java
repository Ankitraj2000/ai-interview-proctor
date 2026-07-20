package com.proctor.service;

import com.proctor.entity.Notification;
import com.proctor.entity.User;
import com.proctor.repository.NotificationRepository;
import com.proctor.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Notification> getNotificationsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public List<Notification> getUnreadNotificationsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
    }

    public Notification createNotification(User user, String title, String message, String type) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Notification not found."));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Error: Unauthorized to mark this notification as read.");
        }

        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Notification not found."));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Error: Unauthorized to delete this notification.");
        }

        notificationRepository.delete(notification);
    }
}
