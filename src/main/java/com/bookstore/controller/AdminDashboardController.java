package com.bookstore.controller;

import com.bookstore.service.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class AdminDashboardController {
    private final BookService bookService;

    public AdminDashboardController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBooks", bookService.getAllBooks(0, 1000).size());
        stats.put("message", "Dashboard statistics retrieved");
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", 0.0);
        stats.put("message", "Revenue statistics retrieved");
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/top-books")
    public ResponseEntity<Map<String, Object>> getTopBooks() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("topBooks", bookService.getAllBooks(0, 5));
        stats.put("message", "Top books retrieved");
        return ResponseEntity.ok(stats);
    }
}
