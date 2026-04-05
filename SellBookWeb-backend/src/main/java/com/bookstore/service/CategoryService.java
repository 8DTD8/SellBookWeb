package com.bookstore.service;

import com.bookstore.dto.CategoryDTO;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.model.Category;
import com.bookstore.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setIcon(categoryDTO.getIcon());
        category.setParentId(categoryDTO.getParentId());
        category.setActive(true);
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());
        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    public CategoryDTO getCategoryById(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return convertToDTO(category);
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findByActive(true).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO updateCategory(String id, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (categoryDTO.getName() != null) category.setName(categoryDTO.getName());
        if (categoryDTO.getDescription() != null) category.setDescription(categoryDTO.getDescription());
        if (categoryDTO.getIcon() != null) category.setIcon(categoryDTO.getIcon());
        if (categoryDTO.getParentId() != null) {
            category.setParentId(categoryDTO.getParentId());
        } else if (categoryDTO.getParentId() == null && category.getParentId() != null) {
            // Allow clearing parentId by sending null explicitly
            category.setParentId(null);
        }
        category.setUpdatedAt(LocalDateTime.now());
        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }

    public void deleteCategory(String id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found");
        }
        categoryRepository.deleteById(id);
    }

    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setIcon(category.getIcon());
        dto.setParentId(category.getParentId());
        dto.setActive(category.getActive());
        return dto;
    }
}
