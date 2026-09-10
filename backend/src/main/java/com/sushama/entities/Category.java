package com.sushama.entities;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Data
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private long id;

    @Column(nullable = false, unique = true)
    @Size(min = 3, max = 50, message = "Category must be 3-50 characters")
    private String name;

    // 1. Brief Description
    @Column(length = 500)
    private String description;

    // 2. Soft Delete Status
    @Column(nullable = false)
    private String status = "ACTIVE";

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("category")
    private List<SubCategory> subCategories;

    @Transient
    private int productCount;
}