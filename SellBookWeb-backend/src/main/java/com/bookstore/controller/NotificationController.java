package com.bookstore.controller;

import com.bookstore.model.Notification;
import com.bookstore.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(@RequestParam String userId) {
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@RequestParam String userId) {
        List<Notification> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@RequestParam String userId) {
        long count = notificationService.getUnreadCount(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("count", count);
        response.put("message", "Unread count retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        Notification notification = notificationService.markAsRead(id);
        if (notification == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<Map<String, String>> markAllAsRead(@RequestParam String userId) {
        notificationService.markAllAsRead(userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }
}
