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

    public ResponseEntity addProduct(String productObject, MultipartFile productImage) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        Product product = objectMapper.readValue(productObject, Product.class);

        SubCategory existingSubCategory = subCategoryRepository.findById(product.getSubCategory().getId()).orElse(null);
        if (existingSubCategory == null) {
            return response.send("SubCategory not found!", null, HttpStatus.NOT_FOUND);
        }
        product.setSubCategory(existingSubCategory);

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

        Product savedProduct = productRepository.save(product);
        return response.send("Product Added Successfully!", savedProduct, HttpStatus.CREATED);
    }

    public ResponseEntity getAllProducts() {
        List products = productRepository.findAll();
        
        if (products.isEmpty()) {
            return response.send("No products found in the catalog!", null, HttpStatus.NOT_FOUND);
        } else {
            return response.send("Following products found", products, HttpStatus.OK);
        }
    }

    public ResponseEntity deleteProduct(long productId) {
        Optional existingProduct = productRepository.findById(productId);
        
        if (existingProduct.isPresent()) {
            productRepository.deleteById(productId);
            return response.send("Product deleted successfully!", null, HttpStatus.OK);
        } else {
            return response.send("Product does not exist!", null, HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity getProductById(long productId) {
        Optional existingProduct = productRepository.findById(productId);
        
        if (existingProduct.isPresent()) {
            return response.send("Product found!", existingProduct.get(), HttpStatus.OK);
        } else {
            return response.send("Product does not exist!", null, HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity updateProduct(long productId, String productObject, MultipartFile productImage) throws IOException {
        Product existingProduct = productRepository.findById(productId).orElse(null);

        if (existingProduct == null) {
            return response.send("Product does not exist!", null, HttpStatus.NOT_FOUND);
        }

        ObjectMapper objectMapper = new ObjectMapper();
        Product newProduct = objectMapper.readValue(productObject, Product.class);

        if (newProduct.getSubCategory() != null) {
            SubCategory existingSubCategory = subCategoryRepository.findById(newProduct.getSubCategory().getId()).orElse(null);
            if (existingSubCategory != null) {
                newProduct.setSubCategory(existingSubCategory);
            }
        }

        if (productImage != null && !productImage.isEmpty()) {
            File directory = new File(IMAGE_UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String originalImageName = productImage.getOriginalFilename();
            newProduct.setImageName(originalImageName);

            Path completeImagePath = Paths.get(IMAGE_UPLOAD_DIR, originalImageName);
            Files.write(completeImagePath, productImage.getBytes());
        } else {
            newProduct.setImageName(existingProduct.getImageName());
        }

        newProduct.setId(existingProduct.getId());
        newProduct.setCreatedAt(existingProduct.getCreatedAt());

        Product updatedProduct = productRepository.save(newProduct);
        return response.send("Product updated successfully!", updatedProduct, HttpStatus.OK);
    }

    public ResponseEntity filterProducts(String categoryName, String subCategoryName, String productName, String sortDirection) {
        Specification allCustomFiltersOnProduct = Specification
                .where(ProductSpecification.hasCategory(categoryName))
                .and(ProductSpecification.hasSubCategory(subCategoryName))
                .and(ProductSpecification.searchByProductName(productName))
                .and(ProductSpecification.sortByPrice(sortDirection));

        List filteredProducts = productRepository.findAll(allCustomFiltersOnProduct);

        if (filteredProducts.isEmpty()) {
            return response.send("No products found for given filter!", null, HttpStatus.NOT_FOUND);
        }

        return response.send("Following filtered products found", filteredProducts, HttpStatus.OK);
    }
}