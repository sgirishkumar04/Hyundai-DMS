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
    
    @Query("SELECT MAX(l.leadNumber) FROM Lead l WHERE l.dealer.id = :dealerId")
    String findMaxLeadNumber(@Param("dealerId") Long dealerId);

    long countByDealerId(Long dealerId);

    @EntityGraph(attributePaths = {"customer", "assignedTo", "preferredModel", "preferredVariant", "preferredColor", "source"})
    Page<Lead> findByStatusAndDealerId(Lead.LeadStatus status, Long dealerId, Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "assignedTo", "preferredModel", "preferredVariant", "preferredColor", "source"})
    Page<Lead> findByAssignedToIdAndDealerId(Long employeeId, Long dealerId, Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "assignedTo", "preferredModel", "preferredVariant", "preferredColor", "source"})
    Page<Lead> findByDealerId(Long dealerId, Pageable pageable);

    @Query(value = "CALL GetLeadFunnelCounts(:year, :month, :dealerId)", nativeQuery = true)
    List<Object[]> getLeadFunnelCounts(@Param("year") Integer year, @Param("month") Integer month, @Param("dealerId") Long dealerId);
}
