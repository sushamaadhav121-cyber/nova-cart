package com.sushama.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.sushama.entities.User;
import com.sushama.repositories.UserRepository;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User existingUser = userRepository.findByUserName(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with username: " + username
                        )
                );

        String roleStr = String.valueOf(existingUser.getRole())
                .trim()
                .toUpperCase();

        // ROLE_ remove
        if (roleStr.startsWith("ROLE_")) {
            roleStr = roleStr.substring(5);
        }

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        // ADMIN
        authorities.add(
                new SimpleGrantedAuthority(roleStr)
        );

        // ROLE_ADMIN
        authorities.add(
                new SimpleGrantedAuthority("ROLE_" + roleStr)
        );

        System.out.println("=================================");
        System.out.println("USERNAME = " + existingUser.getUserName());
        System.out.println("DATABASE ROLE = " + roleStr);
        System.out.println("AUTHORITIES = " + authorities);
        System.out.println("=================================");

        return new org.springframework.security.core.userdetails.User(
                existingUser.getUserName(),
                existingUser.getPassword(),
                authorities
        );
    }
}