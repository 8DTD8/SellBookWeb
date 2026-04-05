package com.bookstore.service;

import com.bookstore.common.constant.Constants;
import com.bookstore.model.Notification;
import com.bookstore.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(String userId, String orderId, String type, String title, String message) {
        return createNotification(userId, orderId, null, type, title, message);
    }

    public Notification createNotification(String userId, String orderId, String bookId, String type, String title, String message) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setOrderId(orderId);
        notification.setBookId(bookId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    public void createOrderStatusNotification(String userId, String orderId, String oldStatus, String newStatus) {
        String title = "Cập nhật trạng thái đơn hàng";
        String message = String.format("Đơn hàng #%s đã được cập nhật từ \"%s\" thành \"%s\"", 
            orderId, getStatusText(oldStatus), getStatusText(newStatus));
        
        createNotification(userId, orderId, "ORDER_STATUS_CHANGED", title, message);
    }

    public void createWishlistRestockNotification(String userId, String bookId, String bookTitle) {
        String title = "Sách trong wishlist đã có hàng";
        String message = String.format("Sách \"%s\" trong wishlist của bạn vừa có hàng trở lại.", bookTitle);
        createNotification(
            userId,
            null,
            bookId,
            Constants.NOTIFICATION_TYPE_WISHLIST_BACK_IN_STOCK,
            title,
            message
        );
    }

    public void createPaymentSuccessNotification(String userId, String orderId, String paymentMethod, Double amount) {
        String title = "Thanh toán thành công";
        String methodText = getPaymentMethodText(paymentMethod);
        String amountText = amount == null ? "0" : String.format("%,.0f", amount);
        String message = String.format(
            "Thanh toán cho đơn hàng #%s bằng %s đã thành công. Số tiền: %s VND.",
            orderId,
            methodText,
            amountText
        );

        createNotification(userId, orderId, Constants.NOTIFICATION_TYPE_PAYMENT_SUCCESS, title, message);
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public Notification markAsRead(String notificationId) {
        if (notificationId == null || notificationId.isEmpty()) {
            return null;
        }
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null && !notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            return notificationRepository.save(notification);
        }
        return notification;
    }

    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    private String getStatusText(String status) {
        switch(status) {
            case "PENDING": return "Chờ xác nhận";
            case "CONFIRMED": return "Đã xác nhận";
            case "SHIPPED": return "Đang vận chuyển";
            case "DELIVERED": return "Đã giao";
            case "CANCELLED": return "Đã hủy";
            default: return status;
        }
    }

    private String getPaymentMethodText(String paymentMethod) {
        if (paymentMethod == null) {
            return "thanh toán";
        }

        switch (paymentMethod.toUpperCase()) {
            case "COD":
                return "thanh toán khi nhận hàng";
            case "BANK":
                return "chuyển khoản ngân hàng";
            case "MOMO":
                return "ví MoMo";
            default:
                return paymentMethod;
        }
    }
}
