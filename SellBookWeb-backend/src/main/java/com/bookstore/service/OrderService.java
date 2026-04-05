package com.bookstore.service;

import com.bookstore.common.constant.Constants;
import com.bookstore.common.validator.ValidationUtil;
import com.bookstore.dto.OrderDTO;
import com.bookstore.dto.PaymentDTO;
import com.bookstore.dto.mapper.OrderMapper;
import com.bookstore.model.Book;
import com.bookstore.model.Order;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Map<String, List<String>> VALID_TRANSITIONS = new HashMap<>();
    static {
        VALID_TRANSITIONS.put(Constants.ORDER_STATUS_PENDING,   Arrays.asList(Constants.ORDER_STATUS_CONFIRMED, Constants.ORDER_STATUS_CANCELLED));
        VALID_TRANSITIONS.put(Constants.ORDER_STATUS_CONFIRMED, Arrays.asList(Constants.ORDER_STATUS_SHIPPED,   Constants.ORDER_STATUS_CANCELLED));
        VALID_TRANSITIONS.put(Constants.ORDER_STATUS_SHIPPED,   Arrays.asList(Constants.ORDER_STATUS_DELIVERED, Constants.ORDER_STATUS_CANCELLED));
        // DELIVERED and CANCELLED are terminal — no valid transitions
    }

    private static String getStatusLabel(String status) {
        if (status == null) return "Không xác định";
        switch (status) {
            case "PENDING":   return "Chờ xác nhận";
            case "CONFIRMED": return "Đã xác nhận";
            case "SHIPPED":   return "Đang vận chuyển";
            case "DELIVERED": return "Đã giao";
            case "CANCELLED": return "Đã hủy";
            default:          return status;
        }
    }

    private final OrderRepository orderRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final CouponService couponService;
    private final BookRepository bookRepository;
    private final PaymentService paymentService;

    public OrderService(OrderRepository orderRepository, UserService userService, NotificationService notificationService, CouponService couponService, BookRepository bookRepository, PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.userService = userService;
        this.notificationService = notificationService;
        this.couponService = couponService;
        this.bookRepository = bookRepository;
        this.paymentService = paymentService;
    }

    public OrderDTO createOrder(OrderDTO orderDTO) {
        if (orderDTO.getCouponCode() != null && !orderDTO.getCouponCode().trim().isEmpty()) {
            String normalizedCouponCode = orderDTO.getCouponCode().trim().toUpperCase();
            orderDTO.setCouponCode(normalizedCouponCode);
            couponService.consumeCouponUsage(normalizedCouponCode);
        }

        Order order = OrderMapper.toEntity(orderDTO);
        order.setStatus(Constants.ORDER_STATUS_PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        // Trừ số lượng tồn kho theo từng sản phẩm
        if (order.getItems() != null) {
            for (Order.OrderItem item : order.getItems()) {
                Book book = bookRepository.findById(item.getBookId())
                        .orElseThrow(() -> new IllegalArgumentException("Sách không tồn tại: " + item.getBookId()));
                int stock = book.getQuantity() != null ? book.getQuantity() : 0;
                if (stock < item.getQuantity()) {
                    throw new IllegalStateException("Sách '" + book.getTitle() + "' không đủ số lượng tồn kho (còn " + stock + ")");
                }
                book.setQuantity(stock - item.getQuantity());
                int sold = book.getSalesCount() != null ? book.getSalesCount() : 0;
                book.setSalesCount(sold + item.getQuantity());
                bookRepository.save(book);
            }
        }

        Order savedOrder = orderRepository.save(order);
        paymentService.createPaymentForOrder(savedOrder);
        return enrichOrderWithPayment(enrichOrderUserName(OrderMapper.toDTO(savedOrder)));
    }

    public OrderDTO getOrderById(String id) {
        if (!ValidationUtil.isValidId(id)) {
            throw new IllegalArgumentException(Constants.ERROR_INVALID_ID);
        }
        return orderRepository.findById(id)
                .map(OrderMapper::toDTO)
                .map(this::enrichOrderUserName)
            .map(this::enrichOrderWithPayment)
                .orElse(null);
    }

    public List<OrderDTO> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findAll(pageable).stream()
                .map(OrderMapper::toDTO)
                .map(this::enrichOrderUserName)
            .map(this::enrichOrderWithPayment)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getOrdersByUserId(String userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(OrderMapper::toDTO)
                .map(this::enrichOrderUserName)
            .map(this::enrichOrderWithPayment)
                .collect(Collectors.toList());
    }

    public OrderDTO updateOrderStatus(String id, String newStatus) {
        if (!ValidationUtil.isValidId(id)) {
            throw new IllegalArgumentException(Constants.ERROR_INVALID_ID);
        }
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(Constants.ERROR_ORDER_NOT_FOUND));
        
        String oldStatus = order.getStatus();
        List<String> validNext = VALID_TRANSITIONS.getOrDefault(oldStatus, Collections.emptyList());
        if (!validNext.contains(newStatus)) {
            throw new IllegalStateException(
                "Không thể chuyển trạng thái từ '" + getStatusLabel(oldStatus) + "' sang '" + getStatusLabel(newStatus) + "'"
            );
        }

        if (Constants.ORDER_STATUS_CONFIRMED.equals(newStatus) && requiresCompletedPayment(order)) {
            PaymentDTO payment = paymentService.getPaymentByOrderId(order.getId());
            if (payment == null || !Constants.PAYMENT_STATUS_COMPLETED.equals(payment.getPaymentStatus())) {
                throw new IllegalStateException("Chỉ có thể xác nhận đơn khi thanh toán chuyển khoản đã hoàn tất");
            }
        }

        // Hoàn lại số lượng tồn kho khi hủy đơn
        if (Constants.ORDER_STATUS_CANCELLED.equals(newStatus) && !Constants.ORDER_STATUS_CANCELLED.equals(oldStatus)) {
            if (order.getItems() != null) {
                for (Order.OrderItem item : order.getItems()) {
                    bookRepository.findById(item.getBookId()).ifPresent(book -> {
                        int stock = book.getQuantity() != null ? book.getQuantity() : 0;
                        book.setQuantity(stock + item.getQuantity());
                        int sold = book.getSalesCount() != null ? book.getSalesCount() : 0;
                        book.setSalesCount(Math.max(0, sold - item.getQuantity()));
                        bookRepository.save(book);
                    });
                }
            }
        }

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        
        Order updated = orderRepository.save(order);

        if (Constants.ORDER_STATUS_CANCELLED.equals(newStatus) && !Constants.ORDER_STATUS_CANCELLED.equals(oldStatus)) {
            paymentService.refundPaymentForOrder(updated.getId());
        }
        
        // ✅ Send notification if status changed
        if (!oldStatus.equals(newStatus)) {
            notifyOrderStatusChange(order.getUserId(), id, oldStatus, newStatus);
        }
        
        return enrichOrderWithPayment(enrichOrderUserName(OrderMapper.toDTO(updated)));
    }

    public OrderDTO cancelOrder(String id) {
        return updateOrderStatus(id, Constants.ORDER_STATUS_CANCELLED);
    }

    // ✅ PRIVATE HELPER METHOD - Extracted for readability
    
    private void notifyOrderStatusChange(String userId, String orderId, String oldStatus, String newStatus) {
        notificationService.createOrderStatusNotification(userId, orderId, oldStatus, newStatus);
    }

    private boolean requiresCompletedPayment(Order order) {
        if (order == null) {
            return false;
        }

        String paymentMethod = order.getPaymentMethod();
        if (paymentMethod == null) {
            return false;
        }

        String normalizedMethod = paymentMethod.trim().toUpperCase();
        return "BANK".equals(normalizedMethod) || "MOMO".equals(normalizedMethod);
    }

    private OrderDTO enrichOrderUserName(OrderDTO dto) {
        if (dto == null || dto.getUserId() == null || dto.getUserId().trim().isEmpty()) {
            return dto;
        }

        try {
            dto.setUserName(userService.getUserById(dto.getUserId()).getName());
        } catch (RuntimeException ex) {
            dto.setUserName(dto.getUserId());
        }

        return dto;
    }

    private OrderDTO enrichOrderWithPayment(OrderDTO dto) {
        if (dto == null || dto.getId() == null || dto.getId().trim().isEmpty()) {
            return dto;
        }

        PaymentDTO payment = paymentService.getPaymentByOrderId(dto.getId());
        if (payment == null) {
            return dto;
        }

        dto.setPaymentId(payment.getId());
        dto.setPaymentStatus(payment.getPaymentStatus());
        dto.setTransactionId(payment.getTransactionId());
        dto.setPaymentDate(payment.getPaymentDate());
        if (dto.getPaymentMethod() == null || dto.getPaymentMethod().trim().isEmpty()) {
            dto.setPaymentMethod(payment.getPaymentMethod());
        }

        return dto;
    }
}
