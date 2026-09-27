package com.sushama.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sushama.entities.Wishlist;
import com.sushama.services.WishlistService;

@RestController
@RequestMapping("/api/v1/wishlist")
@CrossOrigin(origins = "*")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

 // 1. Login user chi wishlist aanne
    @GetMapping
    public ResponseEntity getWishlist(Authentication authentication) {
        String userName = authentication.getName();
        return ResponseEntity.ok(wishlistService.getUserWishlist(userName));
    }

    // 2. Wishlist madhe product add karne
    @PostMapping("/add/{productId}")
    public ResponseEntity addToWishlist(@PathVariable Long productId, Authentication authentication) {
        String userName = authentication.getName();
        return ResponseEntity.ok(wishlistService.addToWishlist(userName, productId));
    }

    // 3. Wishlist madhun product kadhne
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity removeFromWishlist(@PathVariable Long productId, Authentication authentication) {
        String userName = authentication.getName();
        return ResponseEntity.ok(wishlistService.removeFromWishlist(userName, productId));
    }
}