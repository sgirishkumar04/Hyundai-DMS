package com.hyundai.dms.service.impl;

import com.hyundai.dms.dto.request.CustomerRequest;
import com.hyundai.dms.entity.Customer;
import com.hyundai.dms.entity.CustomerAddress;
import com.hyundai.dms.exception.ResourceNotFoundException;
import com.hyundai.dms.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepo;

    public Page<Customer> getAll(String search, Pageable pageable) {
        return customerRepo.search(search, pageable);
    }

    public Customer getById(Long id) {
        return customerRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
    }

    @Transactional
    public Customer create(CustomerRequest req) {
        if (customerRepo.existsByCustomerCode(req.getCustomerCode()))
            throw new IllegalArgumentException("Customer code already exists");
        Customer c = Customer.builder()
            .customerCode(req.getCustomerCode())
            .firstName(req.getFirstName())
            .lastName(req.getLastName())
            .email(req.getEmail())
            .phone(req.getPhone())
            .alternatePhone(req.getAlternatePhone())
            .dateOfBirth(req.getDateOfBirth())
            .gender(req.getGender() != null ? Customer.Gender.valueOf(req.getGender()) : null)
            .panNumber(req.getPanNumber())
            .customerType(req.getCustomerType() != null
                ? Customer.CustomerType.valueOf(req.getCustomerType()) : Customer.CustomerType.INDIVIDUAL)
            .companyName(req.getCompanyName())
            .gstNumber(req.getGstNumber())
            .build();
            
        if (req.getAddresses() != null) {
            List<CustomerAddress> addresses = req.getAddresses().stream()
                .map(a -> CustomerAddress.builder()
                    .customer(c)
                    .type(a.getType() != null ? CustomerAddress.AddressType.valueOf(a.getType()) : CustomerAddress.AddressType.HOME)
                    .line1(a.getLine1())
                    .line2(a.getLine2())
                    .city(a.getCity())
                    .state(a.getState())
                    .pincode(a.getPincode())
                    .isPrimary(a.getIsPrimary())
                    .build())
                .collect(Collectors.toList());
            c.setAddresses(addresses);
        }

        return customerRepo.save(c);
    }

    @Transactional
    public Customer update(Long id, CustomerRequest req) {
        Customer c = getById(id);
        c.setFirstName(req.getFirstName());
        c.setLastName(req.getLastName());
        c.setEmail(req.getEmail());
        c.setPhone(req.getPhone());
        c.setAlternatePhone(req.getAlternatePhone());
        c.setDateOfBirth(req.getDateOfBirth());
        c.setGender(req.getGender() != null ? Customer.Gender.valueOf(req.getGender()) : null);
        c.setPanNumber(req.getPanNumber());
        c.setCustomerType(req.getCustomerType() != null
                ? Customer.CustomerType.valueOf(req.getCustomerType()) : Customer.CustomerType.INDIVIDUAL);
        c.setCompanyName(req.getCompanyName());
        c.setGstNumber(req.getGstNumber());
        
        if (req.getAddresses() != null) {
            c.getAddresses().clear();
            List<CustomerAddress> newAddresses = req.getAddresses().stream()
                .map(a -> CustomerAddress.builder()
                    .customer(c)
                    .type(a.getType() != null ? CustomerAddress.AddressType.valueOf(a.getType()) : CustomerAddress.AddressType.HOME)
                    .line1(a.getLine1())
                    .line2(a.getLine2())
                    .city(a.getCity())
                    .state(a.getState())
                    .pincode(a.getPincode())
                    .isPrimary(a.getIsPrimary())
                    .build())
                .collect(Collectors.toList());
            c.getAddresses().addAll(newAddresses);
        }
        
        return customerRepo.save(c);
    }

    @Transactional
    public void delete(Long id) {
        customerRepo.deleteById(id);
    }
}
