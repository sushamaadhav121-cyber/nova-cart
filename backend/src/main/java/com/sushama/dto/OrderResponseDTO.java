package com.sushama.dto;

import java.time.LocalDateTime;
import java.util.List;
import com.sushama.entities.OrderItem;
import lombok.Data;

@Data
public class OrderResponseDTO {
    private Long orderId;
    private String paymentId;
    private String razorpayOrderId;
    private String paymentStatus;
    
    private String orderStatus; 

    private double totalAmount;
    private LocalDateTime orderDate;
    private List<OrderItem> items;
}