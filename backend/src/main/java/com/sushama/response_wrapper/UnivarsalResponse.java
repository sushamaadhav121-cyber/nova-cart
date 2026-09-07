package com.sushama.response_wrapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component
public class UnivarsalResponse {

    @Autowired
    private CustomResponse customResponse;

    public ResponseEntity<CustomResponse> send(String message, Object data, HttpStatus httpStatus) {
        customResponse.setMessage(message);
        customResponse.setData(data);
        return new ResponseEntity<>(customResponse, httpStatus);
    }
}