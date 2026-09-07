package com.sushama.controllers;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.RazorpayException;
import com.sushama.dto.VerifyPaymentRequest;
import com.sushama.services.PaymentService;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // Create Razorpay Order
    @PostMapping(value = "/customer/create-order", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> createOrder(
            @RequestParam("amount") int amount,
            @RequestParam("currency") String currency,
            @RequestParam("customerId") long customerId)
            throws RazorpayException {
        JSONObject order = paymentService.createOrder(amount, currency, customerId);
        return ResponseEntity.ok(order.toString());
    }

    // Verify Payment Signature & Confirm Order
    @PostMapping("/customer/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody VerifyPaymentRequest request)
            throws RazorpayException {
        return paymentService.verifyPayment(request);
    }
}