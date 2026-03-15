package com.hyundai.dms.controller;

import com.hyundai.dms.entity.ServiceAppointment;
import com.hyundai.dms.repository.ServiceAppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/service")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceAppointmentRepository appointmentRepo;

    @GetMapping("/appointments")
    public ResponseEntity<Page<ServiceAppointment>> getAll(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appointmentDate"));
        if (status != null)
            return ResponseEntity.ok(appointmentRepo.findByStatus(
                ServiceAppointment.AppointmentStatus.valueOf(status), pageable));
        return ResponseEntity.ok(appointmentRepo.findAll(pageable));
    }

    @GetMapping("/appointments/{id}")
    public ResponseEntity<ServiceAppointment> getById(@PathVariable Long id) {
        return appointmentRepo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/appointments")
    public ResponseEntity<ServiceAppointment> create(@RequestBody ServiceAppointment appointment) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentRepo.save(appointment));
    }

    @PutMapping("/appointments/{id}")
    public ResponseEntity<ServiceAppointment> update(@PathVariable Long id,
                                                     @RequestBody ServiceAppointment appointment) {
        return appointmentRepo.findById(id).map(existing -> {
            existing.setAppointmentDate(appointment.getAppointmentDate());
            existing.setServiceType(appointment.getServiceType());
            existing.setStatus(appointment.getStatus());
            existing.setRemarks(appointment.getRemarks());
            return ResponseEntity.ok(appointmentRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/workload")
    public ResponseEntity<List<Object[]>> workload() {
        return ResponseEntity.ok(appointmentRepo.getWorkloadSummary(null, null));
    }
}
