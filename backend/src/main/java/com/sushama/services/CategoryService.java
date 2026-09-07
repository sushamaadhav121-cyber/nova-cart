package com.sushama.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.sushama.entities.Category;
import com.sushama.repositories.CategoryRepository;
import com.sushama.repositories.ProductRepository;
import com.sushama.response_wrapper.UnivarsalResponse;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UnivarsalResponse response;

    // 1. Get all categories with Product Count (Dashboard)
    public ResponseEntity<?> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        
        // प्रत्येक कॅटेगरीमधील एकूण उत्पादनांची संख्या (Product Count) मोजणे
        for (Category cat : categories) {
            int count = (int) productRepository.countBySubCategory_Category_Id(cat.getId());
            cat.setProductCount(count);
        }
        
        return response.send("Following categories found", categories, HttpStatus.OK);
    }

    // 2. Add new category (Admin Only)
    public ResponseEntity<?> addCategory(Category category) {
        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            return response.send(category.getName() + " already exists", null, HttpStatus.CONFLICT);
        } else {
            category.setStatus("ACTIVE"); // Default Active
            Category savedCategory = categoryRepository.save(category);
            return response.send("Following category added", savedCategory, HttpStatus.CREATED);
        }
    }

    // 3. Update Category (Admin Only - Name & Description)
    public ResponseEntity<?> updateCategory(Long id, Category updatedData) {
        Optional<Category> optionalCategory = categoryRepository.findById(id);
        if (optionalCategory.isEmpty()) {
            return response.send("Category not found with ID: " + id, null, HttpStatus.NOT_FOUND);
        }

        Category existing = optionalCategory.get();
        existing.setName(updatedData.getName());
        existing.setDescription(updatedData.getDescription());

        Category savedCategory = categoryRepository.save(existing);
        return response.send("Category updated successfully", savedCategory, HttpStatus.OK);
    }

    // 4. Soft Delete / Deactivate Category (Admin Only)
    public ResponseEntity<?> deactivateCategory(Long id) {
        Optional<Category> optionalCategory = categoryRepository.findById(id);
        if (optionalCategory.isEmpty()) {
            return response.send("Category not found with ID: " + id, null, HttpStatus.NOT_FOUND);
        }

        Category existing = optionalCategory.get();
        existing.setStatus("INACTIVE"); // Soft Delete: status बदलून INACTIVE केला
        categoryRepository.save(existing);

        return response.send("Category deactivated successfully (Soft Deleted)", null, HttpStatus.OK);
    }

    // 5. Activate Category (Admin Only)
    public ResponseEntity<?> activateCategory(Long id) {
        Optional<Category> optionalCategory = categoryRepository.findById(id);
        if (optionalCategory.isEmpty()) {
            return response.send("Category not found with ID: " + id, null, HttpStatus.NOT_FOUND);
        }

        Category existing = optionalCategory.get();
        existing.setStatus("ACTIVE");
        categoryRepository.save(existing);

        return response.send("Category activated successfully", null, HttpStatus.OK);
    }
}