package com.bookstore.service;

import com.bookstore.common.constant.Constants;
import com.bookstore.common.validator.ValidationUtil;
import com.bookstore.dto.BookDTO;
import com.bookstore.dto.mapper.BookMapper;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.model.Book;
import com.bookstore.repository.BookRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookService {
    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public BookDTO createBook(BookDTO bookDTO) {
        Book book = BookMapper.toEntity(bookDTO);
        
        // ✅ Set optional fields with sanitization
        book.setSupplierName(ValidationUtil.sanitizeSupplierName(
            bookDTO.getSupplierName(), 
            bookDTO.getPublisher()
        ));
        book.setCoverType(ValidationUtil.sanitizeCoverType(bookDTO.getCoverType()));
        
        // ✅ Set defaults
        book.setRating(Constants.BOOK_DEFAULT_RATING);
        book.setActive(true);
        book.setCreatedAt(LocalDateTime.now());
        book.setUpdatedAt(LocalDateTime.now());
        
        Book savedBook = bookRepository.save(book);
        return BookMapper.toDTO(savedBook);
    }

    public BookDTO getBookById(String id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.ERROR_BOOK_NOT_FOUND));
        return BookMapper.toDTO(book);
    }

    public List<BookDTO> searchBooks(String title) {
        return bookRepository.findByTitleContaining(title).stream()
                .map(BookMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<BookDTO> booksByCategory(String categoryId) {
        return bookRepository.findByCategoryId(categoryId).stream()
                .map(BookMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<BookDTO> getAllBooks(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return bookRepository.findAll(pageable).stream()
                .map(BookMapper::toDTO)
                .collect(Collectors.toList());
    }

    public BookDTO updateBook(String id, BookDTO bookDTO) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.ERROR_BOOK_NOT_FOUND));
        
        // ✅ Update fields if provided
        updateBookFields(book, bookDTO);
        
        book.setUpdatedAt(LocalDateTime.now());
        Book updatedBook = bookRepository.save(book);
        return BookMapper.toDTO(updatedBook);
    }

    public void deleteBook(String id) {
        if (!bookRepository.existsById(id)) {
            throw new ResourceNotFoundException(Constants.ERROR_BOOK_NOT_FOUND);
        }
        bookRepository.deleteById(id);
    }

    // ✅ PRIVATE HELPER METHODS - Extracted for readability
    
    /**
     * Update book fields from DTO if values are provided
     */
    private void updateBookFields(Book book, BookDTO bookDTO) {
        if (bookDTO.getTitle() != null) {
            book.setTitle(bookDTO.getTitle());
        }
        if (bookDTO.getAuthor() != null) {
            book.setAuthor(bookDTO.getAuthor());
        }
        if (bookDTO.getDescription() != null) {
            book.setDescription(bookDTO.getDescription());
        }
        if (bookDTO.getPrice() != null) {
            book.setPrice(bookDTO.getPrice());
        }
        if (bookDTO.getQuantity() != null) {
            book.setQuantity(bookDTO.getQuantity());
        }
        if (bookDTO.getImage() != null) {
            book.setImage(bookDTO.getImage());
        }
        
        // ✅ Use sanitization utility
        if (bookDTO.getSupplierName() != null || bookDTO.getPublisher() != null) {
            String sanitizedSupplier = ValidationUtil.sanitizeSupplierName(
                bookDTO.getSupplierName(),
                bookDTO.getPublisher()
            );
            if (sanitizedSupplier != null) {
                book.setSupplierName(sanitizedSupplier);
            }
        }
        
        if (bookDTO.getCoverType() != null) {
            book.setCoverType(ValidationUtil.sanitizeCoverType(bookDTO.getCoverType()));
        }
        
        if (bookDTO.getTranslator() != null) {
            book.setTranslator(bookDTO.getTranslator());
        }
        if (bookDTO.getPublisher() != null) {
            book.setPublisher(bookDTO.getPublisher());
        }
        if (bookDTO.getDiscount() != null) {
            book.setDiscount(bookDTO.getDiscount());
        }
        if (bookDTO.getDiscountCode() != null) {
            book.setDiscountCode(bookDTO.getDiscountCode());
        }
        if (bookDTO.getSalesCount() != null) {
            book.setSalesCount(bookDTO.getSalesCount());
        }
    }
}
