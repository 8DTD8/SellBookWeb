package com.bookstore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "*")
public class AdminReportController {

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("period", "Monthly");
        report.put("totalRevenue", 0.0);
        report.put("message", "Revenue report generated");
        return ResponseEntity.ok(report);
    }

    @GetMapping("/sales")
    public ResponseEntity<Map<String, Object>> getSalesReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("period", "Monthly");
        report.put("totalSales", 0);
        report.put("message", "Sales report generated");
        return ResponseEntity.ok(report);
    }

    @GetMapping("/customers")
    public ResponseEntity<Map<String, Object>> getCustomerReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("totalCustomers", 0);
        report.put("activeCustomers", 0);
        report.put("message", "Customer report generated");
        return ResponseEntity.ok(report);
    }
}
