package com.bookstore.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        String[] allowedOrigins = getOrigins();

        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("Content-Type", "Authorization", "X-CSRF-Token")
                .exposedHeaders("X-Total-Count", "X-Page-Number")
                .allowCredentials(true)
                .maxAge(3600);
    }

    private String[] getOrigins() {
        String activeProfile = System.getenv("SPRING_PROFILES_ACTIVE");

        if (activeProfile != null && activeProfile.contains("prod")) {
            return new String[]{
                "https://sellbookweb.com",
                "https://www.sellbookweb.com"
            };
        }

        // Development - support Live Server (5500), common dev ports, and file://
        return new String[]{
            "http://localhost:3000",
            "http://localhost:4200",
            "http://localhost:5500",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5500",
            "http://127.0.0.1:5501",
            "http://localhost:8080"
        };
    }
}
