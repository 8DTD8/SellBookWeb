package com.bookstore.config;

import com.bookstore.security.JwtAuthenticationFilter;
import com.bookstore.security.JwtTokenProvider;
import com.bookstore.security.RateLimitingFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    private final JwtTokenProvider jwtTokenProvider;
    
    public SecurityConfig(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .cors().and()
            // ✅ CSRF protection enabled
            .csrf()
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringAntMatchers(
                    "/api/**",
                    "/api/auth/login",
                    "/api/auth/register",
                    "/api/auth/forgot-password/request-otp",
                    "/api/auth/forgot-password/verify-otp",
                    "/api/auth/forgot-password/reset",
                    "/api/health"
                )
            .and()
            .authorizeRequests()
                // ✅ Static files (HTML, JS, CSS) - No authentication needed
                .antMatchers("/", "/favicon.ico", "/error", "/index.html", "/src/**", "/pages/**", "/js/**", "/css/**", "/public/**").permitAll()
                // ✅ Public read endpoints only
                .antMatchers(HttpMethod.GET, "/api/health").permitAll()
                .antMatchers(HttpMethod.GET, "/api/books").permitAll()
                .antMatchers(HttpMethod.GET, "/api/books/**").permitAll()
                .antMatchers(HttpMethod.GET, "/api/categories").permitAll()
                .antMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .antMatchers(HttpMethod.GET, "/api/coupons/code/**").permitAll()
                .antMatchers(HttpMethod.GET, "/api/reviews/book/**").permitAll()
                // ✅ Public auth endpoints
                .antMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .antMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .antMatchers(HttpMethod.POST, "/api/auth/forgot-password/request-otp").permitAll()
                .antMatchers(HttpMethod.POST, "/api/auth/forgot-password/verify-otp").permitAll()
                .antMatchers(HttpMethod.POST, "/api/auth/forgot-password/reset").permitAll()
                // ✅ Write operations need ADMIN
                .antMatchers(HttpMethod.POST, "/api/books").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .antMatchers(HttpMethod.PUT, "/api/books/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .antMatchers(HttpMethod.DELETE, "/api/books/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .antMatchers(HttpMethod.POST, "/api/categories").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .antMatchers(HttpMethod.PUT, "/api/categories/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .antMatchers(HttpMethod.DELETE, "/api/categories/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                // ✅ Admin endpoints
                .antMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                // ✅ All other requests need authentication
                .anyRequest().authenticated()
            .and()
            .addFilterBefore(new RateLimitingFilter(), UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class)
            // ✅ Security headers
            .headers()
                .frameOptions().deny();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
