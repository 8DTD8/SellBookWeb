package com.bookstore.controller;

import com.bookstore.dto.UserDTO;
import com.bookstore.model.User;
import com.bookstore.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminUserController {
    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    private String getCallerRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .findFirst()
                .orElse("");
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

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody User user) {
        UserDTO createdUser = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable String id, @RequestBody Map<String, Object> userData, Authentication authentication) {
        String callerRole = getCallerRole(authentication);

        // If role is being changed, enforce restrictions
        if (userData.containsKey("role")) {
            String newRole = (String) userData.get("role");
            UserDTO targetUser = userService.getUserById(id);

            // ADMIN cannot change role of ADMIN or SUPER_ADMIN users
            if (!"SUPER_ADMIN".equals(callerRole)) {
                if ("ADMIN".equals(targetUser.getRole()) || "SUPER_ADMIN".equals(targetUser.getRole())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
                // ADMIN cannot assign ADMIN or SUPER_ADMIN role
                if ("ADMIN".equals(newRole) || "SUPER_ADMIN".equals(newRole)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
            }
            userService.updateUserRole(id, newRole);
        }

        // Update other fields
        UserDTO updatedUser = userService.getUserById(id);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserDTO> updateUserRole(@PathVariable String id, @RequestBody Map<String, String> roleRequest, Authentication authentication) {
        String callerRole = getCallerRole(authentication);
        String newRole = roleRequest.get("role");
        UserDTO targetUser = userService.getUserById(id);

        // ADMIN cannot change role of ADMIN or SUPER_ADMIN users
        if (!"SUPER_ADMIN".equals(callerRole)) {
            if ("ADMIN".equals(targetUser.getRole()) || "SUPER_ADMIN".equals(targetUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            if ("ADMIN".equals(newRole) || "SUPER_ADMIN".equals(newRole)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        UserDTO updatedUser = userService.updateUserRole(id, newRole);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id, Authentication authentication) {
        String callerRole = getCallerRole(authentication);

        // ADMIN cannot delete ADMIN or SUPER_ADMIN users, nor themselves
        if (!"SUPER_ADMIN".equals(callerRole)) {
            UserDTO targetUser = userService.getUserById(id);
            if ("ADMIN".equals(targetUser.getRole()) || "SUPER_ADMIN".equals(targetUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            // Prevent self-deletion
            String callerId = authentication.getName();
            if (callerId.equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
