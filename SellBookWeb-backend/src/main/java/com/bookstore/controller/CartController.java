package com.bookstore.controller;

import com.bookstore.dto.CartDTO;
import com.bookstore.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<CartDTO> getCart(@PathVariable String userId) {
        CartDTO cart = cartService.getCart(userId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<CartDTO> addItemToCart(
            @PathVariable String userId,
            @RequestParam String bookId,
            @RequestParam(defaultValue = "1") Integer quantity) {
        CartDTO cart = cartService.addItemToCart(userId, bookId, quantity);
        return ResponseEntity.status(HttpStatus.CREATED).body(cart);
    }

    @PutMapping("/{userId}/update")
    public ResponseEntity<CartDTO> updateCartItem(
            @PathVariable String userId,
            @RequestParam String bookId,
            @RequestParam Integer quantity) {
        CartDTO cart = cartService.updateCartItem(userId, bookId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/{userId}/remove")
    public ResponseEntity<CartDTO> removeItemFromCart(
            @PathVariable String userId,
            @RequestParam String bookId) {
        CartDTO cart = cartService.removeItemFromCart(userId, bookId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<String> clearCart(@PathVariable String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok("Cart cleared successfully");
    }
}
