package com.sushama.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sushama.entities.Cart;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    boolean existsByCustomerIdAndProductId(long customerId, long productId);

    Optional<Cart> findByCustomerIdAndProductId(long customerId, long productId);

    List<Cart> findByCustomerId(long customerId);
    
    void deleteByCustomerIdAndProductId(long customerId, long productId);
    
    void deleteByCustomerId(long customerId);
}