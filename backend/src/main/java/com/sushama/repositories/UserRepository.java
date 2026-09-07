package com.sushama.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sushama.entities.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Login ke time user check karne aur role fetch karne ke liye
    Optional<User> findByUserName(String userName);

    // Registration ke time duplicate username verify karne ke liye
    boolean existsByUserName(String userName);
}