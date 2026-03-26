package com.hyundai.dms.repository;

import com.hyundai.dms.entity.Dealer;
import com.hyundai.dms.entity.DealerRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DealerRegistrationRepository extends JpaRepository<DealerRegistration, Long> {
    List<DealerRegistration> findByStatus(Dealer.DealerStatus status);
    boolean existsByAdminEmail(String adminEmail);
}
