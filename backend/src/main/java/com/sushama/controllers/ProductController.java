package com.sushama.controllers;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sushama.services.ProductService;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class ProductController {

    @Autowired
    private ProductService productService;

    // 1. Add product with image (Admin)
    @PostMapping(value = "/admin/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addProduct(
            @RequestPart("productObject") String productObject,
            @RequestParam("productImage") MultipartFile productImage) throws IOException {
        return productService.addProduct(productObject, productImage);
    }

    // 2. Get All Products (Admin Dashboard)
    @GetMapping("/admin/products")
    public ResponseEntity<?> getAllProductsForAdmin() {
        return productService.getAllProducts();
    }

    // 3. Delete Product (Admin)
    @DeleteMapping("/admin/products/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable("productId") long productId) {
        return productService.deleteProduct(productId);
    }
    
    // 4. Single Product GET Mapping (For Edit / Update Prefill)
    @GetMapping("/admin/products/{productId}")
    public ResponseEntity<?> getProductById(@PathVariable("productId") long productId) {
        return productService.getProductById(productId);
    }

    // 5. Product Update PUT Mapping (Admin)
    @PutMapping("/admin/products/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable("productId") long productId,
            @RequestPart("productObject") String productObject,
            @RequestParam(value = "productImage", required = false) MultipartFile productImage) throws IOException {
        return productService.updateProduct(productId, productObject, productImage);
    }
    
    // 6. Get All Products (Customer / Public Side)
    @GetMapping("/get/products")
    public ResponseEntity<?> getAllProductsForCustomer() {
        return productService.getAllProducts();
    }
    
    // 7. Filtered Products (Category / SubCategory)
    @GetMapping("/get/filtered-products")
    public ResponseEntity<?> filterProducts(
            @RequestParam(name = "categoryName", required = false) String categoryName,
            @RequestParam(name = "subCategoryName", required = false) String subCategoryName,
            @RequestParam(name = "productName", required = false) String productName,
            @RequestParam(name = "sortDirection", required = false) String sortDirection) {
        return productService.filterProducts(categoryName, subCategoryName, productName, sortDirection);
    }
    
 // 8. Get Single Product by ID (Customer / Public Side)
    @GetMapping("/get/products/{productId}")
    public ResponseEntity<?> getSingleProductForCustomer(@PathVariable("productId") long productId) {
        return productService.getProductById(productId);
    }
}