package com.haltcharge.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {
    public static class RegisterRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotBlank(message = "Full name is required")
        private String fullName;

        private String phoneNumber;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    }

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private Long userId;
        private String email;
        private String fullName;
        private String role;

        public AuthResponse(String token, Long userId, String email, String fullName, String role) {
            this.token = token;
            this.userId = userId;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
        }

        public String getToken() { return token; }
        public Long getUserId() { return userId; }
        public String getEmail() { return email; }
        public String getFullName() { return fullName; }
        public String getRole() { return role; }
    }
}

