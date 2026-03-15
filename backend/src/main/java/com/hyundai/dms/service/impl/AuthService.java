package com.hyundai.dms.service.impl;

import com.hyundai.dms.dto.request.LoginRequest;
import com.hyundai.dms.dto.response.AuthResponse;
import com.hyundai.dms.entity.Employee;
import com.hyundai.dms.repository.EmployeeRepository;
import com.hyundai.dms.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtTokenProvider tokenProvider;
    private final EmployeeRepository employeeRepository;

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        String token = tokenProvider.generateToken(userDetails);

        Employee emp = employeeRepository.findByEmailAndIsActiveTrue(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        return AuthResponse.builder()
            .token(token)
            .email(emp.getEmail())
            .role(emp.getRole().getName())
            .fullName(emp.getFirstName() + " " + emp.getLastName())
            .employeeId(emp.getId())
            .build();
    }
}
