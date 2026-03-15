package com.hyundai.dms.service.impl;

import com.hyundai.dms.dto.request.EmployeeRequest;
import com.hyundai.dms.entity.*;
import com.hyundai.dms.exception.ResourceNotFoundException;
import com.hyundai.dms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepo;
    private final PasswordEncoder passwordEncoder;

    public Page<Employee> getAll(String search, Pageable pageable) {
        return employeeRepo.searchActive(search, pageable);
    }

    public Employee getById(Long id) {
        return employeeRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }

    public Employee getByEmail(String email) {
        return employeeRepo.findByEmailAndIsActiveTrue(email)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found for email: " + email));
    }

    @Transactional
    public Employee create(EmployeeRequest req) {
        if (employeeRepo.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("Email already in use: " + req.getEmail());

        Employee emp = Employee.builder()
            .employeeCode(req.getEmployeeCode())
            .firstName(req.getFirstName())
            .lastName(req.getLastName())
            .email(req.getEmail())
            .phone(req.getPhone())
            .passwordHash(passwordEncoder.encode(req.getPassword()))
            .dateOfJoin(req.getDateOfJoin())
            .isActive(true)
            .build();

        // Resolve department and role via lazy-initialized repos
        emp.setDepartment(Department.builder().id(req.getDepartmentId()).build());
        emp.setRole(Role.builder().id(req.getRoleId()).build());
        if (req.getManagerId() != null)
            emp.setManager(Employee.builder().id(req.getManagerId()).build());

        return employeeRepo.save(emp);
    }

    @Transactional
    public Employee update(Long id, EmployeeRequest req) {
        Employee emp = getById(id);
        emp.setFirstName(req.getFirstName());
        emp.setLastName(req.getLastName());
        emp.setPhone(req.getPhone());
        emp.setDepartment(Department.builder().id(req.getDepartmentId()).build());
        emp.setRole(Role.builder().id(req.getRoleId()).build());
        if (req.getManagerId() != null)
            emp.setManager(Employee.builder().id(req.getManagerId()).build());
        return employeeRepo.save(emp);
    }

    @Transactional
    public void deactivate(Long id) {
        Employee emp = getById(id);
        emp.setIsActive(Boolean.FALSE);
        employeeRepo.save(emp);
    }
}
