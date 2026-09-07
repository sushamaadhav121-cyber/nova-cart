package com.sushama.jwt;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JWTTokenGenerator {

    private final String SECRET = "GDF7acJj3fHj48U4/rtgWkSb31XKkqv0cHpP9yJJ2kU=";

    // Extract all claims
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Extract Username from JWT Subject
    public String extractUsername(String token) {
        Claims claims = extractAllClaims(token);
        String username = claims.getSubject();
        if (username == null) {
            username = claims.get("username", String.class);
        }
        return username;
    }

    // Extract ROLE from JWT Claims
    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("role", String.class);
    }

    // Check if token expired
    private Boolean isExpired(String token) {
        Claims claims = extractAllClaims(token);
        Date expiration = claims.getExpiration();
        return expiration.before(new Date());
    }

    // Validate token
    public Boolean validateToken(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return (username != null && username.equals(userDetails.getUsername()) && !isExpired(token));
    }

    // Generate token
    public String generateToken(UserDetails userDetails, String role) {
        System.out.println("Generating token for user: " + userDetails.getUsername() + " with role: " + role);
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("username", userDetails.getUsername());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 10)) // 10 Hours validity
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }
}