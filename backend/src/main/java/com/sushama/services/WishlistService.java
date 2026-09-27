package com.sushama.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sushama.entities.Product;
import com.sushama.entities.User;
import com.sushama.entities.Wishlist;
import com.sushama.repositories.ProductRepository;
import com.sushama.repositories.UserRepository;
import com.sushama.repositories.WishlistRepository;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    // 1. Get user wishlist
    public List getUserWishlist(String userName) {
        return wishlistRepository.findByUser_UserName(userName);
    }

    // 2. Add to wishlist
    public String addToWishlist(String userName, Long productId) {
        User user = userRepository.findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + userName));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        if (wishlistRepository.existsByUser_UserNameAndProduct_Id(userName, productId)) {
            return "Product is already in wishlist";
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProduct(product);

        wishlistRepository.save(wishlist);
        return "Added to wishlist successfully";
    }

    // 3. Remove from wishlist
    @Transactional
    public String removeFromWishlist(String userName, Long productId) {
        if (!wishlistRepository.existsByUser_UserNameAndProduct_Id(userName, productId)) {
            return "Product not found in wishlist";
        }
        wishlistRepository.deleteByUser_UserNameAndProduct_Id(userName, productId);
        return "Removed from wishlist successfully";
    }
}