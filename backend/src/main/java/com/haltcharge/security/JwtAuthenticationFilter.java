package com.haltcharge.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    public JwtAuthenticationFilter(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = resolveToken(request);

        if (StringUtils.hasText(token)) {
            try {
                String email = jwtProvider.getEmailFromToken(token);
                String role = jwtProvider.getRoleFromToken(token);
                Long userId = jwtProvider.getUserIdFromToken(token);

                if (email != null && role != null) {
                    CustomUserDetails principal = new CustomUserDetails(userId, email, role);
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            principal, null, Collections.singletonList(new SimpleGrantedAuthority(role)));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                // Invalid token - clear context
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

