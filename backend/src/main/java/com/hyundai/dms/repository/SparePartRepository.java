package com.hyundai.dms.repository;

import com.hyundai.dms.entity.SparePart;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SparePartRepository extends JpaRepository<SparePart, Long> {
    boolean existsByPartNumber(String partNumber);
    Page<SparePart> findByCategory(String category, Pageable pageable);

    @Query("SELECT sp FROM SparePart sp WHERE sp.isActive = true AND " +
           "(:search IS NULL OR LOWER(sp.name) LIKE %:search% OR sp.partNumber LIKE %:search%)")
    Page<SparePart> search(String search, Pageable pageable);

    @Query("SELECT DISTINCT sp.category FROM SparePart sp WHERE sp.isActive = true ORDER BY sp.category")
    List<String> findAllCategories();
}
