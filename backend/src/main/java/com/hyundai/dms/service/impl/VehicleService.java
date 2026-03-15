package com.hyundai.dms.service.impl;

import com.hyundai.dms.dto.request.VehicleRequest;
import com.hyundai.dms.dto.response.VehicleDetailsDTO;
import com.hyundai.dms.entity.*;
import com.hyundai.dms.exception.ResourceNotFoundException;
import com.hyundai.dms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepo;
    private final BookingRepository bookingRepo;

    public Page<Vehicle> getAll(String status, Long modelId, Pageable pageable) {
        if (status != null) {
            return vehicleRepo.findByStatus(Vehicle.VehicleStatus.valueOf(status), pageable);
        }
        if (modelId != null) {
            return vehicleRepo.findAvailableByModel(modelId, pageable);
        }
        return vehicleRepo.findAll(pageable);
    }

    public Vehicle getById(Long id) {
        return vehicleRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + id));
    }

    public VehicleDetailsDTO getVehicleDetails(Long id) {
        Vehicle v = getById(id);
        
        VehicleDetailsDTO dto = VehicleDetailsDTO.builder()
            .id(v.getId())
            .vin(v.getVin())
            .engineNumber(v.getEngineNumber())
            .chassisNumber(v.getChassisNumber())
            .modelName(v.getVariant().getModel().getModelName())
            .variantName(v.getVariant().getVariantName())
            .colorName(v.getColor().getName())
            .hexCode(v.getColor().getHexCode())
            .mfgYear(v.getMfgYear())
            .mfgDate(v.getMfgDate())
            .arrivalDate(v.getArrivalDate())
            .locationName(v.getLocation().getName())
            .dealerCost(v.getDealerCost())
            .exShowroomPrice(v.getVariant().getExShowroomPrice())
            .status(v.getStatus().name())
            .build();

        Optional<Booking> bookingOpt = bookingRepo.findByVehicleId(v.getId());
        if (bookingOpt.isPresent()) {
            Booking b = bookingOpt.get();
            dto.setSalesInfo(VehicleDetailsDTO.SalesInfo.builder()
                .bookingNumber(b.getBookingNumber())
                .customerName(b.getCustomer().getFirstName() + " " + b.getCustomer().getLastName())
                .customerEmail(b.getCustomer().getEmail())
                .customerPhone(b.getCustomer().getPhone())
                .salesExecutiveName(b.getSalesExec().getFirstName() + " " + b.getSalesExec().getLastName())
                .bookingStatus(b.getStatus().name())
                .deliveryDate(b.getExpectedDelivery())
                .invoiceNumber(b.getStatus() == Booking.BookingStatus.INVOICED || b.getStatus() == Booking.BookingStatus.DELIVERED ? "INV-" + b.getBookingNumber() : null)
                .build());
        }

        return dto;
    }

    @Transactional
    public Vehicle create(VehicleRequest req) {
        if (vehicleRepo.existsByVin(req.getVin()))
            throw new IllegalArgumentException("VIN already registered: " + req.getVin());

        Vehicle v = Vehicle.builder()
            .vin(req.getVin())
            .engineNumber(req.getEngineNumber())
            .chassisNumber(req.getChassisNumber())
            .variant(VehicleVariant.builder().id(req.getVariantId()).build())
            .color(Color.builder().id(req.getColorId()).build())
            .location(InventoryLocation.builder().id(req.getLocationId()).build())
            .mfgYear(req.getMfgYear())
            .mfgDate(req.getMfgDate())
            .arrivalDate(req.getArrivalDate())
            .status(req.getStatus() != null
                ? Vehicle.VehicleStatus.valueOf(req.getStatus()) : Vehicle.VehicleStatus.IN_STOCK)
            .invoiceDate(req.getInvoiceDate())
            .dealerCost(req.getDealerCost())
            .build();
        return vehicleRepo.save(v);
    }

    @Transactional
    public Vehicle update(Long id, VehicleRequest req) {
        Vehicle v = getById(id);
        v.setVin(req.getVin());
        v.setEngineNumber(req.getEngineNumber());
        v.setChassisNumber(req.getChassisNumber());
        v.setVariant(VehicleVariant.builder().id(req.getVariantId()).build());
        v.setColor(Color.builder().id(req.getColorId()).build());
        v.setLocation(InventoryLocation.builder().id(req.getLocationId()).build());
        v.setMfgYear(req.getMfgYear());
        v.setMfgDate(req.getMfgDate());
        v.setArrivalDate(req.getArrivalDate());
        v.setStatus(Vehicle.VehicleStatus.valueOf(req.getStatus()));
        v.setDealerCost(req.getDealerCost());
        v.setInvoiceDate(req.getInvoiceDate());
        return vehicleRepo.save(v);
    }

    @Transactional
    public void delete(Long id) {
        vehicleRepo.deleteById(id);
    }

    public List<Object[]> getInventorySummary() {
        return vehicleRepo.getInventoryStatusSummary(null, null);
    }
}
