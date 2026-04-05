package com.bookstore.service;

import com.bookstore.common.constant.Constants;
import com.bookstore.common.validator.ValidationUtil;
import com.bookstore.dto.BookDTO;
import com.bookstore.dto.mapper.BookMapper;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.model.Book;
import com.bookstore.model.Wishlist;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.ReviewRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class BookService {
    private final BookRepository bookRepository;
    private final ReviewRepository reviewRepository;
    private final WishlistService wishlistService;
    private final NotificationService notificationService;

    public BookService(
            BookRepository bookRepository,
            ReviewRepository reviewRepository,
            WishlistService wishlistService,
            NotificationService notificationService) {
        this.bookRepository = bookRepository;
        this.reviewRepository = reviewRepository;
        this.wishlistService = wishlistService;
        this.notificationService = notificationService;
    }

    public BookDTO createBook(BookDTO bookDTO) {
        String normalizedTitle = normalizeTitle(bookDTO.getTitle());
        if (normalizedTitle == null || normalizedTitle.isEmpty()) {
            throw new IllegalArgumentException("Tên sách là bắt buộc");
        }
        if (isDuplicateTitle(normalizedTitle, null)) {
            throw new IllegalArgumentException("Tên sách đã tồn tại, vui lòng nhập tên khác");
        }

        bookDTO.setTitle(normalizedTitle);
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
        return enrichBookRating(BookMapper.toDTO(book));
    }

    public List<BookDTO> searchBooks(String title) {
        return bookRepository.findByTitleContaining(title).stream()
                .map(BookMapper::toDTO)
            .map(this::enrichBookRating)
                .collect(Collectors.toList());
    }

    public List<BookDTO> booksByCategory(String categoryId) {
        return bookRepository.findByCategoryId(categoryId).stream()
                .map(BookMapper::toDTO)
            .map(this::enrichBookRating)
                .collect(Collectors.toList());
    }

    public List<BookDTO> getAllBooks(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return bookRepository.findAll(pageable).stream()
                .map(BookMapper::toDTO)
            .map(this::enrichBookRating)
                .collect(Collectors.toList());
    }

    public BookDTO updateBook(String id, BookDTO bookDTO) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.ERROR_BOOK_NOT_FOUND));
        int previousQuantity = normalizeQuantity(book.getQuantity());

        if (bookDTO.getTitle() != null) {
            String normalizedTitle = normalizeTitle(bookDTO.getTitle());
            if (normalizedTitle == null || normalizedTitle.isEmpty()) {
                throw new IllegalArgumentException("Tên sách là bắt buộc");
            }
            if (isDuplicateTitle(normalizedTitle, id)) {
                throw new IllegalArgumentException("Tên sách đã tồn tại, vui lòng nhập tên khác");
            }
            bookDTO.setTitle(normalizedTitle);
        }
        
        // ✅ Update fields if provided
        updateBookFields(book, bookDTO);
        
        book.setUpdatedAt(LocalDateTime.now());
        Book updatedBook = bookRepository.save(book);
        notifyUsersIfBackInStock(updatedBook, previousQuantity);
        return BookMapper.toDTO(updatedBook);
    }

    public BookDTO increaseBookStock(String bookId, int addedQuantity) {
        if (addedQuantity <= 0) {
            throw new IllegalArgumentException("Số lượng nhập phải lớn hơn 0");
        }

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Sách không tồn tại: " + bookId));

        int previousQuantity = normalizeQuantity(book.getQuantity());
        book.setQuantity(previousQuantity + addedQuantity);
        book.setUpdatedAt(LocalDateTime.now());

        Book updatedBook = bookRepository.save(book);
        notifyUsersIfBackInStock(updatedBook, previousQuantity);
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

    private String normalizeTitle(String title) {
        if (title == null) {
            return null;
        }
        return title.trim().replaceAll("\\s+", " ");
    }

    private boolean isDuplicateTitle(String normalizedTitle, String excludeBookId) {
        String titleKey = normalizedTitle.toLowerCase(Locale.ROOT);
        return bookRepository.findAll().stream().anyMatch(existing -> {
            if (existing == null || existing.getTitle() == null) {
                return false;
            }
            if (excludeBookId != null && excludeBookId.equals(existing.getId())) {
                return false;
            }
            String existingTitleKey = normalizeTitle(existing.getTitle()).toLowerCase(Locale.ROOT);
            return existingTitleKey.equals(titleKey);
        });
    }

    private BookDTO enrichBookRating(BookDTO bookDTO) {
        if (bookDTO == null || bookDTO.getId() == null || bookDTO.getId().trim().isEmpty()) {
            return bookDTO;
        }

        double averageRating = reviewRepository.findByBookIdAndApproved(bookDTO.getId(), true).stream()
                .mapToInt(review -> review.getRating() == null ? 0 : review.getRating())
                .average()
                .orElse(Constants.BOOK_DEFAULT_RATING);

        bookDTO.setRating(averageRating);
        return bookDTO;
    }

    private int normalizeQuantity(Integer quantity) {
        return quantity == null ? 0 : Math.max(0, quantity);
    }

    private void notifyUsersIfBackInStock(Book book, int previousQuantity) {
        int currentQuantity = normalizeQuantity(book.getQuantity());
        if (previousQuantity > 0 || currentQuantity <= 0 || book.getId() == null) {
            return;
        }

        List<Wishlist> wishlists = wishlistService.getWishlistsByBookId(book.getId());
        wishlists.stream()
                .map(Wishlist::getUserId)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(userId -> !userId.isEmpty())
                .distinct()
                .forEach(userId -> notificationService.createWishlistRestockNotification(userId, book.getId(), book.getTitle()));
    }
}
