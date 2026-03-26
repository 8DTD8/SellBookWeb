package com.bookstore.dto.mapper;

import com.bookstore.dto.BookDTO;
import com.bookstore.model.Book;

/**
 * ✅ Book DTO Mapper
 * Centralized mapping between Book entity and BookDTO
 * Follows Single Responsibility Principle
 */
public class BookMapper {
    
    public static BookDTO toDTO(Book book) {
        if (book == null) {
            return null;
        }
        
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
    
    public static Book toEntity(BookDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Book book = new Book();
        book.setTitle(dto.getTitle());
        book.setAuthor(dto.getAuthor());
        book.setDescription(dto.getDescription());
        book.setPrice(dto.getPrice());
        book.setQuantity(dto.getQuantity());
        book.setCategoryId(dto.getCategoryId());
        book.setImage(dto.getImage());
        book.setSupplierName(dto.getSupplierName());
        book.setCoverType(dto.getCoverType());
        book.setTranslator(dto.getTranslator());
        book.setPublisher(dto.getPublisher());
        book.setDiscount(dto.getDiscount());
        book.setDiscountCode(dto.getDiscountCode());
        book.setSalesCount(dto.getSalesCount() != null ? dto.getSalesCount() : 0);
        book.setRating(0.0);
        book.setActive(true);
        return book;
    }
}
