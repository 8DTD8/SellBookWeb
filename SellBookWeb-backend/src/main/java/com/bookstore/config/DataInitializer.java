package com.bookstore.config;

import com.bookstore.model.User;
import com.bookstore.repository.UserRepository;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import javax.annotation.PostConstruct;
import java.time.LocalDateTime;

@Configuration
public class DataInitializer {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void initializeAdminUser() {
        // Check if admin user already exists
        if (userRepository.findByEmail("admin@bookstore.com").isEmpty()) {
            User adminUser = new User();
            adminUser.setName("Admin User");
            adminUser.setEmail("admin@bookstore.com");
            adminUser.setPassword(passwordEncoder.encode("Admin@123456"));
            adminUser.setRole("ADMIN");
            adminUser.setActive(true);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(adminUser);
            System.out.println("✓ Admin user created successfully!");
            System.out.println("  Email: admin@bookstore.com");
            System.out.println("  Password: Admin@123456");
        } else {
            System.out.println("✓ Admin user already exists");
        }
    }
}
