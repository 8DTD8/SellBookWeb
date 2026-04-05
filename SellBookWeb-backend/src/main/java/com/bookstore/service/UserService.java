package com.bookstore.service;

import com.bookstore.dto.UserDTO;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.model.User;
import com.bookstore.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    private static final String ROLE_SUPER_ADMIN = "SUPER_ADMIN";
    private static final String ROLE_CUSTOMER = "CUSTOMER";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDTO createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode("Password@123"));
        } else {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setActive(user.getActive() != null ? user.getActive() : true);
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("CUSTOMER");
        }
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    public UserDTO getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return convertToDTO(user);
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return convertToDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public UserDTO updateUser(String id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (userDetails.getName() != null) user.setName(userDetails.getName());
        if (userDetails.getPhone() != null) user.setPhone(userDetails.getPhone());
        if (userDetails.getAvatar() != null) user.setAvatar(userDetails.getAvatar());
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    public UserDTO updateUserRole(String id, String newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (newRole != null && !newRole.isEmpty()) {
            user.setRole(newRole);
            user.setUpdatedAt(LocalDateTime.now());
        }
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    public UserDTO updateUserByAdmin(String targetUserId, User userDetails, String currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        validateAdminUserModification(targetUser, currentUserId);

        if (isSuperAdmin(currentUser)) {
            validateSuperAdminUpdate(targetUser, userDetails);
        } else {
            validateRegularAdminUpdate(targetUser, userDetails);
        }

        if (userDetails.getRole() != null && !userDetails.getRole().isEmpty()) {
            targetUser.setRole(userDetails.getRole().toUpperCase());
        }
        if (userDetails.getActive() != null) targetUser.setActive(userDetails.getActive());

        targetUser.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(targetUser);
        return convertToDTO(updatedUser);
    }

    public void deleteUserByAdmin(String targetUserId, String currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        validateAdminUserModification(targetUser, currentUserId);

        if (!isSuperAdmin(currentUser) && !isCustomer(targetUser)) {
            throw new RuntimeException("Admin thường chỉ có thể xóa tài khoản USER");
        }

        userRepository.deleteById(targetUserId);
    }

    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    private void validateAdminUserModification(User targetUser, String currentUserId) {
        if (targetUser.getId().equals(currentUserId)) {
            throw new RuntimeException("Không thể chỉnh sửa hoặc xóa tài khoản admin đang đăng nhập");
        }
    }

    private void validateRegularAdminUpdate(User targetUser, User userDetails) {
        if (!isCustomer(targetUser)) {
            throw new RuntimeException("Admin thường chỉ có thể ban tài khoản USER");
        }

        boolean triesToChangeRole = userDetails.getRole() != null && !userDetails.getRole().equalsIgnoreCase(targetUser.getRole());
        boolean triesToChangeProfile = userDetails.getName() != null
                || userDetails.getEmail() != null
                || userDetails.getPhone() != null
                || userDetails.getAvatar() != null;

        if (triesToChangeRole || triesToChangeProfile) {
            throw new RuntimeException("Admin thường chỉ có thể ban hoặc mở khóa tài khoản USER");
        }

        if (userDetails.getActive() == null) {
            throw new RuntimeException("Vui lòng chọn trạng thái khóa/mở khóa tài khoản USER");
        }
    }

    private void validateSuperAdminUpdate(User targetUser, User userDetails) {
        String currentRole = (targetUser.getRole() == null ? "" : targetUser.getRole().toUpperCase());
        String requestedRole = userDetails.getRole() == null ? null : userDetails.getRole().toUpperCase();

        if (ROLE_SUPER_ADMIN.equals(currentRole)) {
            throw new RuntimeException("Không thể chỉnh sửa tài khoản SUPER_ADMIN");
        }

        boolean hasRoleUpdate = requestedRole != null && !requestedRole.isEmpty();
        boolean hasActiveUpdate = userDetails.getActive() != null;
        if (!hasRoleUpdate && !hasActiveUpdate) {
            throw new RuntimeException("Chỉ được phép nâng quyền ADMIN hoặc khóa/mở khóa tài khoản");
        }

        if (hasRoleUpdate) {
            boolean roleChanged = !requestedRole.equals(currentRole);
            if (roleChanged) {
                if (!ROLE_CUSTOMER.equals(currentRole) || !"ADMIN".equals(requestedRole)) {
                    throw new RuntimeException("Chỉ được phép nâng tài khoản CUSTOMER lên ADMIN");
                }
            }
        }
    }

    private boolean isSuperAdmin(User user) {
        return user.getRole() != null && ROLE_SUPER_ADMIN.equalsIgnoreCase(user.getRole());
    }

    private boolean isCustomer(User user) {
        return user.getRole() != null && ROLE_CUSTOMER.equalsIgnoreCase(user.getRole());
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAvatar(user.getAvatar());
        dto.setRole(user.getRole());
        dto.setActive(user.getActive());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
