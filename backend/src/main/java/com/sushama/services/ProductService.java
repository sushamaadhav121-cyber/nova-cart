package com.sushama.services;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
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

    @Autowired
    private Cloudinary cloudinary;

    private String uploadImageToCloudinary(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        return uploadResult.get("secure_url").toString();
    }

    public ResponseEntity addProduct(String productObject, MultipartFile productImage) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        Product product = objectMapper.readValue(productObject, Product.class);

        SubCategory existingSubCategory = subCategoryRepository.findById(product.getSubCategory().getId()).orElse(null);
        if (existingSubCategory == null) {
            return response.send("SubCategory not found!", null, HttpStatus.NOT_FOUND);
        }
        product.setSubCategory(existingSubCategory);

        if (productImage != null && !productImage.isEmpty()) {
            String imageUrl = uploadImageToCloudinary(productImage);
            product.setImageName(imageUrl);
        }

        product.setDeleted(false);
        Product savedProduct = productRepository.save(product);
        return response.send("Product Added Successfully!", savedProduct, HttpStatus.CREATED);
    }

    public ResponseEntity getAllProducts() {
        List<Product> products = productRepository.findByIsDeletedFalse();
        
        if (products.isEmpty()) {
            return response.send("No products found in the catalog!", null, HttpStatus.NOT_FOUND);
        } else {
            return response.send("Following products found", products, HttpStatus.OK);
        }
    }

    public ResponseEntity deleteProduct(long productId) {
        Optional<Product> existingProductOpt = productRepository.findById(productId);
        
        if (existingProductOpt.isPresent()) {
            Product product = existingProductOpt.get();
            product.setDeleted(true); 
            productRepository.save(product); 
            return response.send("Product deleted successfully!", null, HttpStatus.OK);
        } else {
            return response.send("Product does not exist!", null, HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity getProductById(long productId) {
        Optional<Product> existingProductOpt = productRepository.findById(productId);
        
        if (existingProductOpt.isPresent() && !existingProductOpt.get().isDeleted()) {
            return response.send("Product found!", existingProductOpt.get(), HttpStatus.OK);
        } else {
            return response.send("Product does not exist!", null, HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity updateProduct(long productId, String productObject, MultipartFile productImage) throws IOException {
        Product existingProduct = productRepository.findById(productId).orElse(null);

        if (existingProduct == null || existingProduct.isDeleted()) {
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
            String imageUrl = uploadImageToCloudinary(productImage);
            newProduct.setImageName(imageUrl);
        } else {
            newProduct.setImageName(existingProduct.getImageName());
        }

        newProduct.setId(existingProduct.getId());
        newProduct.setCreatedAt(existingProduct.getCreatedAt());
        newProduct.setDeleted(existingProduct.isDeleted());

        Product updatedProduct = productRepository.save(newProduct);
        return response.send("Product updated successfully!", updatedProduct, HttpStatus.OK);
    }

    public ResponseEntity filterProducts(String categoryName, String subCategoryName, String productName, String sortDirection) {
        Specification<Product> notDeletedSpec = (root, query, cb) -> cb.isFalse(root.get("isDeleted"));

        Specification allCustomFiltersOnProduct = Specification
                .where(notDeletedSpec)
                .and(ProductSpecification.hasCategory(categoryName))
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