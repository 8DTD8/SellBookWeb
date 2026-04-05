package com.bookstore.service;

import com.bookstore.common.constant.Constants;
import com.bookstore.dto.PaymentDTO;
import com.bookstore.model.Order;
import com.bookstore.model.Payment;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    public PaymentService(PaymentRepository paymentRepository, OrderRepository orderRepository, NotificationService notificationService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.notificationService = notificationService;
    }

    public PaymentDTO createPayment(PaymentDTO paymentDTO) {
        if (paymentDTO == null || paymentDTO.getOrderId() == null || paymentDTO.getOrderId().trim().isEmpty()) {
            throw new IllegalArgumentException("Thiếu mã đơn hàng để tạo thanh toán");
        }

        Optional<Payment> existingPayment = paymentRepository.findByOrderId(paymentDTO.getOrderId());
        if (existingPayment.isPresent()) {
            return convertToDTO(existingPayment.get());
        }

        Order order = orderRepository.findById(paymentDTO.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException(Constants.ERROR_ORDER_NOT_FOUND));

        Payment payment = buildPayment(
                order,
                paymentDTO.getAmount() != null ? paymentDTO.getAmount() : order.getTotalPrice(),
                paymentDTO.getPaymentMethod() != null ? paymentDTO.getPaymentMethod() : order.getPaymentMethod()
        );

        Payment savedPayment = paymentRepository.save(payment);
        notifyIfCompleted(savedPayment, order);
        return convertToDTO(savedPayment);
    }

    public PaymentDTO createPaymentForOrder(Order order) {
        if (order == null || order.getId() == null || order.getId().trim().isEmpty()) {
            throw new IllegalArgumentException("Thiếu đơn hàng để tạo thanh toán");
        }

        Optional<Payment> existingPayment = paymentRepository.findByOrderId(order.getId());
        if (existingPayment.isPresent()) {
            return convertToDTO(existingPayment.get());
        }

        Payment payment = buildPayment(order, order.getTotalPrice(), order.getPaymentMethod());
        Payment savedPayment = paymentRepository.save(payment);
        notifyIfCompleted(savedPayment, order);
        return convertToDTO(savedPayment);
    }

    public PaymentDTO getPaymentByOrderId(String orderId) {
        return paymentRepository.findByOrderId(orderId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public PaymentDTO getPaymentById(String paymentId) {
        return paymentRepository.findById(paymentId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PaymentDTO updatePaymentStatus(String paymentId, String status) {
        Payment payment = paymentRepository.findById(paymentId).orElse(null);
        if (payment == null) {
            return null;
        }

        Order order = orderRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException(Constants.ERROR_ORDER_NOT_FOUND));

        String normalizedStatus = normalizeStatus(status);
        String previousStatus = payment.getPaymentStatus();

        if (Constants.PAYMENT_STATUS_REFUNDED.equals(normalizedStatus)) {
            if (!Constants.ORDER_STATUS_CANCELLED.equals(order.getStatus())) {
                throw new IllegalStateException("Chỉ có thể hoàn tiền khi đơn hàng đang ở trạng thái đã hủy");
            }

            if (!Constants.PAYMENT_STATUS_COMPLETED.equals(previousStatus)) {
                throw new IllegalStateException("Chỉ có thể hoàn tiền cho giao dịch đã thanh toán");
            }
        }

        payment.setPaymentStatus(normalizedStatus);
        if (Constants.PAYMENT_STATUS_COMPLETED.equals(normalizedStatus)) {
            if (payment.getPaymentDate() == null) {
                payment.setPaymentDate(LocalDateTime.now());
            }
            if (payment.getTransactionId() == null || payment.getTransactionId().trim().isEmpty()) {
                payment.setTransactionId(generateTransactionId(payment.getPaymentMethod()));
            }
        }
        payment.setUpdatedAt(LocalDateTime.now());

        Payment updated = paymentRepository.save(payment);
        if (!Constants.PAYMENT_STATUS_COMPLETED.equals(previousStatus)
                && Constants.PAYMENT_STATUS_COMPLETED.equals(normalizedStatus)) {
            notifyIfCompleted(updated, order);
        }
        return convertToDTO(updated);
    }

    public PaymentDTO refundPaymentForOrder(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);
        if (payment == null) {
            return null;
        }

        if (Constants.PAYMENT_STATUS_COMPLETED.equals(payment.getPaymentStatus())) {
            payment.setPaymentStatus(Constants.PAYMENT_STATUS_REFUNDED);
            payment.setUpdatedAt(LocalDateTime.now());
            return convertToDTO(paymentRepository.save(payment));
        }

        return convertToDTO(payment);
    }

    private Payment buildPayment(Order order, Double amount, String rawPaymentMethod) {
        String paymentMethod = normalizePaymentMethod(rawPaymentMethod);
        Payment payment = new Payment();
        payment.setOrderId(order.getId());
        payment.setAmount(amount != null ? amount : 0D);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus(Constants.PAYMENT_STATUS_PENDING);

        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());

        return payment;
    }

    private String normalizePaymentMethod(String paymentMethod) {
        String normalizedMethod = paymentMethod == null ? "COD" : paymentMethod.trim().toUpperCase(Locale.ROOT);
        switch (normalizedMethod) {
            case "BANK":
            case "MOMO":
            case "COD":
                return normalizedMethod;
            default:
                return "COD";
        }
    }

    private String normalizeStatus(String status) {
        String normalizedStatus = status == null ? Constants.PAYMENT_STATUS_PENDING : status.trim().toUpperCase(Locale.ROOT);
        switch (normalizedStatus) {
            case Constants.PAYMENT_STATUS_COMPLETED:
            case Constants.PAYMENT_STATUS_FAILED:
            case Constants.PAYMENT_STATUS_REFUNDED:
            case Constants.PAYMENT_STATUS_PENDING:
                return normalizedStatus;
            default:
                throw new IllegalArgumentException("Trạng thái thanh toán không hợp lệ");
        }
    }

    private String generateTransactionId(String paymentMethod) {
        return paymentMethod + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT);
    }

    private void notifyIfCompleted(Payment payment, Order order) {
        if (payment == null || order == null || !Constants.PAYMENT_STATUS_COMPLETED.equals(payment.getPaymentStatus())) {
            return;
        }

        if (order.getUserId() != null && !order.getUserId().trim().isEmpty()) {
            notificationService.createPaymentSuccessNotification(
                    order.getUserId(),
                    order.getId(),
                    payment.getPaymentMethod(),
                    payment.getAmount()
            );
        }
    }

    private PaymentDTO convertToDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        dto.setOrderId(payment.getOrderId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setPaymentStatus(payment.getPaymentStatus());
        dto.setTransactionId(payment.getTransactionId());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setPaymentDate(payment.getPaymentDate());
        return dto;
    }
}
