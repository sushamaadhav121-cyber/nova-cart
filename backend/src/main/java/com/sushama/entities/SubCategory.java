package com.sushama.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;
import lombok.Data;

@Entity
@Data
public class SubCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(nullable = false)
    private String name;

    @Column(name = "status")
    private String status = "ACTIVE";

    @Transient
    private int productCount;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}