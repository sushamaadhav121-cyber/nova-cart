package com.sushama.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sushama.entities.Cart;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // Check if product already exists in customer's cart
    boolean existsByCustomerIdAndProductId(long customerId, long productId);

    // Fetch existing cart item for updating quantity
    Optional<Cart> findByCustomerIdAndProductId(long customerId, long productId);

    // Get all cart items for a specific customer
    List<Cart> findByCustomerId(long customerId);
    
    // Delete single product from cart
    void deleteByCustomerIdAndProductId(long customerId, long productId);
    
    // Clear entire cart after order placement
    void deleteByCustomerId(long customerId);
}