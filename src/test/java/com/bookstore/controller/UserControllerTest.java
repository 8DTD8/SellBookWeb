package com.bookstore.controller;

import com.bookstore.dto.UserDTO;
import com.bookstore.model.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private String testUserId;

    @BeforeEach
    public void setUp() {
        userRepository.deleteAll();
        
        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("123456");
        testUser.setPhone("0123456789");
    }

    @Test
    public void testRegisterUser() throws Exception {
        String userJson = objectMapper.writeValueAsString(testUser);

        mockMvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(userJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(testUser.getEmail()))
                .andExpect(jsonPath("$.name").value(testUser.getName()));
    }

    @Test
    public void testGetAllUsers() throws Exception {
        mockMvc.perform(get("/api/users")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
