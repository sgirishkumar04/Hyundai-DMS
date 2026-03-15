package com.hyundai.dms.repository;

import com.hyundai.dms.entity.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {
    boolean existsByLeadNumber(String leadNumber);

    @EntityGraph(attributePaths = {"customer", "assignedTo", "preferredModel", "preferredVariant", "preferredColor", "source"})
    Page<Lead> findByStatus(Lead.LeadStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "assignedTo", "preferredModel", "preferredVariant", "preferredColor", "source"})
    Page<Lead> findByAssignedToId(Long employeeId, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"customer", "assignedTo", "preferredModel", "preferredVariant", "preferredColor", "source"})
    Page<Lead> findAll(Pageable pageable);

    @Query(value = "CALL GetLeadFunnelCounts(:year, :month)", nativeQuery = true)
    List<Object[]> getLeadFunnelCounts(@Param("year") Integer year, @Param("month") Integer month);
}
