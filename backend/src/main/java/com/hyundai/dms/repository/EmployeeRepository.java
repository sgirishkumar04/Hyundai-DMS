package com.hyundai.dms.repository;

import com.hyundai.dms.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmailAndIsActiveTrue(String email);
    boolean existsByEmail(String email);
    boolean existsByEmployeeCode(String employeeCode);

    @Query("SELECT e FROM Employee e WHERE e.isActive = true AND " +
           "(:search IS NULL OR LOWER(e.firstName) LIKE %:search% OR LOWER(e.lastName) LIKE %:search% OR e.employeeCode LIKE %:search%)")
    Page<Employee> searchActive(String search, Pageable pageable);
}
