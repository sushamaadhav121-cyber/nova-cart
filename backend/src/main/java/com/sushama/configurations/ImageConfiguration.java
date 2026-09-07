package com.sushama.configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ImageConfiguration implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Project directory ke andar uploads/images folder ka path
        final String imagePath = System.getProperty("user.dir") + "/uploads/images/";

        // /api/v1/images/** URL se local files serve honge
        registry.addResourceHandler("/api/v1/images/**")
                .addResourceLocations("file:" + imagePath);
    }
}