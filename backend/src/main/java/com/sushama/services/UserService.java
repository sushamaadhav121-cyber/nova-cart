package com.sushama.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sushama.dto.UserLogin;
import com.sushama.entities.Admin;
import com.sushama.entities.Customer;
import com.sushama.entities.User;
import com.sushama.enums.Role;
import com.sushama.jwt.JWTTokenGenerator;
import com.sushama.repositories.AdminRepository;
import com.sushama.repositories.CustomerRepository;
import com.sushama.repositories.UserRepository;
import com.sushama.response_wrapper.JWTResponseWrapper;
import com.sushama.response_wrapper.UnivarsalResponse;

@Service
public class UserService {

    @Autowired
    private UnivarsalResponse response;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private MyUserDetailsService myUserDetailsService;

    @Autowired
    private JWTTokenGenerator jwtTokenGenerator;

    @Autowired
    private JWTResponseWrapper jwtResponseWrapper;

    // Registration Method
    public ResponseEntity<?> register(User user) {
        if (userRepository.existsByUserName(user.getUserName())) {
            return response.send("This username already exists", null, HttpStatus.CONFLICT);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        if (user.getRole() == Role.CUSTOMER) {
            Customer customer = new Customer();
            customer.setUser(savedUser);
            customerRepository.save(customer);
        } else if (user.getRole() == Role.ADMIN) {
            Admin admin = new Admin();
            admin.setUser(savedUser);
            adminRepository.save(admin);
        }

        return response.send("Registration successful", savedUser, HttpStatus.CREATED);
    }

    // Login Method
    public ResponseEntity<?> login(UserLogin userLogin) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userLogin.getUserName(), userLogin.getPassword())
            );
        } catch (BadCredentialsException e) {
            return response.send("Invalid username or password", null, HttpStatus.UNAUTHORIZED);
        }

        UserDetails userDetails = myUserDetailsService.loadUserByUsername(userLogin.getUserName());
        User existingUser = userRepository.findByUserName(userLogin.getUserName()).orElse(null);

        if (existingUser == null) {
            return response.send("User not found", null, HttpStatus.NOT_FOUND);
        }

        String role = existingUser.getRole().name();
        String jwtToken = jwtTokenGenerator.generateToken(userDetails, role);

        // Setting ID according to User Type (Customer ID or User/Admin ID)
        if ("CUSTOMER".equalsIgnoreCase(role) && existingUser.getCustomer() != null) {
            jwtResponseWrapper.setId(existingUser.getCustomer().getId());
        } else {
            jwtResponseWrapper.setId(existingUser.getId());
        }

        jwtResponseWrapper.setRole(role);
        jwtResponseWrapper.setToken(jwtToken);

        return response.send("Login Success", jwtResponseWrapper, HttpStatus.OK);
    }
}