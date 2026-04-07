package com.bookstore.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.stream.Collectors;

@Configuration
public class AppConfig {

    private static final String DEFAULT_DEV_ORIGINS = String.join(",",
            "http://localhost",
            "http://127.0.0.1",
            "http://localhost:3000",
            "http://localhost:4200",
            "http://localhost:5500",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5500",
            "http://127.0.0.1:5501",
            "http://localhost:8080"
    );

    @Bean
    public CorsConfigurationSource corsConfigurationSource(Environment env) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(resolveAllowedOrigins(env)));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Content-Type", "Authorization", "X-CSRF-Token"));
        configuration.setExposedHeaders(Arrays.asList("X-Total-Count", "X-Page-Number"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private static String[] resolveAllowedOrigins(Environment env) {
        String raw = env.getProperty("cors.allowed-origins");
        if (raw == null || raw.isBlank()) {
            raw = DEFAULT_DEV_ORIGINS;
        }
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList())
                .toArray(new String[0]);
    }
}
