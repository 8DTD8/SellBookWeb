package com.bookstore.service;

import com.bookstore.common.constant.Constants;
import com.bookstore.dto.mapper.UserMapper;
import com.bookstore.dto.request.ChangePasswordRequest;
import com.bookstore.dto.request.ForgotPasswordRequest;
import com.bookstore.dto.request.ForgotPasswordOtpRequest;
import com.bookstore.dto.request.ForgotPasswordVerifyOtpRequest;
import com.bookstore.dto.request.LoginRequest;
import com.bookstore.dto.request.RegisterRequest;
import com.bookstore.dto.response.AuthResponse;
import com.bookstore.model.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            JavaMailSender mailSender
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.mailSender = mailSender;
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

    public void requestForgotPasswordOtp(ForgotPasswordOtpRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            return;
        }

        User user = optionalUser.get();
        String otp = generateOtp();
        user.setForgotPasswordOtp(otp);
        user.setForgotPasswordOtpExpiry(LocalDateTime.now().plusMinutes(5));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        sendOtpEmail(user.getEmail(), otp);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email hoặc OTP không hợp lệ"));

        validateOtp(user, request.getOtp());
        validateNewPassword(request.getNewPassword());

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setForgotPasswordOtp(null);
        user.setForgotPasswordOtpExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public void verifyForgotPasswordOtp(ForgotPasswordVerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email hoặc OTP không hợp lệ"));
        validateOtp(user, request.getOtp());
    }

    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        validatePassword(request.getCurrentPassword(), user.getPassword());
        validateNewPassword(request.getNewPassword());

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new RuntimeException("Mật khẩu mới không được trùng mật khẩu hiện tại");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
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

    private void validateNewPassword(String password) {
        if (password == null || password.length() < 8) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 8 ký tự");
        }

        boolean hasUppercase = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLowercase = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.matches(".*[!@#$%^&*].*");

        if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecial) {
            throw new RuntimeException("Mật khẩu mới phải có chữ hoa, chữ thường, số và ký tự đặc biệt (!@#$%^&*)");
        }
    }

    private void validateOtp(User user, String otp) {
        if (otp == null || otp.trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập mã OTP");
        }

        if (user.getForgotPasswordOtp() == null || user.getForgotPasswordOtpExpiry() == null) {
            throw new RuntimeException("OTP không tồn tại hoặc đã hết hạn");
        }

        if (LocalDateTime.now().isAfter(user.getForgotPasswordOtpExpiry())) {
            throw new RuntimeException("OTP đã hết hạn, vui lòng yêu cầu mã mới");
        }

        if (!otp.trim().equals(user.getForgotPasswordOtp())) {
            throw new RuntimeException("OTP không chính xác");
        }
    }

    private String generateOtp() {
        int random = ThreadLocalRandom.current().nextInt(100000, 1000000);
        return String.valueOf(random);
    }

    private void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            if (mailUsername != null && !mailUsername.isBlank()) {
                message.setFrom(mailUsername);
            }
            message.setSubject("[SellBookWeb] Mã OTP đặt lại mật khẩu");
            message.setText(
                    "Xin chào,\n\n" +
                    "Mã OTP đặt lại mật khẩu của bạn là: " + otp + "\n" +
                    "Mã có hiệu lực trong 5 phút.\n\n" +
                    "Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.\n\n" +
                    "Trân trọng,\nSellBookWeb"
            );

            mailSender.send(message);
        } catch (Exception ex) {
            throw new RuntimeException("Không thể gửi OTP qua email. Vui lòng kiểm tra cấu hình mail server.");
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
