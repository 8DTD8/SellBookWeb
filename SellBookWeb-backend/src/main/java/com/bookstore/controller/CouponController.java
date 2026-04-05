package com.bookstore.controller;

import com.bookstore.dto.CouponDTO;
import com.bookstore.service.CouponService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {
    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping
    public ResponseEntity<?> createCoupon(@RequestBody CouponDTO couponDTO) {
        try {
            CouponDTO created = couponService.createCoupon(couponDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CouponDTO> getCouponById(@PathVariable String id) {
        CouponDTO coupon = couponService.getCouponById(id);
        return ResponseEntity.ok(coupon);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<?> getCouponByCode(@PathVariable String code) {
        try {
            CouponDTO coupon = couponService.getCouponByCode(code);
            if (coupon == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            return ResponseEntity.ok(coupon);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<CouponDTO>> getAllCoupons() {
        List<CouponDTO> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(coupons);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable String id, @RequestBody CouponDTO couponDTO) {
        try {
            CouponDTO updated = couponService.updateCoupon(id, couponDTO);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCoupon(@PathVariable String id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok("Coupon deleted successfully");
    }
}
