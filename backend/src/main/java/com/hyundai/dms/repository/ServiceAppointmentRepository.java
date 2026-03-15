package com.hyundai.dms.repository;

import com.hyundai.dms.entity.ServiceAppointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ServiceAppointmentRepository extends JpaRepository<ServiceAppointment, Long> {
    boolean existsByAppointmentNo(String appointmentNo);
    Page<ServiceAppointment> findByCustomerId(Long customerId, Pageable pageable);
    Page<ServiceAppointment> findByStatus(ServiceAppointment.AppointmentStatus status, Pageable pageable);

    @Query(value = "CALL GetWorkloadSummary(:year, :month)", nativeQuery = true)
    List<Object[]> getWorkloadSummary(@Param("year") Integer year, @Param("month") Integer month);
}
