package com.bookstore.controller;

import com.bookstore.dto.BookDTO;
import com.bookstore.service.BookService;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(maxAge = 3600)
public class BookController {
    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @PostMapping
    public ResponseEntity<?> createBook(@Valid @RequestBody BookDTO bookDTO) {
        // ✅ Input validation automatically via @Valid
        BookDTO createdBook = bookService.createBook(bookDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBook);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookById(@PathVariable String id) {
        // ✅ Validate ID format
        if (id == null || id.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Book ID is required"));
        }
        
        BookDTO bookDTO = bookService.getBookById(id);
        return ResponseEntity.ok(bookDTO);
    }

    @GetMapping
    public ResponseEntity<?> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        // ✅ Validate pagination parameters
        if (page < 0 || size < 1 || size > 100) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Invalid pagination: page >= 0, 1 <= size <= 100"));
        }
        
        List<BookDTO> books = bookService.getAllBooks(page, size);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchBooks(
        @RequestParam(required = true) String title) {
        
        // ✅ Validate search input
        if (title == null || title.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Search title is required"));
        }
        
        if (title.length() > 100) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Search title must be less than 100 characters"));
        }
        
        List<BookDTO> books = bookService.searchBooks(title);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getBooksByCategory(@PathVariable String categoryId) {
        // ✅ Validate category ID
        if (categoryId == null || categoryId.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Category ID is required"));
        }
        
        List<BookDTO> books = bookService.booksByCategory(categoryId);
        return ResponseEntity.ok(books);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBook(
        @PathVariable String id,
        @Valid @RequestBody BookDTO bookDTO) {
        
        // ✅ Validate ID
        if (id == null || id.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Book ID is required"));
        }
        
        BookDTO updatedBook = bookService.updateBook(id, bookDTO);
        return ResponseEntity.ok(updatedBook);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable String id) {
        // ✅ Validate ID
        if (id == null || id.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Book ID is required"));
        }
        
        bookService.deleteBook(id);
        return ResponseEntity.ok(new SuccessResponse("Book deleted successfully"));
    }

    // ✅ Error response class
    public static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() { return error; }
    }

    // ✅ Success response class
    public static class SuccessResponse {
        private String message;

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
    }
}
