package com.bookstore.dto.mapper;

import com.bookstore.dto.UserDTO;
import com.bookstore.model.User;

/**
 * ✅ User DTO Mapper
 * Centralized mapping between User entity and UserDTO
 */
public class UserMapper {
    
    public static UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }
        
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAvatar(user.getAvatar());
        dto.setRole(user.getRole());
        dto.setActive(user.getActive());
        return dto;
    }
    
    public static User toEntity(UserDTO dto) {
        if (dto == null) {
            return null;
        }
        
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setAvatar(dto.getAvatar());
        user.setRole(dto.getRole());
        user.setActive(dto.getActive());
        return user;
    }
}
