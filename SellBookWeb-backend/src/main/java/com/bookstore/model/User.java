package com.bookstore.model;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User extends BaseEntity {
    @Id
    private String id;
    private String name;
    private String email;
    private String password;
    private String phone;
    private String avatar;
    private String role; // ADMIN, CUSTOMER
    private Boolean active;
    private String forgotPasswordOtp;
    private LocalDateTime forgotPasswordOtpExpiry;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getForgotPasswordOtp() {
        return forgotPasswordOtp;
    }

    public void setForgotPasswordOtp(String forgotPasswordOtp) {
        this.forgotPasswordOtp = forgotPasswordOtp;
    }

    public LocalDateTime getForgotPasswordOtpExpiry() {
        return forgotPasswordOtpExpiry;
    }

    public void setForgotPasswordOtpExpiry(LocalDateTime forgotPasswordOtpExpiry) {
        this.forgotPasswordOtpExpiry = forgotPasswordOtpExpiry;
    }
}
