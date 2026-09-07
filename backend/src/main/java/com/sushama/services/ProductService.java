package com.sushama.services;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sushama.entities.Product;
import com.sushama.entities.SubCategory;
import com.sushama.repositories.ProductRepository;
import com.sushama.repositories.SubCategoryRepository;
import com.sushama.response_wrapper.UnivarsalResponse;
import com.sushama.specifications.ProductSpecification;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private UnivarsalResponse response;

    private final String IMAGE_UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/images/";

    // 1. Add Product
    public ResponseEntity<?> addProduct(String productObject, MultipartFile productImage) throws IOException {
        
        // Convert productObject String to Product Entity
        ObjectMapper objectMapper = new ObjectMapper();
        Product product = objectMapper.readValue(productObject, Product.class);

        // Validate & set SubCategory
        Optional<SubCategory> existingSubCategory = subCategoryRepository.findById(product.getSubCategory().getId());
        if (existingSubCategory.isEmpty()) {
            return response.send("SubCategory not found!", null, HttpStatus.NOT_FOUND);
        }
        product.setSubCategory(existingSubCategory.get());

        // Handle Image Upload with Unique Filename
        if (productImage != null && !productImage.isEmpty()) {
            File directory = new File(IMAGE_UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String originalName = productImage.getOriginalFilename();
            String uniqueImageName = UUID.randomUUID().toString() + "_" + originalName;
            
            Path completeImagePath = Paths.get(IMAGE_UPLOAD_DIR, uniqueImageName);
            Files.write(completeImagePath, productImage.getBytes());

            product.setImageName(uniqueImageName);
        }

        // Save Product
        Product savedProduct = productRepository.save(product);
        return response.send("Product Added Successfully!", savedProduct, HttpStatus.CREATED);
    }

    // 2. Get All Products
    public ResponseEntity<?> getAllProducts() {
        List<Product> products = productRepository.findAll();
        
        if (products.isEmpty()) {
            return response.send("No products found in the catalog!", null, HttpStatus.NOT_FOUND);
        } else {
            return response.send("Following products found", products, HttpStatus.OK);
        }
    }

    // 3. Delete Product
    public ResponseEntity<?> deleteProduct(long productId) {
        Optional<Product> existingProduct = productRepository.findById(productId);
        
        if (existingProduct.isPresent()) {
            productRepository.deleteById(productId);
            return response.send("Product deleted successfully!", null, HttpStatus.OK);
        } else {
            return response.send("Product does not exist!", null, HttpStatus.NOT_FOUND);
        }
    }

    // 4. Get Single Product by ID 
    public ResponseEntity<?> getProductById(long productId) {
        Optional<Product> existingProduct = productRepository.findById(productId);
        
        if (existingProduct.isPresent()) {
            return response.send("Product found!", existingProduct.get(), HttpStatus.OK);
        } else {
            return response.send("Product does not exist!", null, HttpStatus.NOT_FOUND);
        }
    }

    // 5. Update Product
    public ResponseEntity<?> updateProduct(long productId, String productObject, MultipartFile productImage) throws IOException {
        Optional<Product> optionalProduct = productRepository.findById(productId);
        
        if (optionalProduct.isPresent()) {
            Product existingProduct = optionalProduct.get();

            // Convert JSON string to Product object
            ObjectMapper objectMapper = new ObjectMapper();
            Product newProduct = objectMapper.readValue(productObject, Product.class);

            // Set SubCategory mapping (FK)
            if (newProduct.getSubCategory() != null) {
                Optional<SubCategory> existingSubCategory = subCategoryRepository.findById(newProduct.getSubCategory().getId());
                existingSubCategory.ifPresent(newProduct::setSubCategory);
            }

            // Handle Image upload
            if (productImage != null && !productImage.isEmpty()) {
                String originalImageName = productImage.getOriginalFilename();
                newProduct.setImageName(originalImageName);

                Path completeImagePath = Paths.get(IMAGE_UPLOAD_DIR, originalImageName);
                Files.write(completeImagePath, productImage.getBytes());
            } else {
                newProduct.setImageName(existingProduct.getImageName());
            }

            // Retain primary key and audit timestamps
            newProduct.setId(existingProduct.getId());
            newProduct.setCreatedAt(existingProduct.getCreatedAt());

            // Save updated product to database
            Product updatedProduct = productRepository.save(newProduct);
            return response.send("Product updated successfully!", updatedProduct, HttpStatus.OK);
        } else {
            return response.send("Product does not exist!", null, HttpStatus.NOT_FOUND);
        }
    }

    // 6. Filter Products 
    public ResponseEntity<?> filterProducts(String categoryName, String subCategoryName, String productName, String sortDirection) {
        Specification<Product> allCustomFiltersOnProduct = Specification
                .where(ProductSpecification.hasCategory(categoryName))
                .and(ProductSpecification.hasSubCategory(subCategoryName))
                .and(ProductSpecification.searchByProductName(productName))
                .and(ProductSpecification.sortByPrice(sortDirection));

        List<Product> filteredProducts = productRepository.findAll(allCustomFiltersOnProduct);

        if (filteredProducts.isEmpty()) {
            return response.send("No products found for given filter!", null, HttpStatus.NOT_FOUND);
        }

        return response.send("Following filtered products found", filteredProducts, HttpStatus.OK);
    }
}