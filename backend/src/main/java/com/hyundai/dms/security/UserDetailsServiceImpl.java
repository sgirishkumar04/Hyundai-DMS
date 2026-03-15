package com.hyundai.dms.security;

import com.hyundai.dms.entity.Employee;
import com.hyundai.dms.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Employee emp = employeeRepository.findByEmailAndIsActiveTrue(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return User.builder()
            .username(emp.getEmail())
            .password(emp.getPasswordHash())
            .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + emp.getRole().getName())))
            .build();
    }
}
