package com.bookstore.controller;

import com.bookstore.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "*")
public class AdminOrderController {
    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Map<String, Object> response = new HashMap<>();
        response.put("orders", orderService.getAllOrders(page, size));
        response.put("message", "Orders retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOrderById(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        response.put("order", orderService.getOrderById(id));
        response.put("message", "Order retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable String id,
            @RequestParam String status) {
        Map<String, Object> response = new HashMap<>();
        response.put("order", orderService.updateOrderStatus(id, status));
        response.put("message", "Order status updated successfully");
        return ResponseEntity.ok(response);
    }
}
