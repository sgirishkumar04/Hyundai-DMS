package com.hyundai.dms.service.impl;

import com.hyundai.dms.security.DealerContext;
import com.hyundai.dms.dto.request.BookingRequest;
import com.hyundai.dms.entity.*;
import com.hyundai.dms.exception.ResourceNotFoundException;
import com.hyundai.dms.repository.*;
import com.hyundai.dms.service.AuditService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepo;
    private final CustomerRepository customerRepo;
    private final EmployeeRepository employeeRepo;
    private final VehicleRepository vehicleRepo;
    private final DealerRepository dealerRepo;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbc;

    public Page<Booking> getAll(String search, Pageable pageable) {
        Long dealerId = DealerContext.getCurrentDealerId();
        if (search != null && !search.trim().isEmpty()) {
            return bookingRepo.search(search, dealerId, pageable);
        }
        return bookingRepo.findByDealerId(dealerId, pageable);
    }

    public Booking getById(Long id) {
        Long dealerId = DealerContext.getCurrentDealerId();
        return bookingRepo.findById(id)
            .filter(b -> b.getDealer().getId().equals(dealerId))
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    @Transactional
    public Booking create(BookingRequest req) {
        Long dealerId = DealerContext.getCurrentDealerId();
        Dealer dealer = dealerRepo.findById(dealerId)
            .orElseThrow(() -> new ResourceNotFoundException("Dealer not found"));

        Customer customer;
        if (req.getCustomerId() != null) {
            customer = customerRepo.findById(req.getCustomerId())
                .filter(c -> c.getDealer().getId().equals(dealerId))
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        } else {
            customer = Customer.builder()
                .customerCode("CUST" + System.currentTimeMillis() % 1000000)
                .firstName(req.getCustomerName())
                .lastName("Guest") 
                .phone(req.getCustomerPhone())
                .customerType(Customer.CustomerType.INDIVIDUAL)
                .dealer(dealer)
                .build();
            customer = customerRepo.save(customer);
        }

        Vehicle vehicle = vehicleRepo.findById(req.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        
        Employee salesExec = employeeRepo.findById(req.getSalesExecId())
            .orElseThrow(() -> new ResourceNotFoundException("Sales executive not found"));

        Booking booking = Booking.builder()
            .bookingNumber("BKG" + System.currentTimeMillis() % 10000000)
            .customer(customer)
            .vehicle(vehicle)
            .variant(vehicle.getVariant())
            .color(vehicle.getColor())
            .salesExec(salesExec)
            .exShowroom(req.getExShowroom())
            .discount(req.getDiscount() != null ? req.getDiscount() : java.math.BigDecimal.ZERO)
            .tcsAmt(req.getTcsAmt() != null ? req.getTcsAmt() : java.math.BigDecimal.ZERO)
            .registrationAmt(req.getRegistrationAmt() != null ? req.getRegistrationAmt() : java.math.BigDecimal.ZERO)
            .insuranceAmt(req.getInsuranceAmt() != null ? req.getInsuranceAmt() : java.math.BigDecimal.ZERO)
            .accessoriesAmt(req.getAccessoriesAmt() != null ? req.getAccessoriesAmt() : java.math.BigDecimal.ZERO)
            .totalOnRoad(req.getTotalOnRoad())
            .expectedDelivery(req.getExpectedDelivery() != null ? req.getExpectedDelivery().toLocalDate() : null)
            .remarks(req.getRemarks())
            .status(Booking.BookingStatus.BOOKED)
            .dealer(dealer)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        vehicle.setStatus(Vehicle.VehicleStatus.ALLOCATED);
        vehicleRepo.save(vehicle);

        Booking savedBooking = bookingRepo.save(booking);
        auditService.log("Booking", savedBooking.getId(), "CREATE", null, savedBooking);
        return savedBooking;
    }

    @Transactional
    public Booking updateStatus(Long id, Booking.BookingStatus status) {
        Booking booking = getById(id);
        String oldJson = null;
        try {
            oldJson = objectMapper.writeValueAsString(booking);
        } catch (Exception e) {
            // Log and continue
        }

        booking.setStatus(status);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking savedBooking = bookingRepo.save(booking);
        auditService.log("Booking", savedBooking.getId(), "UPDATE", oldJson, savedBooking);
        return savedBooking;
    }

    @Transactional
    public void delete(Long id) {
        Booking booking = getById(id);
        String oldJson = null;
        try {
            oldJson = objectMapper.writeValueAsString(booking);
        } catch (Exception e) {}

        // 1. Un-allocate vehicle if associated
        if (booking.getVehicle() != null) {
            jdbc.update("UPDATE vehicles SET status = 'IN_STOCK' WHERE id = ?", booking.getVehicle().getId());
        }

        // 2. Delete dependent records
        jdbc.update("DELETE FROM finance_loans WHERE booking_id = ?", id);
        jdbc.update("DELETE FROM invoices WHERE booking_id = ?", id);
        
        // 3. Delete the booking
        bookingRepo.deleteById(id);
        
        auditService.log("Booking", id, "DELETE", oldJson, null);
    }
}
