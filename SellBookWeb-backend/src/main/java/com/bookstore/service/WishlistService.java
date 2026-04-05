package com.bookstore.service;

import com.bookstore.dto.WishlistDTO;
import com.bookstore.model.Book;
import com.bookstore.model.Wishlist;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final BookRepository bookRepository;

    public WishlistService(WishlistRepository wishlistRepository, BookRepository bookRepository) {
        this.wishlistRepository = wishlistRepository;
        this.bookRepository = bookRepository;
    }

    public WishlistDTO getWishlistByUserId(String userId) {
        return wishlistRepository.findByUserId(userId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public WishlistDTO addBookToWishlist(String userId, String bookId) {
        validateWishlistInput(userId, bookId);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Sách không tồn tại"));

        Wishlist wishlist = wishlistRepository.findByUserId(userId)
                .orElse(new Wishlist(userId));

        if (wishlist.getCreatedAt() == null) {
            wishlist.setCreatedAt(LocalDateTime.now());
        }
        
        if (wishlist.getBookIds() == null) {
            wishlist.setBookIds(new java.util.ArrayList<>());
        }
        
        if (!wishlist.getBookIds().contains(bookId)) {
            wishlist.getBookIds().add(bookId);
        }

        wishlist.setUpdatedAt(LocalDateTime.now());
        
        Wishlist saved = wishlistRepository.save(wishlist);
        return convertToDTO(saved);
    }

    public WishlistDTO removeBookFromWishlist(String userId, String bookId) {
        validateWishlistInput(userId, bookId);
        Wishlist wishlist = wishlistRepository.findByUserId(userId).orElse(null);
        if (wishlist != null && wishlist.getBookIds() != null) {
            wishlist.getBookIds().remove(bookId);
            wishlist.setUpdatedAt(LocalDateTime.now());
            Wishlist saved = wishlistRepository.save(wishlist);
            return convertToDTO(saved);
        }
        return null;
    }

    public List<Wishlist> getWishlistsByBookId(String bookId) {
        if (bookId == null || bookId.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return wishlistRepository.findByBookIdsContaining(bookId.trim());
    }

    private void validateWishlistInput(String userId, String bookId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID là bắt buộc");
        }
        if (bookId == null || bookId.trim().isEmpty()) {
            throw new IllegalArgumentException("Book ID là bắt buộc");
        }
    }

    private WishlistDTO convertToDTO(Wishlist wishlist) {
        WishlistDTO dto = new WishlistDTO();
        dto.setId(wishlist.getId());
        dto.setUserId(wishlist.getUserId());
        dto.setBookIds(wishlist.getBookIds());
        return dto;
    }
}
