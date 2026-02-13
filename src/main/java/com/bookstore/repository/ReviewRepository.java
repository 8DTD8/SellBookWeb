package com.bookstore.repository;

import com.bookstore.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByBookId(String bookId);
    List<Review> findByUserId(String userId);
    List<Review> findByBookIdAndApproved(String bookId, Boolean approved);
}
