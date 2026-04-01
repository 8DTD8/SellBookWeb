package com.bookstore.controller;

import com.bookstore.dto.ReviewDTO;
import com.bookstore.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(@RequestBody ReviewDTO reviewDTO) {
        ReviewDTO createdReview = reviewService.createReview(reviewDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReview);
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByBook(@PathVariable String bookId) {
        List<ReviewDTO> reviews = reviewService.getReviewsByBook(bookId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewDTO>> getUserReviews(@PathVariable String userId) {
        List<ReviewDTO> reviews = reviewService.getUserReviews(userId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ReviewDTO>> getPendingReviews() {
        List<ReviewDTO> reviews = reviewService.getPendingReviews();
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ReviewDTO> approveReview(@PathVariable String id) {
        ReviewDTO reviewDTO = reviewService.approveReview(id);
        return ResponseEntity.ok(reviewDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteReview(@PathVariable String id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok("Review deleted successfully");
    }
}
