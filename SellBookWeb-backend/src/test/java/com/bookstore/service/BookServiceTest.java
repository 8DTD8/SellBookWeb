package com.bookstore.service;

import com.bookstore.dto.BookDTO;
import com.bookstore.repository.BookRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class BookServiceTest {

    @Autowired
    private BookService bookService;

    @Autowired
    private BookRepository bookRepository;

    private BookDTO testBook;

    @BeforeEach
    public void setUp() {
        testBook = new BookDTO();
        testBook.setTitle("Test Book");
        testBook.setAuthor("Test Author");
        testBook.setDescription("Test Description");
        testBook.setPrice(99.99);
        testBook.setQuantity(10);
        testBook.setCategoryId("607f1f77bcf86cd799439011");
        testBook.setRating(0.0);
        testBook.setActive(true);
    }

    @Test
    public void testCreateBook() {
        BookDTO createdBook = bookService.createBook(testBook);
        assertNotNull(createdBook.getId());
        assertEquals("Test Book", createdBook.getTitle());
        assertEquals("Test Author", createdBook.getAuthor());
    }

    @Test
    public void testGetBookById() {
        BookDTO createdBook = bookService.createBook(testBook);
        BookDTO retrievedBook = bookService.getBookById(createdBook.getId());
        assertEquals(createdBook.getId(), retrievedBook.getId());
    }

    @Test
    public void testSearchBooks() {
        bookService.createBook(testBook);
        var books = bookService.searchBooks("Test");
        assertFalse(books.isEmpty());
    }
}
