package com.bookstore.controller;

import com.bookstore.dto.CategoryDTO;
import com.bookstore.service.CategoryService;
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
public class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private CategoryDTO testCategory;

    @BeforeEach
    public void setUp() {
        testCategory = new CategoryDTO();
        testCategory.setName("Test Category");
        testCategory.setDescription("Test Category Description");
        testCategory.setIcon("icon.png");
        testCategory.setActive(true);
    }

    @Test
    public void testCreateCategory() throws Exception {
        String categoryJson = objectMapper.writeValueAsString(testCategory);

        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(testCategory.getName()));
    }

    @Test
    public void testGetAllCategories() throws Exception {
        mockMvc.perform(get("/api/categories")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
