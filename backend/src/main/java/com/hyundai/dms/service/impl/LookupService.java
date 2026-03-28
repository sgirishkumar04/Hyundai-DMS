package com.hyundai.dms.service.impl;

import com.hyundai.dms.entity.*;
import com.hyundai.dms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LookupService {

    private final RoleRepository roleRepo;
    private final DepartmentRepository deptRepo;
    private final VehicleModelRepository modelRepo;
    private final VehicleVariantRepository variantRepo;
    private final ColorRepository colorRepo;
    private final EngineTypeRepository engineTypeRepo;
    private final InventoryLocationRepository locationRepo;
    private final LeadSourceRepository leadSourceRepo;
    private final SupplierRepository supplierRepo;
    private final BankRepository bankRepo;

    public List<Role> getRoles() { return roleRepo.findAll(); }
    @Cacheable("lookups") public List<Department> getDepartments() { return deptRepo.findAll(); }
    @Cacheable("lookups") public List<VehicleModel> getModels() { return modelRepo.findAll(); }
    @Cacheable("lookups") public List<VehicleVariant> getVariants() { return variantRepo.findAll(); }
    @Cacheable("lookups") public List<VehicleVariant> getVariantsByModel(Long modelId) { return variantRepo.findByModelId(modelId); }
    @Cacheable("lookups") public List<Color> getColors() { return colorRepo.findAll(); }
    @Cacheable("lookups") public List<EngineType> getEngineTypes() { return engineTypeRepo.findAll(); }
    @Cacheable("lookups") public List<InventoryLocation> getLocations() { return locationRepo.findAll(); }
    @Cacheable("lookups") public List<LeadSource> getLeadSources() { return leadSourceRepo.findAll(); }
    @Cacheable("lookups") public List<Supplier> getSuppliers() { return supplierRepo.findAll(); }
    @Cacheable("lookups") public List<Bank> getBanks() { return bankRepo.findAll(); }
}
