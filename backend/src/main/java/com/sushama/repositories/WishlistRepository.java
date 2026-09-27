package com.sushama.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sushama.entities.Wishlist;

@Repository
public interface WishlistRepository extends JpaRepository< Wishlist, Long > {

    List< Wishlist > findByUser_UserName(String userName);

    boolean existsByUser_UserNameAndProduct_Id(String userName, Long productId);

    void deleteByUser_UserNameAndProduct_Id(String userName, Long productId);
}