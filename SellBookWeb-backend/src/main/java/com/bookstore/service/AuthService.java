package com.bookstore.service;

import com.bookstore.common.constant.Constants;
import com.bookstore.dto.mapper.UserMapper;
import com.bookstore.dto.request.LoginRequest;
import com.bookstore.dto.request.RegisterRequest;
import com.bookstore.dto.response.AuthResponse;
import com.bookstore.model.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse register(RegisterRequest request) {
        validateEmailNotExists(request.getEmail());
        
        User newUser = createNewUser(request);
        User savedUser = userRepository.save(newUser);
        
        return buildAuthResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException(Constants.ERROR_USER_NOT_FOUND));

        validatePassword(request.getPassword(), user.getPassword());
        
        return buildAuthResponse(user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        validateRefreshToken(refreshToken);
        
        String userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        validateUserId(userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException(Constants.ERROR_USER_NOT_FOUND));

        String newAccessToken = jwtTokenProvider.generateAccessToken(
            userId, 
            jwtTokenProvider.getEmailFromToken(refreshToken), 
            user.getRole()
        );
        
        return new AuthResponse(newAccessToken, refreshToken, UserMapper.toDTO(user), 3600);
    }

    // ✅ PRIVATE HELPER METHODS - Extracted for readability

    private void validateEmailNotExists(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException(Constants.ERROR_EMAIL_ALREADY_EXISTS);
        }
    }

    private User createNewUser(RegisterRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(Constants.USER_ROLE_CUSTOMER);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return user;
    }

    private void validatePassword(String rawPassword, String encodedPassword) {
        if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
            throw new RuntimeException(Constants.ERROR_INVALID_PASSWORD);
        }
    }

    private void validateRefreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new RuntimeException("Refresh token cannot be null or empty");
        }
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }
    }

    private void validateUserId(String userId) {
        if (userId == null || userId.isEmpty()) {
            throw new RuntimeException("Invalid user ID from token");
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
            user.getId(), 
            user.getEmail(), 
            user.getRole()
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());
        
        return new AuthResponse(accessToken, refreshToken, UserMapper.toDTO(user), 3600);
    }
}
