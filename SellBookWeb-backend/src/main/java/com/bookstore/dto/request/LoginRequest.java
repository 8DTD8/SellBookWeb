package com.bookstore.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ✅ User Login Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    private String email;
    private String password;
    
    // ✅ Explicit getters for clarity
    public String getEmail() {
        return email;
    }
    
    public String getPassword() {
        return password;
    }
}
