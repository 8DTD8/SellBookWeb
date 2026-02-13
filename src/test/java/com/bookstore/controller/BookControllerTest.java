package com.bookstore.controller;

import com.bookstore.dto.BookDTO;
import com.bookstore.service.BookService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class BookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private BookDTO testBook;

    @BeforeEach
    public void setUp() {
        testBook = new BookDTO();
        testBook.setTitle("Test Book");
        testBook.setAuthor("Test Author");
        testBook.setDescription("Test Description");
        testBook.setIsbn("1234567890");
        testBook.setPrice(99.99);
        testBook.setQuantity(10);
        testBook.setCategoryId("607f1f77bcf86cd799439011");
        testBook.setRating(0.0);
        testBook.setActive(true);
    }

    @Test
    public void testCreateBook() throws Exception {
        String bookJson = objectMapper.writeValueAsString(testBook);

        mockMvc.perform(post("/api/books")
                .contentType(MediaType.APPLICATION_JSON)
                .content(bookJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value(testBook.getTitle()))
                .andExpect(jsonPath("$.author").value(testBook.getAuthor()));
    }

    @Test
    public void testGetAllBooks() throws Exception {
        mockMvc.perform(get("/api/books")
                .contentType(MediaType.APPLICATION_JSON)
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    public void testSearchBooks() throws Exception {
        mockMvc.perform(get("/api/books/search")
                .contentType(MediaType.APPLICATION_JSON)
                .param("title", "Test"))
                .andExpect(status().isOk());
    }
}
