package com.hyundai.dms.service.impl;

import com.hyundai.dms.dto.request.LeadRequest;
import com.hyundai.dms.entity.*;
import com.hyundai.dms.exception.ResourceNotFoundException;
import com.hyundai.dms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepo;
    private final CustomerRepository customerRepo;

    public Page<Lead> getAll(String status, Long execId, Pageable pageable) {
        if (status != null) return leadRepo.findByStatus(Lead.LeadStatus.valueOf(status), pageable);
        if (execId != null) return leadRepo.findByAssignedToId(execId, pageable);
        return leadRepo.findAll(pageable);
    }

    public Lead getById(Long id) {
        return leadRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id));
    }

    @Transactional
    public Lead create(LeadRequest req) {
        Lead lead = Lead.builder()
            .leadNumber(req.getLeadNumber())
            .customer(Customer.builder().id(req.getCustomerId()).build())
            .source(LeadSource.builder().id(req.getSourceId()).build())
            .assignedTo(Employee.builder().id(req.getAssignedTo()).build())
            .status(req.getStatus() != null ? Lead.LeadStatus.valueOf(req.getStatus()) : Lead.LeadStatus.NEW)
            .remarks(req.getRemarks())
            .expectedCloseDate(req.getExpectedCloseDate())
            .build();
        if (req.getPreferredModelId() != null)
            lead.setPreferredModel(VehicleModel.builder().id(req.getPreferredModelId()).build());
        if (req.getPreferredVariantId() != null)
            lead.setPreferredVariant(VehicleVariant.builder().id(req.getPreferredVariantId()).build());
        if (req.getPreferredColorId() != null)
            lead.setPreferredColor(Color.builder().id(req.getPreferredColorId()).build());
        return leadRepo.save(lead);
    }

    @Transactional
    public Lead update(Long id, LeadRequest req) {
        Lead lead = getById(id);
        lead.setAssignedTo(Employee.builder().id(req.getAssignedTo()).build());
        lead.setStatus(Lead.LeadStatus.valueOf(req.getStatus()));
        lead.setRemarks(req.getRemarks());
        lead.setExpectedCloseDate(req.getExpectedCloseDate());
        return leadRepo.save(lead);
    }

    @Transactional
    public void delete(Long id) { leadRepo.deleteById(id); }

    public List<Object[]> getFunnelSummary() { return leadRepo.getLeadFunnelCounts(null, null); }
}
