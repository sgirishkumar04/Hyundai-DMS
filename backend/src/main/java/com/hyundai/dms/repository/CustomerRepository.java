package com.hyundai.dms.repository;

import com.hyundai.dms.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByPhone(String phone);
    boolean existsByCustomerCode(String customerCode);

    @Query("SELECT c FROM Customer c WHERE " +
           "(:search IS NULL OR LOWER(c.firstName) LIKE %:search% OR LOWER(c.lastName) LIKE %:search% " +
           "OR c.phone LIKE %:search% OR c.customerCode LIKE %:search%)")
    Page<Customer> search(@Param("search") String search, Pageable pageable);
}
