package com.bookstore.security;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * ✅ Rate Limiting Filter để ngăn brute force attacks
 * Giới hạn 5 lần login thất bại mỗi 15 phút per IP
 */
public class RateLimitingFilter extends OncePerRequestFilter {
    private static final int MAX_ATTEMPTS = 5;
    private static final int BLOCK_DURATION_MINUTES = 15;
    private static final LoadingCache<String, Integer> failedAttempts = Caffeine.newBuilder()
        .expireAfterWrite(BLOCK_DURATION_MINUTES, TimeUnit.MINUTES)
        .build(key -> 0);

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        
        String requestUri = request.getRequestURI();
        
        // ✅ Chỉ rate limit endpoint login
        if ("/api/auth/login".equals(requestUri) && "POST".equalsIgnoreCase(request.getMethod())) {
            String identifier = request.getRemoteAddr();  // ✅ Dùng IP address
            
            Integer attempts = failedAttempts.get(identifier);
            
            if (attempts >= MAX_ATTEMPTS) {
                // ✅ Block nếu quá nhiều lần thất bại
                response.setStatus(429);  // Too Many Requests
                response.setContentType("application/json");
                response.getWriter().write(
                    "{\"error\": \"Quá nhiều lần thử đăng nhập. " +
                    "Vui lòng thử lại sau 15 phút\", \"retryAfter\": 900}"
                );
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }

    // ✅ Public method để record failed attempts từ AuthController
    public static void recordFailedAttempt(String identifier) {
        Integer attempts = failedAttempts.get(identifier);
        failedAttempts.put(identifier, attempts + 1);
    }

    // ✅ Public method để clear attempts khi login thành công
    public static void clearAttempts(String identifier) {
        failedAttempts.invalidate(identifier);
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String uri = request.getRequestURI();
        String method = request.getMethod();
        return !("/api/auth/login".equals(uri) && "POST".equalsIgnoreCase(method));
    }
}
