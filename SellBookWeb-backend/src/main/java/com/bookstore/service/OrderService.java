package com.bookstore.service;

import com.bookstore.common.constant.Constants;
import com.bookstore.common.validator.ValidationUtil;
import com.bookstore.dto.OrderDTO;
import com.bookstore.dto.mapper.OrderMapper;
import com.bookstore.model.Order;
import com.bookstore.repository.OrderRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepository, UserService userService, NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    public OrderDTO createOrder(OrderDTO orderDTO) {
        Order order = OrderMapper.toEntity(orderDTO);
        order.setStatus(Constants.ORDER_STATUS_PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        
        Order savedOrder = orderRepository.save(order);
        return OrderMapper.toDTO(savedOrder);
    }

    public OrderDTO getOrderById(String id) {
        if (!ValidationUtil.isValidId(id)) {
            throw new IllegalArgumentException(Constants.ERROR_INVALID_ID);
        }
        return orderRepository.findById(id)
                .map(OrderMapper::toDTO)
                .orElse(null);
    }

    public List<OrderDTO> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findAll(pageable).stream()
                .map(OrderMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getOrdersByUserId(String userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(OrderMapper::toDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO updateOrderStatus(String id, String newStatus) {
        if (!ValidationUtil.isValidId(id)) {
            throw new IllegalArgumentException(Constants.ERROR_INVALID_ID);
        }
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(Constants.ERROR_ORDER_NOT_FOUND));
        
        String oldStatus = order.getStatus();
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        
        Order updated = orderRepository.save(order);
        
        // ✅ Send notification if status changed
        if (!oldStatus.equals(newStatus)) {
            notifyOrderStatusChange(order.getUserId(), id, oldStatus, newStatus);
        }
        
        return OrderMapper.toDTO(updated);
    }

    public OrderDTO cancelOrder(String id) {
        return updateOrderStatus(id, Constants.ORDER_STATUS_CANCELLED);
    }

    // ✅ PRIVATE HELPER METHOD - Extracted for readability
    
    private void notifyOrderStatusChange(String userId, String orderId, String oldStatus, String newStatus) {
        notificationService.createOrderStatusNotification(userId, orderId, oldStatus, newStatus);
    }
}
