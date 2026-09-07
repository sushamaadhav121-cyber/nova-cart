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
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column(nullable = false)
    private String name;

    // Soft delete साठी status कॉलम (बाय डीफॉल्ट 'ACTIVE')
    @Column(name = "status")
    private String status = "ACTIVE";

    // UI डॅशबोर्डवर प्रॉडक्ट संख्या दाखवण्यासाठी (डेटाबेस टेबलमध्ये हा कॉलम तयार होणार नाही)
    @Transient
    private int productCount;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}