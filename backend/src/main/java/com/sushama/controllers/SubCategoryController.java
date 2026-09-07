package com.sushama.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sushama.entities.SubCategory;
import com.sushama.services.SubCategoryService;

@RestController
@CrossOrigin
public class SubCategoryController {

    @Autowired
    private SubCategoryService subCategoryService;

    // Public Fetch APIs
    @GetMapping("/api/v1/get/sub-categories")
    public ResponseEntity<?> getAllSubCategories() {
        return subCategoryService.getAllSubCategories();
    }

    @GetMapping("/api/v1/get/categories/{categoryId}/sub-categories")
    public ResponseEntity<?> getSubCategoriesByCategory(@PathVariable Long categoryId) {
        return subCategoryService.getSubCategoriesByCategory(categoryId);
    }

    // Admin CRUD APIs
    @PostMapping("/api/v1/admin/categories/{categoryId}/sub-categories")
    public ResponseEntity<?> addSubCategory(@PathVariable Long categoryId, @RequestBody SubCategory subCategory) {
        return subCategoryService.addSubCategory(categoryId, subCategory);
    }

    @PutMapping("/api/v1/admin/sub-categories/{id}")
    public ResponseEntity<?> updateSubCategory(
            @PathVariable Long id,
            @RequestParam(required = false) Long categoryId,
            @RequestBody SubCategory subCategory) {
        return subCategoryService.updateSubCategory(id, categoryId, subCategory);
    }

    @PutMapping("/api/v1/admin/sub-categories/{id}/deactivate")
    public ResponseEntity<?> deactivateSubCategory(@PathVariable Long id) {
        return subCategoryService.deactivateSubCategory(id);
    }

    @PutMapping("/api/v1/admin/sub-categories/{id}/activate")
    public ResponseEntity<?> activateSubCategory(@PathVariable Long id) {
        return subCategoryService.activateSubCategory(id);
    }
}