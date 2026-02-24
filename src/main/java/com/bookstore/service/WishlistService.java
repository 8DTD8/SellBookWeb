package com.bookstore.service;

import com.bookstore.dto.WishlistDTO;
import com.bookstore.model.Wishlist;
import com.bookstore.repository.WishlistRepository;
import org.springframework.stereotype.Service;

@Service
public class WishlistService {
    private final WishlistRepository wishlistRepository;

    public WishlistService(WishlistRepository wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }

    public WishlistDTO getWishlistByUserId(String userId) {
        return wishlistRepository.findByUserId(userId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public WishlistDTO addBookToWishlist(String userId, String bookId) {
        Wishlist wishlist = wishlistRepository.findByUserId(userId)
                .orElse(new Wishlist(userId));
        
        if (wishlist.getBookIds() == null) {
            wishlist.setBookIds(new java.util.ArrayList<>());
        }
        
        if (!wishlist.getBookIds().contains(bookId)) {
            wishlist.getBookIds().add(bookId);
        }
        
        Wishlist saved = wishlistRepository.save(wishlist);
        return convertToDTO(saved);
    }

    public WishlistDTO removeBookFromWishlist(String userId, String bookId) {
        Wishlist wishlist = wishlistRepository.findByUserId(userId).orElse(null);
        if (wishlist != null && wishlist.getBookIds() != null) {
            wishlist.getBookIds().remove(bookId);
            Wishlist saved = wishlistRepository.save(wishlist);
            return convertToDTO(saved);
        }
        return null;
    }

    private WishlistDTO convertToDTO(Wishlist wishlist) {
        WishlistDTO dto = new WishlistDTO();
        dto.setId(wishlist.getId());
        dto.setUserId(wishlist.getUserId());
        dto.setBookIds(wishlist.getBookIds());
        return dto;
    }
}
