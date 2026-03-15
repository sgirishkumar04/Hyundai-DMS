package com.hyundai.dms.repository;

import com.hyundai.dms.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    boolean existsByBookingNumber(String bookingNumber);
    Page<Booking> findByCustomerId(Long customerId, Pageable pageable);
    Page<Booking> findBySalesExecId(Long execId, Pageable pageable);
    java.util.Optional<Booking> findByVehicleId(Long vehicleId);

    @Query(value = "CALL GetTopSellingModels(:year, :month)", nativeQuery = true)
    List<Object[]> getTopSellingModels(@Param("year") Integer year, @Param("month") Integer month);

    @Query(value = "CALL GetMonthlyBookings(:year)", nativeQuery = true)
    List<Object[]> getMonthlyBookings(@Param("year") Integer year);

    @Query(value = "CALL GetBookingsByModelCount(:year, :month)", nativeQuery = true)
    List<Object[]> getBookingsByModelCount(@Param("year") Integer year, @Param("month") Integer month);

    @Query("SELECT b FROM Booking b WHERE " +
           "LOWER(b.bookingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.customer.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.customer.lastName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Booking> search(@Param("search") String search, Pageable pageable);
}
