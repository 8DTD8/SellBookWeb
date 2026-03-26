package com.bookstore.dto.response;

import com.bookstore.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ✅ Authentication Response DTO
 * Returned after successful login or registration
 */
@Data
@NoArgsConstructor

public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserDTO user;
    private long accessTokenExpiration;
    
    // ✅ Explicit constructor
    public AuthResponse(String accessToken, String refreshToken, UserDTO user, long accessTokenExpiration) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
        this.accessTokenExpiration = accessTokenExpiration;
    }
    
    // ✅ Explicit getters for clarity
    public String getAccessToken() {
        return accessToken;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public UserDTO getUser() {
        return user;
    }
    
    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }
}
