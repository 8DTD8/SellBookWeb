package com.bookstore.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        // ✅ Chỉ cho phép domain cụ thể
        String[] allowedOrigins = getOrigins();
        
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)  // ✅ Specific origins only
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")  // ✅ No PATCH
                .allowedHeaders("Content-Type", "Authorization", "X-CSRF-Token")  // ✅ Specific headers
                .exposedHeaders("X-Total-Count", "X-Page-Number")  // ✅ Specific headers
                .allowCredentials(true)  // ✅ Allow credentials
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
        
        // Development
        return new String[]{
            "http://localhost:3000",
            "http://localhost:4200",
            "http://127.0.0.1:3000"
        };
    }
}
