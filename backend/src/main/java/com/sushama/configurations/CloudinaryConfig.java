package com.sushama.configurations;

import java.util.HashMap;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "pnrtkcsb");
        config.put("api_key", "647149325486149");
        config.put("api_secret", "CLOUDINARY_URL=cloudinary://647149325486149:tUbrCSHuKnR-_GiDHr76zpmYEa0@pnrtkcsb"); // <-- इथे कॉपी केलेला Secret टाका
        return new Cloudinary(config);
    }
}