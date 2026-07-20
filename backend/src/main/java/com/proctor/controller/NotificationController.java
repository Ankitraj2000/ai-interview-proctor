package com.proctor.controller;

import com.proctor.entity.Notification;
import com.proctor.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/notifications")
@Tag(name = "Notifications", description = "Real-time user event notifications management")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get all notifications for the authenticated user")
    public ResponseEntity<List<Notification>> getAllNotifications(Principal principal) {
        List<Notification> notifications = notificationService.getNotificationsForUser(principal.getName());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    @Operation(summary = "Get only unread notifications for the authenticated user")
    public ResponseEntity<List<Notification>> getUnreadNotifications(Principal principal) {
        List<Notification> notifications = notificationService.getUnreadNotificationsForUser(principal.getName());
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id, Principal principal) {
        Notification notification = notificationService.markAsRead(id, principal.getName());
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Void> markAllAsRead(Principal principal) {
        notificationService.markAllAsRead(principal.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a notification")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, Principal principal) {
        notificationService.deleteNotification(id, principal.getName());
        return ResponseEntity.ok().build();
    }
}
