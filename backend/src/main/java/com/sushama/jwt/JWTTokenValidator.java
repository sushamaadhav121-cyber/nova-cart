package com.sushama.jwt;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import com.sushama.services.MyUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JWTTokenValidator extends OncePerRequestFilter {

    @Autowired
    private JWTTokenGenerator jwtTokenGenerator;

    @Autowired
    private MyUserDetailsService myUserDetailsService;

    // या एंडपॉईंट्ससाठी आणि OPTIONS रिक्वेस्टसाठी JWT व्हॅलिडेशन बायपास केले जाईल
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        String method = request.getMethod();

        return "OPTIONS".equalsIgnoreCase(method) ||
               path.equals("/api/v1/register") ||
               path.equals("/api/v1/login") ||
               path.startsWith("/api/v1/get/") ||
               path.startsWith("/api/v1/products/") ||
               path.startsWith("/images/") ||
               path.startsWith("/api/v1/images/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        final String header = request.getHeader("Authorization");

        String jwtToken = null;
        String username = null;
        String role = null;

        if (header != null && header.startsWith("Bearer ")) {

            jwtToken = header.substring(7).trim();

            try {

                username = jwtTokenGenerator.extractUsername(jwtToken);
                role = jwtTokenGenerator.extractRole(jwtToken);

                System.out.println("=================================");
                System.out.println("JWT USERNAME = " + username);
                System.out.println("JWT ROLE     = " + role);
                System.out.println("=================================");

            } catch (Exception e) {

                System.out.println("JWT TOKEN ERROR = " + e.getMessage());

            }
        }

        if (username != null
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            try {

                UserDetails userDetails =
                        myUserDetailsService.loadUserByUsername(username);

                // Validate JWT
                if (jwtTokenGenerator.validateToken(jwtToken, userDetails)) {

                    List<GrantedAuthority> authorities = new ArrayList<>();

                    if (role != null && !role.trim().isEmpty()) {

                        role = role.trim().toUpperCase();
                        String cleanRole = role.startsWith("ROLE_")
                                ? role.substring(5)
                                : role;
                        
                        authorities.add(new SimpleGrantedAuthority(cleanRole));
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + cleanRole));
                    }

                    for (GrantedAuthority authority : userDetails.getAuthorities()) {

                        if (!authorities.contains(authority)) {
                            authorities.add(authority);
                        }
                    }

                    System.out.println("=================================");
                    System.out.println("FINAL AUTHORITIES = " + authorities);
                    System.out.println("=================================");

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            authorities);

                    authToken.setDetails(new WebAuthenticationDetailsSource()
                            .buildDetails(request));

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authToken);
                }

            } catch (Exception e) {
                System.out.println(
                        "Authentication Error = " + e.getMessage()
                );
            }
        }

        filterChain.doFilter(request, response);
    }
}