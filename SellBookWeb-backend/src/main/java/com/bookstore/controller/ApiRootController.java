package com.bookstore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Tránh 404/403 khi mở trực tiếp URL gốc của API (Render / trình duyệt).
 */
@RestController
public class ApiRootController {

    @GetMapping("/")
    public ResponseEntity<String> root() {
        return ResponseEntity.ok("SellBook API — dùng GET /api/health để kiểm tra.");
    }

    @GetMapping("/favicon.ico")
    public ResponseEntity<Void> favicon() {
        return ResponseEntity.noContent().build();
    }
}
