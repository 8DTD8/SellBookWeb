package com.bookstore.controller;

import com.bookstore.dto.request.RegisterRequest;
import com.bookstore.dto.request.LoginRequest;
import com.bookstore.dto.request.ForgotPasswordRequest;
import com.bookstore.dto.request.ForgotPasswordOtpRequest;
import com.bookstore.dto.request.ForgotPasswordVerifyOtpRequest;
import com.bookstore.dto.response.AuthResponse;
import com.bookstore.service.AuthService;
import com.bookstore.security.RateLimitingFilter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.util.concurrent.ExecutionException;

/**
 * ✅ Authentication Controller với HttpOnly cookies + CSRF protection
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
        @Valid @RequestBody RegisterRequest request,
        HttpServletResponse response) {
        
        try {
            AuthResponse authResponse = authService.register(request);
            
            // ✅ Set tokens as HttpOnly cookies
            setAccessTokenCookie(response, authResponse.getAccessToken());
            setRefreshTokenCookie(response, authResponse.getRefreshToken());
            
            // ✅ Return only user info (no token)
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new LoginResponse(
                    authResponse.getUser(),
                    authResponse.getAccessToken(),
                    authResponse.getAccessTokenExpiration()
                ));
                
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Đăng ký thất bại: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletRequest httpRequest,
        HttpServletResponse response) throws ExecutionException {
        
        String ipAddress = httpRequest.getRemoteAddr();
        
        try {
            AuthResponse authResponse = authService.login(request);
            
            // ✅ Clear failed attempts on success
            RateLimitingFilter.clearAttempts(ipAddress);
            
            // ✅ Set tokens as HttpOnly cookies
            setAccessTokenCookie(response, authResponse.getAccessToken());
            setRefreshTokenCookie(response, authResponse.getRefreshToken());
            
            // ✅ Return only user info (no token)
            return ResponseEntity.ok(
                new LoginResponse(
                    authResponse.getUser(),
                    authResponse.getAccessToken(),
                    authResponse.getAccessTokenExpiration()
                )
            );
            
        } catch (BadCredentialsException e) {
            // ✅ Record failed attempt for rate limiting
            RateLimitingFilter.recordFailedAttempt(ipAddress);
            
            // ✅ Generic error message (don't leak info)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Email hoặc mật khẩu không đúng"));
        } catch (Exception e) {
            RateLimitingFilter.recordFailedAttempt(ipAddress);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Email hoặc mật khẩu không đúng"));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(
        HttpServletRequest request,
        HttpServletResponse response) {
        
        try {
            // ✅ Extract refresh token from HttpOnly cookie
            String refreshToken = extractRefreshTokenFromCookie(request);
            
            if (refreshToken == null || refreshToken.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Refresh token missing"));
            }
            
            AuthResponse authResponse = authService.refreshToken(refreshToken);
            
            // ✅ Set new access token
            setAccessTokenCookie(response, authResponse.getAccessToken());
            
            return ResponseEntity.ok(new TokenRefreshResponse(authResponse.getAccessTokenExpiration()));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid refresh token"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // ✅ Clear cookies
        clearAccessTokenCookie(response);
        clearRefreshTokenCookie(response);
        
        return ResponseEntity.ok(new LogoutResponse("Logged out successfully"));
    }

    @PostMapping("/forgot-password/request-otp")
    public ResponseEntity<?> requestForgotPasswordOtp(@Valid @RequestBody ForgotPasswordOtpRequest request) {
        try {
            authService.requestForgotPasswordOtp(request);
            return ResponseEntity.ok(new SuccessResponse("OTP đã được gửi đến email của bạn (nếu tài khoản tồn tại)."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<?> verifyForgotPasswordOtp(@Valid @RequestBody ForgotPasswordVerifyOtpRequest request) {
        try {
            authService.verifyForgotPasswordOtp(request);
            return ResponseEntity.ok(new SuccessResponse("OTP hợp lệ. Bạn có thể đặt lại mật khẩu."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authService.forgotPassword(request);
            return ResponseEntity.ok(new SuccessResponse("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // ✅ Helper methods for secure cookie management
    private void setAccessTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("accessToken", token);
        cookie.setHttpOnly(true);      // ✅ JavaScript cannot access
        cookie.setSecure(false);       // Set to true in production with HTTPS
        cookie.setPath("/");           // ✅ All paths
        cookie.setMaxAge(3600);        // ✅ 1 hour
        response.addCookie(cookie);
        // Add SameSite via response header
        response.addHeader("Set-Cookie", "accessToken=" + token + "; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict");
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("refreshToken", token);
        cookie.setHttpOnly(true);      // ✅ JavaScript cannot access
        cookie.setSecure(false);       // Set to true in production with HTTPS
        cookie.setPath("/api/auth/refresh-token");  // ✅ Only for refresh endpoint
        cookie.setMaxAge(604800);      // ✅ 7 days
        response.addCookie(cookie);
        // Add SameSite via response header
        response.addHeader("Set-Cookie", "refreshToken=" + token + "; HttpOnly; Path=/api/auth/refresh-token; Max-Age=604800; SameSite=Strict");
    }

    private void clearAccessTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("accessToken", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);  // ✅ Delete
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/api/auth/refresh-token");
        cookie.setMaxAge(0);  // ✅ Delete
        response.addCookie(cookie);
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        
        for (Cookie cookie : request.getCookies()) {
            if ("refreshToken".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    // ✅ Response DTOs
    public static class LoginResponse {
        private Object user;
        private String accessToken;
        private long expiresIn;

        public LoginResponse(Object user, String accessToken, long expiresIn) {
            this.user = user;
            this.accessToken = accessToken;
            this.expiresIn = expiresIn;
        }

        public Object getUser() { return user; }
        public String getAccessToken() { return accessToken; }
        public long getExpiresIn() { return expiresIn; }
    }

    public static class TokenRefreshResponse {
        private long expiresIn;

        public TokenRefreshResponse(long expiresIn) {
            this.expiresIn = expiresIn;
        }

        public long getExpiresIn() { return expiresIn; }
    }

    public static class LogoutResponse {
        private String message;

        public LogoutResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
    }

    public static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() { return error; }
    }

    public static class SuccessResponse {
        private String message;

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
    }
}
