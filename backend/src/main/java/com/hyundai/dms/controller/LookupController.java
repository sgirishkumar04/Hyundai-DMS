package com.hyundai.dms.controller;

import com.hyundai.dms.entity.*;
import com.hyundai.dms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Provides all dropdown / lookup data for the Angular frontend.
 * Every listed endpoint is read-only (GET only).
 */
@RestController
@RequestMapping("/lookup")
@RequiredArgsConstructor
public class LookupController {

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

    @GetMapping("/roles")          public ResponseEntity<List<Role>>              roles()       { return ResponseEntity.ok(roleRepo.findAll()); }
    @GetMapping("/departments")    public ResponseEntity<List<Department>>         departments() { return ResponseEntity.ok(deptRepo.findAll()); }
    @GetMapping("/vehicle-models") public ResponseEntity<List<VehicleModel>>       models()      { return ResponseEntity.ok(modelRepo.findAll()); }
    @GetMapping("/vehicle-variants") public ResponseEntity<List<VehicleVariant>>   variants()    { return ResponseEntity.ok(variantRepo.findAll()); }
    @GetMapping("/vehicle-variants/{modelId}") public ResponseEntity<List<VehicleVariant>> variantsByModel(@PathVariable Long modelId) {
        return ResponseEntity.ok(variantRepo.findByModelId(modelId));
    }
    @GetMapping("/colors")         public ResponseEntity<List<Color>>             colors()      { return ResponseEntity.ok(colorRepo.findAll()); }
    @GetMapping("/engine-types")   public ResponseEntity<List<EngineType>>        engineTypes() { return ResponseEntity.ok(engineTypeRepo.findAll()); }
    @GetMapping("/locations")      public ResponseEntity<List<InventoryLocation>>  locations()   { return ResponseEntity.ok(locationRepo.findAll()); }
    @GetMapping("/lead-sources")   public ResponseEntity<List<LeadSource>>        leadSources() { return ResponseEntity.ok(leadSourceRepo.findAll()); }
    @GetMapping("/suppliers")      public ResponseEntity<List<Supplier>>          suppliers()   { return ResponseEntity.ok(supplierRepo.findAll()); }
    @GetMapping("/banks")          public ResponseEntity<List<Bank>>              banks()       { return ResponseEntity.ok(bankRepo.findAll()); }
}
