package com.sushama.configurations;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        // Cloudinary च्या पॉप-अपमधील पूर्ण URL (पर्याय क्र. ४ मधील API environment variable)
        return new Cloudinary("cloudinary://647149325486149:tUbrC5HuKnR-_GiDHr76zpmYEa0@pnrtkcsb");
    }
}