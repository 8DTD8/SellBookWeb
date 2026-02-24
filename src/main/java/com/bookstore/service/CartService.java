package com.bookstore.service;

import com.bookstore.dto.CartDTO;
import com.bookstore.model.Cart;
import com.bookstore.model.Book;
import com.bookstore.repository.CartRepository;
import com.bookstore.repository.BookRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {
    private final CartRepository cartRepository;
    private final BookRepository bookRepository;

    public CartService(CartRepository cartRepository, BookRepository bookRepository) {
        this.cartRepository = cartRepository;
        this.bookRepository = bookRepository;
    }

    public CartDTO getCart(String userId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            // Create new cart if not exists
            cart = new Cart();
            cart.setUserId(userId);
            cart.setItems(new ArrayList<>());
            cart.setTotalPrice(0.0);
            cart.setCreatedAt(LocalDateTime.now());
            cart.setUpdatedAt(LocalDateTime.now());
            cart = cartRepository.save(cart);
        }
        return convertToDTO(cart);
    }

    public CartDTO addItemToCart(String userId, String bookId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    newCart.setItems(new ArrayList<>());
                    newCart.setTotalPrice(0.0);
                    newCart.setCreatedAt(LocalDateTime.now());
                    newCart.setUpdatedAt(LocalDateTime.now());
                    return newCart;
                });

        Book book = bookRepository.findById(bookId).orElse(null);
        if (book == null) return null;

        // Check if item already exists
        boolean itemExists = false;
        for (Cart.CartItem item : cart.getItems()) {
            if (item.getBookId().equals(bookId)) {
                item.setQuantity(item.getQuantity() + quantity);
                itemExists = true;
                break;
            }
        }

        if (!itemExists) {
            Cart.CartItem newItem = new Cart.CartItem();
            newItem.setBookId(bookId);
            newItem.setTitle(book.getTitle());
            newItem.setPrice(book.getPrice());
            newItem.setQuantity(quantity);
            cart.getItems().add(newItem);
        }

        updateTotalPrice(cart);
        cart.setUpdatedAt(LocalDateTime.now());
        Cart saved = cartRepository.save(cart);
        return convertToDTO(saved);
    }

    public CartDTO updateCartItem(String userId, String bookId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) return null;

        for (Cart.CartItem item : cart.getItems()) {
            if (item.getBookId().equals(bookId)) {
                item.setQuantity(quantity);
                break;
            }
        }

        updateTotalPrice(cart);
        cart.setUpdatedAt(LocalDateTime.now());
        Cart saved = cartRepository.save(cart);
        return convertToDTO(saved);
    }

    public CartDTO removeItemFromCart(String userId, String bookId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) return null;

        cart.setItems(cart.getItems().stream()
                .filter(item -> !item.getBookId().equals(bookId))
                .collect(Collectors.toList()));

        updateTotalPrice(cart);
        cart.setUpdatedAt(LocalDateTime.now());
        Cart saved = cartRepository.save(cart);
        return convertToDTO(saved);
    }

    public void clearCart(String userId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart != null) {
            cart.setItems(new ArrayList<>());
            cart.setTotalPrice(0.0);
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepository.save(cart);
        }
    }

    private void updateTotalPrice(Cart cart) {
        Double total = 0.0;
        for (Cart.CartItem item : cart.getItems()) {
            total += item.getPrice() * item.getQuantity();
        }
        cart.setTotalPrice(total);
    }

    private CartDTO convertToDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUserId());
        dto.setTotalPrice(cart.getTotalPrice());
        dto.setItems(cart.getItems().stream()
                .map(item -> {
                    CartDTO.CartItemDTO itemDTO = new CartDTO.CartItemDTO();
                    itemDTO.setBookId(item.getBookId());
                    itemDTO.setTitle(item.getTitle());
                    itemDTO.setPrice(item.getPrice());
                    itemDTO.setQuantity(item.getQuantity());
                    return itemDTO;
                })
                .collect(Collectors.toList()));
        return dto;
    }
}
