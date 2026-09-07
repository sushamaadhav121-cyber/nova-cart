package com.sushama.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sushama.entities.Category;
import com.sushama.services.CategoryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // 1. सर्व Categories मिळवणे (Dashboard साठी Product count सह)
    @GetMapping("/get/categories")
    public ResponseEntity<?> getAllCategories() {
        return categoryService.getAllCategories();
    }

    // 2. नवीन Category जोडणे (Admin)
    @PostMapping("/admin/categories")
    public ResponseEntity<?> addCategory(@Valid @RequestBody Category category) {
        return categoryService.addCategory(category);
    }

    // 3. Category Update / Edit करणे (Name आणि Description बदलण्यासाठी)
    @PutMapping("/admin/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @Valid @RequestBody Category category) {
        return categoryService.updateCategory(id, category);
    }

    // 4. Soft Delete / Deactivate करणे (Status 'INACTIVE' करण्यासाठी)
    @PutMapping("/admin/categories/{id}/deactivate")
    public ResponseEntity<?> deactivateCategory(@PathVariable Long id) {
        return categoryService.deactivateCategory(id);
    }

    // 5. Category पुन्हा Activate करण्यासाठी (ऐच्छिक)
    @PutMapping("/admin/categories/{id}/activate")
    public ResponseEntity<?> activateCategory(@PathVariable Long id) {
        return categoryService.activateCategory(id);
    }
}