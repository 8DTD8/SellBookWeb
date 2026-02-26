package com.bookstore.service;

import com.bookstore.dto.CategoryDTO;
import com.bookstore.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class CategoryServiceTest {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private CategoryRepository categoryRepository;

    private CategoryDTO testCategory;

    @BeforeEach
    public void setUp() {
        testCategory = new CategoryDTO();
        testCategory.setName("Test Category");
        testCategory.setDescription("Test Description");
        testCategory.setIcon("icon.png");
        testCategory.setActive(true);
    }

    @Test
    public void testCreateCategory() {
        CategoryDTO createdCategory = categoryService.createCategory(testCategory);
        assertNotNull(createdCategory.getId());
        assertEquals("Test Category", createdCategory.getName());
    }

    @Test
    public void testGetCategoryById() {
        CategoryDTO createdCategory = categoryService.createCategory(testCategory);
        CategoryDTO retrievedCategory = categoryService.getCategoryById(createdCategory.getId());
        assertEquals(createdCategory.getId(), retrievedCategory.getId());
    }

    @Test
    public void testGetAllCategories() {
        categoryService.createCategory(testCategory);
        var categories = categoryService.getAllCategories();
        assertTrue(categories.size() >= 1);
    }
}
