package com.bookstore.controller;

import com.bookstore.dto.PaymentDTO;
import com.bookstore.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/payments")
public class AdminPaymentController {
    private final PaymentService paymentService;

    public AdminPaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPayments() {
        Map<String, Object> response = new HashMap<>();
        response.put("payments", paymentService.getAllPayments());
        response.put("message", "Payments retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPaymentById(@PathVariable String id) {
        PaymentDTO payment = paymentService.getPaymentById(id);
        if (payment == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("payment", payment);
        response.put("message", "Payment retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updatePaymentStatus(
            @PathVariable String id,
            @RequestParam String status) {
        if (!isValidPaymentStatus(status)) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Invalid payment status. Allowed values: PENDING, COMPLETED, FAILED, REFUNDED");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            PaymentDTO payment = paymentService.updatePaymentStatus(id, status);
            if (payment == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("payment", payment);
            response.put("message", "Payment status updated successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (IllegalStateException ex) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", ex.getMessage());
            return ResponseEntity.status(409).body(response);
        }
    }

    private boolean isValidPaymentStatus(String status) {
        return status != null && (
            status.equals("PENDING")
                || status.equals("COMPLETED")
                || status.equals("FAILED")
                || status.equals("REFUNDED")
        );
    }
}