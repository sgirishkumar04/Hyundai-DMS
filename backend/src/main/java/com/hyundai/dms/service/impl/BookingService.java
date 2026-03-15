package com.hyundai.dms.service.impl;

import com.hyundai.dms.entity.Booking;
import com.hyundai.dms.exception.ResourceNotFoundException;
import com.hyundai.dms.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepo;

    public Page<Booking> getAll(String search, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            return bookingRepo.search(search, pageable);
        }
        return bookingRepo.findAll(pageable);
    }

    public Booking getById(Long id) {
        return bookingRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    @Transactional
    public void delete(Long id) {
        bookingRepo.deleteById(id);
    }
}
