package com.bookstore.repository;

import com.bookstore.model.Wishlist;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends MongoRepository<Wishlist, String> {
    Optional<Wishlist> findByUserId(String userId);
    List<Wishlist> findByBookIdsContaining(String bookId);
}
