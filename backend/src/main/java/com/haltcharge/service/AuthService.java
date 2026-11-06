package com.haltcharge.service;

import com.haltcharge.dto.AuthDto;
import com.haltcharge.entity.User;
import com.haltcharge.exception.BadRequestException;
import com.haltcharge.repository.UserRepository;
import com.haltcharge.security.JwtProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
    }

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole("ROLE_CUSTOMER");
        user.setStatus("ACTIVE");
        user.setWalletBalance(BigDecimal.ZERO);

        User saved = userRepository.save(user);
        String token = jwtProvider.generateToken(saved.getId(), saved.getEmail(), saved.getRole());

        return new AuthDto.AuthResponse(token, saved.getId(), saved.getEmail(), saved.getFullName(), saved.getRole());
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("Account is " + user.getStatus().toLowerCase());
        }

        String token = jwtProvider.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthDto.AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }
}

