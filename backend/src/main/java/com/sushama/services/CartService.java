package com.sushama.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.sushama.entities.Cart;
import com.sushama.entities.Customer;
import com.sushama.entities.Product;
import com.sushama.repositories.CartRepository;
import com.sushama.repositories.CustomerRepository;
import com.sushama.repositories.ProductRepository;
import com.sushama.response_wrapper.UnivarsalResponse;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UnivarsalResponse response;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    // 1. Add Product To Cart
    public ResponseEntity<?> addToCart(long customerId, long productId) {
        if (cartRepository.existsByCustomerIdAndProductId(customerId, productId)) {
            return response.send("This product is already in the cart", null, HttpStatus.CONFLICT);
        }

        Optional<Customer> existingCustomer = customerRepository.findById(customerId);
        if (existingCustomer.isEmpty()) {
            return response.send("Customer not found!", null, HttpStatus.NOT_FOUND);
        }

        Optional<Product> existingProduct = productRepository.findById(productId);
        if (existingProduct.isEmpty()) {
            return response.send("Product not found!", null, HttpStatus.NOT_FOUND);
        }

        Cart cart = new Cart();
        cart.setCustomer(existingCustomer.get());
        cart.setProduct(existingProduct.get());
        cart.setQuantity(1);

        Cart savedCart = cartRepository.save(cart);
        return response.send("Product added to cart successfully!", savedCart, HttpStatus.CREATED);
    }

    // 2. Get Cart Items by Customer ID
    public ResponseEntity<?> getCartItems(long customerId) {
        Optional<Customer> existingCustomer = customerRepository.findById(customerId);
        if (existingCustomer.isPresent()) {
            List<Cart> cartItems = cartRepository.findByCustomerId(customerId);
            return response.send("Following cart items found", cartItems, HttpStatus.OK);
        } else {
            return response.send("Customer does not exist", null, HttpStatus.NOT_FOUND);
        }
    }

    // 3. Remove Item from Cart
    public ResponseEntity<?> removeCartItem(long cartId) {
        Optional<Cart> existingCart = cartRepository.findById(cartId);
        if (existingCart.isPresent()) {
            cartRepository.deleteById(cartId);
            return response.send("Cart item deleted", null, HttpStatus.OK);
        } else {
            return response.send("Cart item can not be removed", null, HttpStatus.NOT_FOUND);
        }
    }

    // 4. Update Cart Quantity
    public ResponseEntity<?> updateCartQuantity(long cartId, int quantity) {
        Optional<Cart> existingCart = cartRepository.findById(cartId);
        if (existingCart.isPresent()) {
            Cart cart = existingCart.get();
            cart.setQuantity(quantity);
            cartRepository.save(cart);
            return response.send("Quantity Updated", cart, HttpStatus.OK);
        } else {
            return response.send("Cant update quantity", null, HttpStatus.NOT_FOUND);
        }
    }
}