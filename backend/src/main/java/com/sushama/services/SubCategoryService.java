package com.sushama.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.sushama.entities.Category;
import com.sushama.entities.SubCategory;
import com.sushama.repositories.CategoryRepository;
import com.sushama.repositories.ProductRepository;
import com.sushama.repositories.SubCategoryRepository;
import com.sushama.response_wrapper.UnivarsalResponse;

@Service
public class SubCategoryService {

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UnivarsalResponse response;

    // 1. Get all sub-categories (with product count)
    public ResponseEntity<?> getAllSubCategories() {
        List<SubCategory> subCategories = subCategoryRepository.findAll();
        for (SubCategory sub : subCategories) {
            long count = productRepository.countBySubCategory_Id(sub.getId());
            sub.setProductCount((int) count);
        }
        return response.send("Following sub-categories found", subCategories, HttpStatus.OK);
    }

    // 2. Get sub-categories by category ID (Public / Dropdown use)
    public ResponseEntity<?> getSubCategoriesByCategory(Long categoryId) {
        List<SubCategory> list = subCategoryRepository.findByCategory_Id(categoryId);
        return response.send("Sub-categories for category " + categoryId, list, HttpStatus.OK);
    }

    // 3. Add Sub-Category (Admin Only)
    public ResponseEntity<?> addSubCategory(Long categoryId, SubCategory subCategory) {
        Optional<Category> catOpt = categoryRepository.findById(categoryId);
        if (catOpt.isEmpty()) {
            return response.send("Parent Category not found with ID: " + categoryId, null, HttpStatus.NOT_FOUND);
        }

        if (subCategoryRepository.existsByNameIgnoreCaseAndCategory_Id(subCategory.getName(), categoryId)) {
            return response.send("Sub-category '" + subCategory.getName() + "' already exists under this category", null, HttpStatus.CONFLICT);
        }

        subCategory.setCategory(catOpt.get());
        subCategory.setStatus("ACTIVE");
        SubCategory saved = subCategoryRepository.save(subCategory);

        return response.send("Sub-category added successfully", saved, HttpStatus.CREATED);
    }

    // 4. Update Sub-Category (Admin Only)
    public ResponseEntity<?> updateSubCategory(Long id, Long newCategoryId, SubCategory updatedData) {
        Optional<SubCategory> optionalSub = subCategoryRepository.findById(id);
        if (optionalSub.isEmpty()) {
            return response.send("Sub-category not found with ID: " + id, null, HttpStatus.NOT_FOUND);
        }

        SubCategory existing = optionalSub.get();
        existing.setName(updatedData.getName());

        if (newCategoryId != null) {
            Optional<Category> catOpt = categoryRepository.findById(newCategoryId);
            catOpt.ifPresent(existing::setCategory);
        }

        SubCategory saved = subCategoryRepository.save(existing);
        return response.send("Sub-category updated successfully", saved, HttpStatus.OK);
    }

    // 5. Soft Delete / Deactivate Sub-Category
    public ResponseEntity<?> deactivateSubCategory(Long id) {
        Optional<SubCategory> optionalSub = subCategoryRepository.findById(id);
        if (optionalSub.isEmpty()) {
            return response.send("Sub-category not found with ID: " + id, null, HttpStatus.NOT_FOUND);
        }

        SubCategory existing = optionalSub.get();
        existing.setStatus("INACTIVE");
        subCategoryRepository.save(existing);

        return response.send("Sub-category deactivated successfully", null, HttpStatus.OK);
    }

    // 6. Reactivate Sub-Category
    public ResponseEntity<?> activateSubCategory(Long id) {
        Optional<SubCategory> optionalSub = subCategoryRepository.findById(id);
        if (optionalSub.isEmpty()) {
            return response.send("Sub-category not found with ID: " + id, null, HttpStatus.NOT_FOUND);
        }

        SubCategory existing = optionalSub.get();
        existing.setStatus("ACTIVE");
        subCategoryRepository.save(existing);

        return response.send("Sub-category activated successfully", null, HttpStatus.OK);
    }
}