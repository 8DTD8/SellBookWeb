package com.bookstore.controller;

import com.bookstore.dto.UserDTO;
import com.bookstore.model.User;
import com.bookstore.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable String id,
            @RequestBody User user,
            Authentication authentication
    ) {
        String currentUserId = authentication.getName();
        UserDTO updatedUser = userService.updateUserByAdmin(id, user, currentUserId);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable String id,
            @RequestBody Map<String, String> roleRequest,
            Authentication authentication
    ) {
        String newRole = roleRequest.get("role");
        User updatePayload = new User();
        updatePayload.setRole(newRole);
        String currentUserId = authentication.getName();
        UserDTO updatedUser = userService.updateUserByAdmin(id, updatePayload, currentUserId);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id, Authentication authentication) {
        String currentUserId = authentication.getName();
        userService.deleteUserByAdmin(id, currentUserId);
        return ResponseEntity.noContent().build();
    }
}
