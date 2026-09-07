package com.sushama.controllers;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sushama.dto.OrderResponseDTO;
import com.sushama.entities.Order;
import com.sushama.entities.OrderItem;
import com.sushama.repositories.OrderItemRepository;
import com.sushama.repositories.OrderRepository;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    // ==========================================
    // 1. CUSTOMER API: Get Customer Orders
    // ==========================================
    @GetMapping("/customer/{customerId}/orders")
    public ResponseEntity<?> getCustomerOrders(@PathVariable Long customerId) {
        List<Order> orders = orderRepository.findByCustomerId(customerId);
        List<OrderResponseDTO> responseList = new ArrayList<>();

        for (Order order : orders) {
            OrderResponseDTO dto = new OrderResponseDTO();
            dto.setOrderId(order.getId());
            dto.setPaymentId(order.getPaymentId());
            dto.setRazorpayOrderId(order.getRazorpayOrderId());
            dto.setPaymentStatus(order.getPaymentStatus());
            
            dto.setOrderStatus(order.getOrderStatus());
            
            dto.setTotalAmount(order.getTotalAmount());
            dto.setOrderDate(order.getOrderDate());

            List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
            dto.setItems(items);

            responseList.add(dto);
        }

        return ResponseEntity.ok(responseList);
    }

    // ==========================================
    // 2. ADMIN API: Get All Orders (हा मिसिंग होता)
    // ==========================================
    @GetMapping("/admin/orders")
    public ResponseEntity<?> getAllOrdersForAdmin() {
        List<Order> orders = orderRepository.findAll();
        return ResponseEntity.ok(orders);
    }

    // ==========================================
    // 3. ADMIN API: Update Order Status
    // ==========================================
    @PutMapping("/admin/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {

        Optional<Order> optionalOrder = orderRepository.findById(orderId);
        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();
            order.setOrderStatus(status);
            orderRepository.save(order);
            return ResponseEntity.ok("Order status updated successfully to " + status);
        } else {
            return ResponseEntity.status(404).body("Order not found with ID: " + orderId);
        }
    }
}