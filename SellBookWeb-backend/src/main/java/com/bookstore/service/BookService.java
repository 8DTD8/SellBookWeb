package com.bookstore.service;

import com.bookstore.dto.BookDTO;
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
        Book book = new Book();
        book.setTitle(bookDTO.getTitle());
        book.setAuthor(bookDTO.getAuthor());
        book.setDescription(bookDTO.getDescription());
        book.setPrice(bookDTO.getPrice());
        book.setQuantity(bookDTO.getQuantity());
        book.setCategoryId(bookDTO.getCategoryId());
        book.setImage(bookDTO.getImage());
        // Nếu nhà cung cấp trống, dùng cùng tên với NXB
        String supplierName = bookDTO.getSupplierName();
        if ((supplierName == null || supplierName.trim().isEmpty()) && bookDTO.getPublisher() != null) {
            supplierName = bookDTO.getPublisher();
        }
        book.setSupplierName(supplierName);
        // Hình thức bìa: mặc định Bìa Mềm
        String coverType = bookDTO.getCoverType();
        if (coverType == null || coverType.trim().isEmpty()) {
            coverType = "Bìa Mềm";
        }
        book.setCoverType(coverType);
        book.setTranslator(bookDTO.getTranslator());
        book.setPublisher(bookDTO.getPublisher());
        book.setDiscount(bookDTO.getDiscount());
        book.setDiscountCode(bookDTO.getDiscountCode());
        book.setSalesCount(bookDTO.getSalesCount() != null ? bookDTO.getSalesCount() : 0);
        book.setRating(0.0);
        book.setActive(true);
        book.setCreatedAt(LocalDateTime.now());
        book.setUpdatedAt(LocalDateTime.now());
        Book savedBook = bookRepository.save(book);
        return convertToDTO(savedBook);
    }

    public BookDTO getBookById(String id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        return convertToDTO(book);
    }

    public List<BookDTO> searchBooks(String title) {
        return bookRepository.findByTitleContaining(title).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookDTO> booksByCategory(String categoryId) {
        return bookRepository.findByCategoryId(categoryId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookDTO> getAllBooks(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return bookRepository.findAll(pageable).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BookDTO updateBook(String id, BookDTO bookDTO) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        if (bookDTO.getTitle() != null) book.setTitle(bookDTO.getTitle());
        if (bookDTO.getAuthor() != null) book.setAuthor(bookDTO.getAuthor());
        if (bookDTO.getDescription() != null) book.setDescription(bookDTO.getDescription());
        if (bookDTO.getPrice() != null) book.setPrice(bookDTO.getPrice());
        if (bookDTO.getQuantity() != null) book.setQuantity(bookDTO.getQuantity());
        if (bookDTO.getImage() != null) book.setImage(bookDTO.getImage());
        if (bookDTO.getSupplierName() != null) {
            String supplierName = bookDTO.getSupplierName();
            if ((supplierName == null || supplierName.trim().isEmpty()) && bookDTO.getPublisher() != null) {
                supplierName = bookDTO.getPublisher();
            }
            book.setSupplierName(supplierName);
        }
        if (bookDTO.getCoverType() != null) {
            String coverType = bookDTO.getCoverType();
            if (coverType == null || coverType.trim().isEmpty()) {
                coverType = "Bìa Mềm";
            }
            book.setCoverType(coverType);
        }
        if (bookDTO.getTranslator() != null) book.setTranslator(bookDTO.getTranslator());
        if (bookDTO.getPublisher() != null) book.setPublisher(bookDTO.getPublisher());
        if (bookDTO.getDiscount() != null) book.setDiscount(bookDTO.getDiscount());
        if (bookDTO.getDiscountCode() != null) book.setDiscountCode(bookDTO.getDiscountCode());
        if (bookDTO.getSalesCount() != null) book.setSalesCount(bookDTO.getSalesCount());
        book.setUpdatedAt(LocalDateTime.now());
        Book updatedBook = bookRepository.save(book);
        return convertToDTO(updatedBook);
    }

    public void deleteBook(String id) {
        if (!bookRepository.existsById(id)) {
            throw new ResourceNotFoundException("Book not found");
        }
        bookRepository.deleteById(id);
    }

    private BookDTO convertToDTO(Book book) {
        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setDescription(book.getDescription());
        dto.setPrice(book.getPrice());
        dto.setQuantity(book.getQuantity());
        dto.setCategoryId(book.getCategoryId());
        dto.setImage(book.getImage());
        dto.setRating(book.getRating());
        dto.setSupplierName(book.getSupplierName());
        dto.setCoverType(book.getCoverType());
        dto.setTranslator(book.getTranslator());
        dto.setPublisher(book.getPublisher());
        dto.setDiscount(book.getDiscount());
        dto.setDiscountCode(book.getDiscountCode());
        dto.setSalesCount(book.getSalesCount());
        dto.setActive(book.getActive());
        return dto;
    }
}
