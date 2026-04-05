package com.bookstore.controller;

import com.bookstore.dto.WishlistDTO;
import com.bookstore.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlists")
public class WishlistController {
    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<WishlistDTO> getWishlist(@PathVariable String userId) {
        WishlistDTO wishlist = wishlistService.getWishlistByUserId(userId);
        if (wishlist == null) {
            wishlist = new WishlistDTO();
            wishlist.setUserId(userId);
            wishlist.setBookIds(new ArrayList<>());
        }
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<?> addBookToWishlist(
            @PathVariable String userId,
            @RequestParam String bookId) {
        try {
            WishlistDTO wishlist = wishlistService.addBookToWishlist(userId, bookId);
            return ResponseEntity.status(HttpStatus.CREATED).body(wishlist);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/remove")
    public ResponseEntity<?> removeBookFromWishlist(
            @PathVariable String userId,
            @RequestParam String bookId) {
        try {
            WishlistDTO wishlist = wishlistService.removeBookFromWishlist(userId, bookId);
            return ResponseEntity.ok(wishlist);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
