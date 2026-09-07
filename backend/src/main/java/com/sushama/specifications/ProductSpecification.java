package com.sushama.specifications;

import org.springframework.data.jpa.domain.Specification;

import com.sushama.entities.Category;
import com.sushama.entities.Product;
import com.sushama.entities.SubCategory;

import jakarta.persistence.criteria.Join;

public class ProductSpecification {

    // 1. Category-wise filtration
    public static Specification<Product> hasCategory(String categoryName) {
        return (root, query, criteriaBuilder) -> {
            if (categoryName == null || categoryName.isBlank()) {
                return null;
            }
            Join<Product, SubCategory> productSubCategoryJoin = root.join("subCategory");
            Join<SubCategory, Category> productCategoryJoin = productSubCategoryJoin.join("category");
            return criteriaBuilder.equal(criteriaBuilder.lower(productCategoryJoin.get("name")), categoryName.trim().toLowerCase());
        };
    }

    // 2. SubCategory-wise filtration
    public static Specification<Product> hasSubCategory(String subCategoryName) {
        return (root, query, criteriaBuilder) -> {
            if (subCategoryName == null || subCategoryName.isBlank()) {
                return null;
            }
            Join<Product, SubCategory> productSubCategoryJoin = root.join("subCategory");
            return criteriaBuilder.equal(criteriaBuilder.lower(productSubCategoryJoin.get("name")), subCategoryName.trim().toLowerCase());
        };
    }

    // 3. Search by Product Name
    public static Specification<Product> searchByProductName(String productName) {
        return (root, query, criteriaBuilder) -> {
            if (productName == null || productName.isBlank()) {
                return null;
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + productName.trim().toLowerCase() + "%");
        };
    }

    // 4. Sort by Price (asc / desc)
    public static Specification<Product> sortByPrice(String sortDirection) {
        return (root, query, criteriaBuilder) -> {
            if (sortDirection == null || sortDirection.isBlank()) {
                return null;
            }
            if (sortDirection.equalsIgnoreCase("asc")) {
                query.orderBy(criteriaBuilder.asc(root.get("price")));
            } else if (sortDirection.equalsIgnoreCase("desc")) {
                query.orderBy(criteriaBuilder.desc(root.get("price")));
            }
            return null; // Predicate null aslyamule filtering apply hot nahi, fakt order set hote
        };
    }
}