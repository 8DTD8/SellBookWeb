package com.bookstore.controller;

import com.bookstore.dto.WishlistDTO;
import com.bookstore.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<WishlistDTO> addBookToWishlist(
            @PathVariable String userId,
            @RequestParam String bookId) {
        WishlistDTO wishlist = wishlistService.addBookToWishlist(userId, bookId);
        return ResponseEntity.status(HttpStatus.CREATED).body(wishlist);
    }

    @DeleteMapping("/{userId}/remove")
    public ResponseEntity<WishlistDTO> removeBookFromWishlist(
            @PathVariable String userId,
            @RequestParam String bookId) {
        WishlistDTO wishlist = wishlistService.removeBookFromWishlist(userId, bookId);
        return ResponseEntity.ok(wishlist);
    }
}
