package com.bookstore.dto.mapper;

import com.bookstore.dto.OrderDTO;
import com.bookstore.model.Order;
import java.util.stream.Collectors;

/**
 * ✅ Order DTO Mapper
 * Centralized mapping between Order entity and OrderDTO
 */
public class OrderMapper {
    
    public static OrderDTO toDTO(Order order) {
        if (order == null) {
            return null;
        }
        
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setItems(order.getItems().stream()
                .map(item -> {
                    OrderDTO.OrderItemDTO itemDTO = new OrderDTO.OrderItemDTO();
                    itemDTO.setBookId(item.getBookId());
                    itemDTO.setTitle(item.getTitle());
                    itemDTO.setPrice(item.getPrice());
                    itemDTO.setQuantity(item.getQuantity());
                    return itemDTO;
                })
                .collect(Collectors.toList()));
        dto.setTotalPrice(order.getTotalPrice());
        dto.setStatus(order.getStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setCouponCode(order.getCouponCode());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setPhone(order.getPhone());
        dto.setCreatedAt(order.getCreatedAt());
        return dto;
    }
    
    public static Order toEntity(OrderDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Order order = new Order();
        order.setUserId(dto.getUserId());
        order.setItems(dto.getItems().stream()
                .map(itemDTO -> {
                    Order.OrderItem item = new Order.OrderItem();
                    item.setBookId(itemDTO.getBookId());
                    item.setTitle(itemDTO.getTitle());
                    item.setPrice(itemDTO.getPrice());
                    item.setQuantity(itemDTO.getQuantity());
                    return item;
                })
                .collect(Collectors.toList()));
        order.setTotalPrice(dto.getTotalPrice());
        order.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDING");
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setCouponCode(dto.getCouponCode());
        order.setShippingAddress(dto.getShippingAddress());
        order.setPhone(dto.getPhone());
        return order;
    }
}
